"use client";

import { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Progress } from "@/src/components/ui/progress";
import { Badge } from "@/src/components/ui/badge";
import { Sun, Shield, Clock, Users, TrendingUp, Sparkles } from "lucide-react";
import { StarterSunspot } from "@/src/components/projects/Telescopes/Sunspots";
import type { SolarEvent, CommunityProgress } from "@/types/SolarEvents";
import {
  getWeekStart,
  getWeekEnd,
  formatTimeRemaining,
  getStarName,
  calculateProgressPercentage,
  DEFAULT_DEFENSE_THRESHOLD,
  PROBE_UNLOCK_THRESHOLD
} from "@/src/utils/solarEventUtils";

export default function SolarTab() {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [currentEvent, setCurrentEvent] = useState<SolarEvent | null>(null);
  const [communityProgress, setCommunityProgress] = useState<CommunityProgress>({
    totalClassifications: 0,
    totalProbes: 0,
    userClassifications: 0,
    userProbes: 0,
    threshold: DEFAULT_DEFENSE_THRESHOLD,
    percentComplete: 0
  });
  const [loading, setLoading] = useState(true);
  const [launchingProbe, setLaunchingProbe] = useState(false);
  const [now, setNow] = useState(new Date());
  const [showClassifier, setShowClassifier] = useState(false);

  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

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
          const { data: newEvent, error: createError } = await supabase
            .from("solar_events")
            .insert({
              week_start: weekStart.toISOString().split('T')[0],
              week_end: weekEnd.toISOString().split('T')[0],
              was_defended: false
            })
            .select()
            .single();

          if (createError) throw createError;
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
        const totalProgress = (totalClassifications || 0) + totalProbes;
        const percentComplete = calculateProgressPercentage(totalProgress, DEFAULT_DEFENSE_THRESHOLD);

        setCommunityProgress({
          totalClassifications: totalClassifications || 0,
          totalProbes,
          userClassifications: userClassifications || 0,
          userProbes,
          threshold: DEFAULT_DEFENSE_THRESHOLD,
          percentComplete
        });

        // Update was_defended if threshold met
        if (percentComplete >= 100 && !event.was_defended) {
          await supabase
            .from("solar_events")
            .update({ was_defended: true })
            .eq("id", event.id);
        }

      } catch (error: any) {
        console.error("Error fetching solar event data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchEventData();
  }, [session, supabase, now]);

  const canLaunchProbe = communityProgress.userClassifications >= PROBE_UNLOCK_THRESHOLD && communityProgress.userProbes === 0;

  async function handleLaunchProbe() {
    if (!session?.user?.id || !currentEvent || !canLaunchProbe) return;

    setLaunchingProbe(true);
    try {
      const { error } = await supabase
        .from("defensive_probes")
        .insert({
          event_id: currentEvent.id,
          user_id: session.user.id,
          count: 1
        });

      if (error) throw error;

      // Refresh progress
      setCommunityProgress(prev => ({
        ...prev,
        userProbes: 1,
        totalProbes: prev.totalProbes + 1,
        percentComplete: calculateProgressPercentage(
          prev.totalClassifications + prev.totalProbes + 1,
          prev.threshold
        )
      }));

    } catch (error: any) {
      console.error("Error launching probe:", error);
    } finally {
      setLaunchingProbe(false);
    }
  }

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

  return (
    <div className="space-y-6">
      {/* Mission Header */}
      <Card className="border-[#78cce2]/30 bg-gradient-to-br from-orange-500/10 to-yellow-500/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-orange-500/20">
                <Sun className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <CardTitle className="text-xl">Weekly Solar Mission</CardTitle>
                <CardDescription>Observing {starName}</CardDescription>
              </div>
            </div>
            <Badge variant={defended ? "default" : "destructive"} className="text-xs">
              {defended ? (
                <><Shield className="w-3 h-3 mr-1" /> Defended</>
              ) : (
                <><Clock className="w-3 h-3 mr-1" /> {formatTimeRemaining(weekEnd)}</>
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Tutorial/Mission Briefing */}
          <div className="p-4 rounded-lg bg-background/60 backdrop-blur-sm border border-[#78cce2]/20">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#78cce2]" />
              Mission Brief
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Each week, we observe a new G-type star for solar activity. Your mission is to classify sunspot images 
              to help stabilize the star and protect our fleet from solar flares. Contribute at least {PROBE_UNLOCK_THRESHOLD} classifications 
              to launch defensive probes. If the community reaches {communityProgress.threshold} combined contributions, 
              the fleet is defended and automata operate normally. Otherwise, all deployed structures face a 50% delay penalty next week.
            </p>
          </div>

          {/* Community Progress */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#78cce2]" />
                Community Progress
              </span>
              <span className="font-mono">
                {communityProgress.totalClassifications + communityProgress.totalProbes} / {communityProgress.threshold}
              </span>
            </div>
            <Progress value={communityProgress.percentComplete} className="h-2" />
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-background/40 border border-[#78cce2]/20">
                <div className="text-muted-foreground mb-1">Classifications</div>
                <div className="text-lg font-bold">{communityProgress.totalClassifications}</div>
              </div>
              <div className="p-3 rounded-lg bg-background/40 border border-[#78cce2]/20">
                <div className="text-muted-foreground mb-1">Probes Launched</div>
                <div className="text-lg font-bold">{communityProgress.totalProbes}</div>
              </div>
            </div>
          </div>

          {/* User Progress */}
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Your Contribution
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <div className="text-muted-foreground mb-1">Your Classifications</div>
                <div className="text-2xl font-bold">{communityProgress.userClassifications}</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Your Probes</div>
                <div className="text-2xl font-bold">{communityProgress.userProbes}</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={() => setShowClassifier(true)}
              className="flex-1"
              variant="default"
            >
              <Sun className="w-4 h-4 mr-2" />
              Classify Sunspots
            </Button>
            
            {communityProgress.userClassifications >= PROBE_UNLOCK_THRESHOLD && (
              <Button
                onClick={handleLaunchProbe}
                disabled={launchingProbe || communityProgress.userProbes > 0}
                variant="outline"
                className="flex-1"
              >
                <Shield className="w-4 h-4 mr-2" />
                {communityProgress.userProbes > 0 ? "Probe Launched" : "Launch Probe"}
              </Button>
            )}
          </div>

          {communityProgress.userClassifications < PROBE_UNLOCK_THRESHOLD && (
            <p className="text-xs text-muted-foreground text-center">
              Complete {PROBE_UNLOCK_THRESHOLD - communityProgress.userClassifications} more classifications to unlock defensive probes
            </p>
          )}
        </CardContent>
      </Card>

      {/* Sunspot Classifier */}
      {showClassifier && (
        <Card className="border-[#78cce2]/30">
          <CardHeader>
            <CardTitle className="text-lg">Sunspot Classification</CardTitle>
            <CardDescription>Count and annotate sunspots in the image</CardDescription>
          </CardHeader>
          <CardContent>
            <StarterSunspot />
          </CardContent>
        </Card>
      )}

      {/* Status Messages */}
      {defended && (
        <Card className="border-green-500/50 bg-green-500/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-green-400" />
              <div>
                <h3 className="font-semibold text-green-400">Fleet Defended!</h3>
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
