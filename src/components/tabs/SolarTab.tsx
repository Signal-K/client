"use client";

import { useEffect, useState, Suspense, useMemo } from "react";
import { useSupabaseClient, useSession } from "@/src/lib/auth/session-context";
import { useRouter } from "next/navigation";
import { usePostHog } from 'posthog-js/react';
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Progress } from "@/src/components/ui/progress";
import { Badge } from "@/src/components/ui/badge";
import { Sun as SunIcon, Shield, Clock, Users, TrendingUp, Sparkles, Rocket, Trophy } from "lucide-react";
import { Sun } from "@/src/components/discovery/data-sources/Solar/Sun";
import type { SolarEvent, CommunityProgress } from "@/types/SolarEvents";
import {
  getWeekStart,
  getWeekEnd,
  getStarName,
  calculateProgressPercentage,
  PROBE_UNLOCK_THRESHOLD
} from "@/src/utils/solarEventUtils";

const COMMUNITY_THRESHOLD = 10;
const CLASSIFICATION_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

function Sun3D({ sunspots }: { sunspots: number }) {
  return <Sun sunspots={sunspots} />;
}

// Sunspot Classifier Component
interface SunspotClassifierProps {
  onBack: () => void;
  weekStart: string;
}

function SunspotClassifier({ onBack, weekStart }: SunspotClassifierProps) {
  const supabase = useSupabaseClient();
  const session = useSession();
  const [anomaly, setAnomaly] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTutorial, setShowTutorial] = useState(true);
  const [sunspotCount, setSunspotCount] = useState("");
  const [shapeDescription, setShapeDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [annotations, setAnnotations] = useState<any[]>([]);

  // Get random observation date between week start and now
  const observationDate = useMemo(() => {
    const start = new Date(weekStart);
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    const randomTime = start.getTime() + Math.random() * diff;
    return new Date(randomTime);
  }, [weekStart]);

  useEffect(() => {
    async function fetchRandomAnomaly() {
      try {
        // Get random sunspot anomaly - correct anomalySet value
        const { data: anomalies, error } = await supabase
          .from("anomalies")
          .select("*")
          .eq("anomalySet", "sunspot");

        

        if (anomalies && anomalies.length > 0) {
          const randomIndex = Math.floor(Math.random() * anomalies.length);
          const selectedAnomaly = anomalies[randomIndex];
          
          setAnomaly(selectedAnomaly);
        } else {
          console.warn("No sunspot anomalies found");
        }
      } catch (error) {
        console.error("Error fetching anomaly:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchRandomAnomaly();
  }, [supabase]);

  const posthog = usePostHog();

  async function handleSubmit() {
    if (!session?.user?.id || !anomaly || !sunspotCount) return;

    posthog?.capture('sunspot_classification_submitted', {
      anomaly_id: anomaly.id,
      sunspot_count: parseInt(sunspotCount),
      has_shape_description: !!shapeDescription,
      has_annotations: annotations.length > 0,
      observation_date: observationDate.toISOString(),
    });

    setSubmitting(true);
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const imageUrl = anomaly.avatar_url 
        ? `${supabaseUrl}/storage/v1/object/public/${anomaly.avatar_url}`
        : `${supabaseUrl}/storage/v1/object/public/telescope/telescope-sunspots/${anomaly.id}.png`;

      

      const response = await fetch("/api/gameplay/classifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          anomaly: anomaly.id,
          classificationtype: "sunspot",
          content: `Count: ${sunspotCount}. Shape: ${shapeDescription || 'Not described'}`,
          media: {
            imageUrl,
            annotations: annotations
          },
          classificationConfiguration: {
            sunspotCount: parseInt(sunspotCount),
            shapeDescription,
            observationDate: observationDate.toISOString(),
            annotations
          }
        }),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        console.error("Classification API error:", payload?.error);
        throw new Error(payload?.error || "Failed to submit classification");
      }

      
      alert("Classification submitted! Thank you for your contribution.");
      onBack();
    } catch (error: any) {
      console.error("Error submitting classification:", error);
      alert(`Error submitting classification: ${error.message || 'Please try again.'}`);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-muted-foreground">Loading sunspot data...</div>
        </CardContent>
      </Card>
    );
  }

  if (!anomaly) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-muted-foreground">No sunspot data available</div>
          <Button onClick={onBack} className="mt-4">Go Back</Button>
        </CardContent>
      </Card>
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Use avatar_url from anomaly data instead of constructing from ID
  const imageUrl = anomaly.avatar_url 
    ? `${supabaseUrl}/storage/v1/object/public/${anomaly.avatar_url}`
    : `${supabaseUrl}/storage/v1/object/public/telescope/telescope-sunspots/${anomaly.id}.png`;

  if (showTutorial) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Sunspot Classification Tutorial</CardTitle>
            <Button variant="ghost" size="sm" onClick={onBack}>✕</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/30">
            <h3 className="font-semibold text-sm mb-1 flex items-center gap-2">
              <SunIcon className="w-4 h-4" />
              About This Observation
            </h3>
            <p className="text-xs text-muted-foreground">
              This sunspot image was captured by community probes on <strong>{observationDate.toLocaleDateString()}</strong> at{" "}
              <strong>{observationDate.toLocaleTimeString()}</strong>. Your task is to count and describe the sunspots visible in this observation.
            </p>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2 rounded-lg bg-background/60 border border-[#78cce2]/20">
              <h4 className="font-semibold mb-1">What are Sunspots?</h4>
              <p className="text-muted-foreground">Dark markings that represent solar features, including small dots and larger structures.</p>
            </div>

            <div className="p-2 rounded-lg bg-background/60 border border-[#78cce2]/20">
              <h4 className="font-semibold mb-1">How to Count</h4>
              <p className="text-muted-foreground">Count all dark markings, but avoid lines, writings, and smudges from the imaging process.</p>
            </div>

            <div className="p-2 rounded-lg bg-background/60 border border-[#78cce2]/20">
              <h4 className="font-semibold mb-1">Annotate</h4>
              <p className="text-muted-foreground">Draw circles around each sunspot to help verify your count.</p>
            </div>
          </div>

          <Button onClick={() => setShowTutorial(false)} className="w-full" size="sm">
            Start Classification
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Classify Sunspots</CardTitle>
              <CardDescription className="text-xs">
                Observation from {observationDate.toLocaleDateString()} at {observationDate.toLocaleTimeString()}
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onBack}>← Back</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Image Display */}
          <div className="relative rounded-lg overflow-hidden bg-white p-2">
            <img
              src={imageUrl}
              alt="Sunspot observation"
              className="w-full h-auto max-h-64 object-contain"
            />
          </div>

          {/* Input Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">
                Sunspot Count <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={sunspotCount}
                onChange={(e) => setSunspotCount(e.target.value)}
                placeholder="Enter number of sunspots"
                className="w-full px-2 py-1.5 text-sm rounded-lg border border-[#78cce2]/30 bg-background/60 focus:outline-none focus:ring-2 focus:ring-[#78cce2]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">
                Shape Description
              </label>
              <input
                type="text"
                value={shapeDescription}
                onChange={(e) => setShapeDescription(e.target.value)}
                placeholder="e.g., circular, elongated, clustered"
                className="w-full px-2 py-1.5 text-sm rounded-lg border border-[#78cce2]/30 bg-background/60 focus:outline-none focus:ring-2 focus:ring-[#78cce2]"
              />
            </div>
          </div>

          {/* Annotation Instructions */}
          <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-xs">
            <p className="text-muted-foreground">
              <strong>Tip:</strong> Use the full ImageAnnotator component for drawing circles around sunspots. 
              For now, enter your count and description above.
            </p>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={submitting || !sunspotCount}
            className="w-full"
            size="sm"
          >
            {submitting ? "Submitting..." : "Submit Classification"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Get AEST time (UTC+10 or UTC+11 depending on daylight saving)
function getAESTTime(date: Date = new Date()): Date {
  // AEST is UTC+10, AEDT is UTC+11
  // For simplicity, using UTC+10 (adjust if needed for daylight saving)
  const aestOffset = 10 * 60; // minutes
  const utcTime = date.getTime() + (date.getTimezoneOffset() * 60000);
  return new Date(utcTime + (aestOffset * 60000));
}

function getWeekEndAEST(): Date {
  const now = getAESTTime();
  const weekStart = new Date(now);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Sunday
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);
  return weekEnd;
}

function formatTimeRemainingAEST(): string {
  const now = getAESTTime();
  const weekEnd = getWeekEndAEST();
  const diff = weekEnd.getTime() - now.getTime();
  
  if (diff <= 0) return "Week ended";
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

interface SolarTabProps {
  onExpandedChange?: (expanded: boolean) => void;
}

export default function SolarTab({ onExpandedChange }: SolarTabProps = {}) {
  const supabase = useSupabaseClient();
  const session = useSession();
  const router = useRouter();

  const [currentEvent, setCurrentEvent] = useState<SolarEvent | null>(null);
  const [communityProgress, setCommunityProgress] = useState<CommunityProgress>({
    totalClassifications: 0,
    totalProbes: 0,
    userClassifications: 0,
    userProbes: 0,
    threshold: COMMUNITY_THRESHOLD,
    percentComplete: 0
  });
  const [loading, setLoading] = useState(true);
  const [launchingProbe, setLaunchingProbe] = useState(false);
  const [now, setNow] = useState(new Date());
  const [showClassifier, setShowClassifier] = useState(false);
  const [lastClassificationTime, setLastClassificationTime] = useState<Date | null>(null);
  const [canClassify, setCanClassify] = useState(true);
  const [probeAnimation, setProbeAnimation] = useState(false);

  // Notify parent when entering/exiting classification mode
  useEffect(() => {
    onExpandedChange?.(showClassifier);
  }, [showClassifier, onExpandedChange]);

  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Check classification cooldown
  useEffect(() => {
    async function checkCooldown() {
      if (!session?.user?.id) return;
      
      const { data: lastClassification } = await supabase
        .from("classifications")
        .select("created_at")
        .eq("author", session.user.id)
        .eq("classificationtype", "sunspot")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (lastClassification) {
        const lastTime = new Date(lastClassification.created_at);
        setLastClassificationTime(lastTime);
        const timeSince = Date.now() - lastTime.getTime();
        setCanClassify(timeSince >= CLASSIFICATION_COOLDOWN_MS);
      }
    }
    
    checkCooldown();
    const interval = setInterval(checkCooldown, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [session, supabase]);

  // Fetch current solar event and progress
  useEffect(() => {
    async function fetchEventData() {
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }

      try {
        const weekStart = getWeekStart(now);
        const weekEnd = getWeekEnd(now);

        // Get or create current week's event
        let { data: event, error: eventError } = await supabase
          .from("solar_events")
          .select("*")
          .gte("week_end", now.toISOString())
          .order("week_start", { ascending: false })
          .limit(1)
          .single();

        // If no event exists for this week, create one
        if (!event) {
          const ensureResponse = await fetch("/api/gameplay/solar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "ensure_event",
              weekStart: weekStart.toISOString().split("T")[0],
              weekEnd: weekEnd.toISOString().split("T")[0],
            }),
          });
          const newEvent = await ensureResponse.json().catch(() => ({}));
          if (!ensureResponse.ok) throw new Error(newEvent?.error || "Failed to create solar event");
          event = newEvent;
        }

        setCurrentEvent(event);

        if (!event) {
          setLoading(false);
          return;
        }

        // Fetch community classification count (all sunspot classifications this week)
        const { count: totalClassifications } = await supabase
          .from("classifications")
          .select("*", { count: "exact", head: true })
          .eq("classificationtype", "sunspot")
          .gte("created_at", event.week_start);

        // Fetch user's classification count
        const { count: userClassifications } = await supabase
          .from("classifications")
          .select("*", { count: "exact", head: true })
          .eq("classificationtype", "sunspot")
          .eq("author", session.user.id)
          .gte("created_at", event.week_start);

        // Fetch total probes launched
        const { data: probeData } = await supabase
          .from("defensive_probes")
          .select("count")
          .eq("event_id", event.id);

        const totalProbes = probeData?.reduce((sum, p) => sum + (p.count || 0), 0) || 0;

        // Fetch user's probes
        const { data: userProbeData } = await supabase
          .from("defensive_probes")
          .select("count")
          .eq("event_id", event.id)
          .eq("user_id", session.user.id);

        const userProbes = userProbeData?.reduce((sum, p) => sum + (p.count || 0), 0) || 0;

        // Calculate progress
        const totalProgress = (totalClassifications || 0);
        const percentComplete = calculateProgressPercentage(totalProgress, COMMUNITY_THRESHOLD);

        setCommunityProgress({
          totalClassifications: totalClassifications || 0,
          totalProbes,
          userClassifications: userClassifications || 0,
          userProbes,
          threshold: COMMUNITY_THRESHOLD,
          percentComplete
        });

        // Update was_defended if threshold met
        if (percentComplete >= 100 && !event.was_defended) {
          await fetch("/api/gameplay/solar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "mark_defended",
              eventId: event.id,
            }),
          });
        }

      } catch (error: any) {
        console.error("Error fetching solar event data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchEventData();
  }, [session, supabase, now]);

  const canLaunchProbe = communityProgress.totalClassifications >= COMMUNITY_THRESHOLD;

  const posthog = usePostHog();

  async function handleLaunchProbe() {
    if (!session?.user?.id || !currentEvent || !canLaunchProbe) return;

    // Check if user already launched in the last hour
    const { data: recentProbes } = await supabase
      .from("defensive_probes")
      .select("launched_at")
      .eq("event_id", currentEvent.id)
      .eq("user_id", session.user.id)
      .order("launched_at", { ascending: false })
      .limit(1)
      .single();

    if (recentProbes) {
      const timeSince = Date.now() - new Date(recentProbes.launched_at).getTime();
      if (timeSince < 60 * 60 * 1000) {
        posthog?.capture('probe_launch_rate_limited');
        alert("You can only deploy one probe per hour!");
        return;
      }
    }

    posthog?.capture('defensive_probe_launched', {
      event_id: currentEvent.id,
      user_total_probes: communityProgress.userProbes + 1,
      community_total_probes: communityProgress.totalProbes + 1,
    });

    setLaunchingProbe(true);
    setProbeAnimation(true);
    
    try {
      const probeResponse = await fetch("/api/gameplay/solar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "launch_probe",
          eventId: currentEvent.id,
          count: 1,
        }),
      });
      const probePayload = await probeResponse.json().catch(() => ({}));
      if (!probeResponse.ok) throw new Error(probePayload?.error || "Failed to launch probe");

      // Refresh progress
      setCommunityProgress(prev => ({
        ...prev,
        userProbes: prev.userProbes + 1,
        totalProbes: prev.totalProbes + 1,
      }));

      setTimeout(() => setProbeAnimation(false), 3000);

    } catch (error: any) {
      console.error("Error launching probe:", error);
      setProbeAnimation(false);
    } finally {
      setLaunchingProbe(false);
    }
  }

  const cooldownRemaining = lastClassificationTime 
    ? Math.max(0, CLASSIFICATION_COOLDOWN_MS - (Date.now() - lastClassificationTime.getTime()))
    : 0;
  const cooldownMinutes = Math.ceil(cooldownRemaining / 60000);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading solar event data...</div>
      </div>
    );
  }

  if (!currentEvent) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">No active solar event</div>
      </div>
    );
  }

  const weekEnd = new Date(currentEvent.week_end);
  const starName = getStarName(new Date(currentEvent.week_start));
  const defended = currentEvent.was_defended || communityProgress.percentComplete >= 100;

  if (showClassifier) {
    return <SunspotClassifier onBack={() => setShowClassifier(false)} weekStart={currentEvent.week_start} />;
  }

  return (
    <div className="space-y-4">
      {/* 3D Sun Visualization */}
      <Card className="border-[#78cce2]/30 bg-gradient-to-br from-orange-500/10 to-yellow-500/10">
        <CardContent className="p-0">
          <div className="relative w-full h-48 md:h-64">
            <Canvas camera={{ position: [0, 0, 8], fov: 50 }} className="w-full h-full">
              <ambientLight intensity={0.7} />
              <pointLight position={[0, 0, 10]} intensity={2} color="#FFD700" />
              <Suspense fallback={null}>
                <Sun3D sunspots={communityProgress.totalClassifications} />
              </Suspense>
              <Stars radius={10} depth={20} count={100} factor={0.5} saturation={0.5} fade speed={1} />
              <OrbitControls enablePan={false} enableZoom={false} enableRotate={true} />
            </Canvas>
            
            {/* Overlay info */}
            <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
              <div className="bg-black/60 backdrop-blur-sm rounded-lg p-2">
                <div className="text-xs text-gray-300">Observing</div>
                <div className="text-sm font-bold text-orange-300">{starName}</div>
              </div>
              <Badge variant={defended ? "default" : "destructive"} className="text-xs">
                {defended ? (
                  <><Shield className="w-3 h-3 mr-1" /> Defended</>
                ) : (
                  <><Clock className="w-3 h-3 mr-1" /> {formatTimeRemainingAEST()}</>
                )}
              </Badge>
            </div>
            
            <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-sm rounded-lg p-2">
              <div className="text-xs text-gray-300">Active Sunspots</div>
              <div className="text-xl font-bold text-orange-300">{communityProgress.totalClassifications}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mission Progress */}
      <Card className="border-[#78cce2]/30">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <SunIcon className="w-4 h-4 text-orange-400" />
                Weekly Solar Mission
              </CardTitle>
              <CardDescription className="text-xs">Protect the fleet from solar flares</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Mission Brief */}
          <div className="p-3 rounded-lg bg-background/60 backdrop-blur-sm border border-[#78cce2]/20">
            <h3 className="text-xs font-semibold mb-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#78cce2]" />
              Mission Brief
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Monitor sunspot activity on {starName}. The community needs {COMMUNITY_THRESHOLD} total classifications 
              to deploy defensive probes. Time remaining: {formatTimeRemainingAEST()} (AEST)
            </p>
          </div>

          {/* Community Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3 text-[#78cce2]" />
                Community Progress
              </span>
              <span className="font-mono text-xs">
                {communityProgress.totalClassifications} / {communityProgress.threshold}
              </span>
            </div>
            <Progress value={communityProgress.percentComplete} className="h-1.5" />
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-background/40 border border-[#78cce2]/20">
                <div className="text-muted-foreground text-xs mb-0.5">Classifications</div>
                <div className="text-base font-bold">{communityProgress.totalClassifications}</div>
              </div>
              <div className="p-2 rounded-lg bg-background/40 border border-[#78cce2]/20">
                <div className="text-muted-foreground text-xs mb-0.5">Probes Deployed</div>
                <div className="text-base font-bold">{communityProgress.totalProbes}</div>
              </div>
            </div>
          </div>

          {/* User Progress */}
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/30">
            <h3 className="text-xs font-semibold mb-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Your Contribution
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <div className="text-muted-foreground text-xs mb-0.5">Your Classifications</div>
                <div className="text-lg font-bold">{communityProgress.userClassifications}</div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs mb-0.5">Your Probes</div>
                <div className="text-lg font-bold">{communityProgress.userProbes}</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-2">
            <Button
              onClick={() => {
                posthog?.capture('sunspot_classifier_opened', {
                  classifications_this_week: communityProgress.userClassifications,
                });
                setShowClassifier(true);
              }}
              className="h-9 col-span-2"
              variant="default"
              disabled={!canClassify}
              size="sm"
            >
              <SunIcon className="w-3 h-3 mr-1" />
              {!canClassify ? `Cooldown: ${cooldownMinutes}m` : "Count Sunspots"}
            </Button>
            
            <Button
              onClick={() => {
                posthog?.capture('leaderboard_viewed', { leaderboard_type: 'sunspots' });
                router.push('/leaderboards/sunspots');
              }}
              variant="outline"
              className="h-9"
              size="sm"
            >
              <Trophy className="w-3 h-3" />
            </Button>
          </div>

          {canLaunchProbe && (
            <Button
              onClick={handleLaunchProbe}
              disabled={launchingProbe}
              variant="outline"
              className="w-full h-9 relative overflow-hidden"
              size="sm"
            >
              <Shield className="w-3 h-3 mr-1" />
              Deploy Probe
              {probeAnimation && (
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
              )}
            </Button>
          )}

          {!canClassify && (
            <p className="text-xs text-muted-foreground text-center">
              Wait {cooldownMinutes} minute{cooldownMinutes !== 1 ? 's' : ''} before next classification
            </p>
          )}
          
          {!canLaunchProbe && (
            <p className="text-xs text-muted-foreground text-center">
              {COMMUNITY_THRESHOLD - communityProgress.totalClassifications} more community classifications needed to deploy probes
            </p>
          )}
        </CardContent>
      </Card>

      {/* Status Messages */}
      {defended && (
        <Card className="border-green-500/50 bg-green-500/10">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-400" />
              <div>
                <h3 className="font-semibold text-sm text-green-400">Fleet Defended!</h3>
                <p className="text-xs text-muted-foreground">
                  The community successfully protected all structures from solar flares.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
