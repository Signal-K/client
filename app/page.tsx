"use client";

import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";
import { Bell, Telescope, Sun, Moon, User } from "lucide-react";
import { subDays } from "date-fns";
import Link from "next/link";

import ActivityHeader from "@/components/(scenes)/deploy/ActivityHeader";
import LandingSS from "./auth/landing";
import NPSPopup from "@/lib/helper/nps-popup";
import RecentActivity from "@/components/Data/RecentActivity";
import RecentDiscoveries from "@/components/Data/RecentDiscoveries";
import TipsPanel from "@/components/Structures/Missions/Milestones/NextStepsTips";
import CompleteProfileForm from "@/components/Account/FinishProfile";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import WeeklyBanner from "@/components/ui/update-banner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import MilestoneCard from "@/components/Structures/Missions/Milestones/MilestonesNewUi";

export interface LinkedAnomaly {
  id: number;
  anomaly_id: number;
  date: string;
  anomaly: {
    content: string | null;
    anomalytype: string | null;
    anomalySet: string | null;
  } | null;
}

interface CommentVote {
  type: "comment" | "vote";
  created_at: string;
  content?: string;
  vote_type?: string;
  classification_id: number;
}

export interface Classification {
  id: number;
  classificationtype: string | null;
  content: string | null;
  created_at: string;
  anomaly: {
    content: string | null;
  } | null;
}

interface OtherClassification {
  id: number;
  classificationtype: string | null;
  content: string | null;
  author: string;
  created_at: string;
};

interface PlanetClassification {
  id: number;
  anomaly: {
    content: string | null;
  } | null;
};

interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  classificationPoints: number | null;
}

export default function ActivityPage() {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [linkedAnomalies, setLinkedAnomalies] = useState<LinkedAnomaly[]>([]);
  const [activityFeed, setActivityFeed] = useState<CommentVote[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [classifications, setClassifications] = useState<Classification[]>([]);
  const [otherClassifications, setOtherClassifications] = useState<OtherClassification[]>([]);
  const [incompletePlanet, setIncompletePlanet] = useState<Classification | null>(null);
  const [landmarksExpanded, setLandmarksExpanded] = useState(false);
  const [showNpsModal, setShowNpsModal] = useState(false);
  const [hasCheckedNps, setHasCheckedNps] = useState(false);
  const [showTipsPanel, setShowTipsPanel] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [activeSatelliteMessage, setActiveSatelliteMessage] = useState<string | null>(null);
  const [planetTargets, setPlanetTargets] = useState<{ id: number; name: string }[]>([]);

  const handleThemeToggle = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark", !isDark);
  };

  // Define handleSendSatellite function
  const handleSendSatellite = async (classificationId: number) => {
    if (!session) return;
    
    const userId = session.user.id;

    // Step 1: Get random cloud anomaly
    const { data: cloudAnomalies, error } = await supabase
      .from("anomalies")
      .select("id")
      .eq("anomalytype", "cloud");

    if (error || !cloudAnomalies || cloudAnomalies.length === 0) return;

    const randomIndex = Math.floor(Math.random() * cloudAnomalies.length);
    const selectedAnomaly = cloudAnomalies[randomIndex];

    const insertPayload = [
      {
        author: userId,
        anomaly_id: selectedAnomaly.id,
        classification_id: classificationId,
        automaton: "WeatherSatellite",
      },
      {
        author: userId,
        anomaly_id: selectedAnomaly.id,
        classification_id: classificationId,
        automaton: "WeatherSatellite",
      },
    ];

    await supabase.from("linked_anomalies").insert(insertPayload);
  };

  // Define checkActiveSatellite function
  const checkActiveSatellite = async () => {
    if (!session) return;
    
    const userId = session.user.id;
    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysSinceSunday = dayOfWeek;
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - daysSinceSunday);
    startOfWeek.setHours(0, 0, 0, 0);

    const { data: existingLinks } = await supabase
      .from("linked_anomalies")
      .select("classification_id, anomaly:anomaly_id(content)")
      .eq("author", userId)
      .eq("automaton", "WeatherSatellite")
      .gte("date", startOfWeek.toISOString());

    if (existingLinks && existingLinks.length > 0) {
      const anomaly = Array.isArray(existingLinks[0].anomaly) ? existingLinks[0].anomaly[0] : existingLinks[0].anomaly;
      const planetName = anomaly?.content ?? "a planet";
      setActiveSatelliteMessage(`Your satellite is currently exploring the planet ${planetName}`);
    }
  };

  useEffect(() => {
    if (!session) return;

    checkActiveSatellite();

    const fetchPlanets = async () => {
      const userId = session?.user.id;
      if (!userId) return;

      // Step 1: Fetch classifications of type 'planet'
      const { data } = await supabase
        .from("classifications")
        .select("id, anomaly:anomaly(content)")
        .eq("author", userId)
        .eq("classificationtype", "planet");

      const planetClassifications = data as PlanetClassification[] | null;
      const planetIds = (planetClassifications ?? []).map((c) => c.id);

      if (planetIds.length === 0) {
        setPlanetTargets([]);
        return;
      }

      // Step 2: Fetch comments with category 'Radius'
      const { data: radiusComments } = await supabase
        .from("comments")
        .select("classification_id")
        .eq("category", "Radius")
        .in("classification_id", planetIds);

      const planetIdsWithRadius = new Set((radiusComments ?? []).map((c) => c.classification_id));

      const validPlanets = (planetClassifications ?? [])
        .filter((c) => planetIdsWithRadius.has(c.id))
        .map((c) => ({
          id: c.id,
          name: c.anomaly?.content ?? `Planet #${c.id}`,
        }));

      setPlanetTargets(validPlanets);
    };

    fetchPlanets();

    const fetchData = async () => {
      const userId = session.user.id;

      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, username, full_name, classificationPoints")
        .eq("id", userId)
        .maybeSingle();
      setProfile(profileData);

      const { data: myClassifications } = await supabase
        .from("classifications")
        .select(`
          id, 
          classificationtype, 
          content, 
          created_at, 
          anomaly,
          anomaly:anomaly(content)
        `)
        .eq("author", userId)
        .order("created_at", { ascending: false })
        .limit(10);
      
      // Transform the data to match our interface
      const transformedClassifications = (myClassifications ?? []).map(c => ({
        ...c,
        anomaly: Array.isArray(c.anomaly) ? c.anomaly[0] : c.anomaly
      }));
      setClassifications(transformedClassifications);

      // Get all anomaly IDs that have been classified by this user
      const { data: userClassifications } = await supabase
        .from("classifications")
        .select("anomaly")
        .eq("author", userId);

      const classifiedAnomalyIds = new Set(
        (userClassifications ?? [])
          .map(c => c.anomaly)
          .filter((id): id is number => !!id)
      );

      const { data: rawLinked } = await supabase
        .from("linked_anomalies")
        .select(`
          id,
          anomaly_id,
          date,
          anomaly:anomaly_id(
            content,
            anomalytype,
            anomalySet
          )
        `)
        .eq("author", userId)
        .order("date", { ascending: false });

      const linked = (rawLinked ?? []) as unknown as LinkedAnomaly[];
      // Filter out linked anomalies that have already been classified by the user
      const filteredLinked = linked.filter((a) => !classifiedAnomalyIds.has(a.anomaly_id));
      setLinkedAnomalies(filteredLinked);

      const oneWeekAgo = subDays(new Date(), 7).toISOString();

      const { data: comments } = await supabase
        .from("comments")
        .select("created_at, content, classification_id, category")
        .in("classification_id", myClassifications?.map((c) => c.id) ?? [])
        .gte("created_at", oneWeekAgo);

      const { data: votes } = await supabase
        .from("votes")
        .select("created_at, vote_type, classification_id")
        .in("classification_id", myClassifications?.map((c) => c.id) ?? [])
        .gte("created_at", oneWeekAgo);

      const allActivity: CommentVote[] = [];
      if (comments) allActivity.push(...comments.map((c) => ({ type: "comment" as const, ...c })));
      if (votes) allActivity.push(...votes.map((v) => ({ type: "vote" as const, ...v })));

      setActivityFeed(
        allActivity.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      );

      const { data: others } = await supabase
        .from("classifications")
        .select("id, classificationtype, content, author, created_at")
        .neq("author", userId)
        .order("created_at", { ascending: false })
        .limit(20);
      setOtherClassifications(others ?? []);

      // 🔍 Find the most recent planet classification without a Radius comment
      const planetClassifications = transformedClassifications.filter((c) => c.classificationtype === 'planet');
      const classifiedIdsWithRadius = new Set(
        (comments ?? [])
          .filter((c) => c.category === 'Radius')
          .map((c) => c.classification_id)
      );

      const mostRecentUnfinishedPlanet = planetClassifications.find(
        (c) => !classifiedIdsWithRadius.has(c.id)
      );

      setIncompletePlanet(mostRecentUnfinishedPlanet ?? null);
    };

    const scheduleNpsCheck = () => {
      if (hasCheckedNps) return;
      const timer = setTimeout(async () => {
        const { data, error } = await supabase
          .from("nps_surveys")
          .select("id")
          .eq("user_id", session.user.id);
        if (!error && Array.isArray(data) && data.length === 0) {
          setShowNpsModal(true);
        }
        setHasCheckedNps(true);
      }, 15000);
      return () => clearTimeout(timer);
    };

    fetchData();
    scheduleNpsCheck();
  }, [session, supabase, hasCheckedNps]);

  if (!session) return <LandingSS />;

  const needsProfileSetup = !profile?.username || !profile?.full_name;

  return (
    <div className="min-h-screen w-full bg-background flex justify-center pb-20">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between px-4 lg:px-6 py-3 gap-4 sm:gap-0">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <h1 className="text-xl font-bold text-primary">Star Sailors</h1>
            {/* <div className="hidden sm:flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-chart-1 rounded-full"></div>
              <span className="text-chart-2">8.4</span>
              <span className="text-chart-3">2 h</span>
              <span className="text-chart-4">15 min</span>
              <span className="text-chart-5">32 sec</span>
              <span className="text-foreground">data history</span>
            </div> */}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-chart-2" />
              <Switch checked={isDark} onCheckedChange={handleThemeToggle} />
              <Moon className="w-4 h-4 text-chart-4" />
            </div>
            <button
              aria-label="Toggle notifications"
              onClick={() => setNotificationsOpen((open) => !open)}
              className="relative p-2 rounded-full hover:bg-muted transition"
            >
              <Bell className="w-6 h-6 text-chart-5" />
              {activityFeed.length > 0 && (
                <>
                  <span className="absolute top-1 right-1 block w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  <span className="absolute top-1 right-1 block w-2 h-2 rounded-full bg-red-600" />
                </>
              )}
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative h-8 w-8 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-chart-3" />
                  <span className="sr-only">Open user menu</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  {/* <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Teddy Martin</p>
                    <p className="text-xs leading-none text-muted-foreground">ted@tmartin.com</p>
                  </div> */}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Notification Panel */}
        {notificationsOpen && (
          <div className="fixed top-[60px] right-4 sm:right-6 w-full sm:w-[420px] max-h-[80vh] overflow-y-auto rounded-xl bg-card border border-border shadow-xl z-40">
            <RecentActivity
              activityFeed={activityFeed}
              otherClassifications={otherClassifications}
              isInsidePanel={true}
            />
          </div>
        )}
      </div>

      <div className="w-full max-w-screen-xl px-4 py-6 space-y-10 pt-24">
        <ActivityHeader
          scrolled={true}
          landmarksExpanded={landmarksExpanded}
          onToggleLandmarks={() => setLandmarksExpanded((prev) => !prev)}
        />

        <RecentDiscoveries
          classifications={classifications}
          linkedAnomalies={linkedAnomalies}
          incompletePlanet={incompletePlanet}
        />

        <MilestoneCard />

        {needsProfileSetup ? (
          <section className="rounded-2xl p-6 border shadow space-y-4 text-center bg-card text-card-foreground">
            <h3 className="text-xl font-semibold text-primary">Finish setting up your account</h3>
            <p className="text-sm text-muted-foreground">
              Unlock Structures, Research, and referral features by completing your profile.
            </p>
            <button
              onClick={() => setShowProfileModal(true)}
              className="mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition"
            >
              Complete your profile
            </button>
          </section>
        ) : (
          <section className="rounded-2xl border bg-card text-card-foreground shadow p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Telescope className="text-primary" />
                <h3 className="font-semibold text-lg">Structures & Research</h3>
              </div>
            </div>

            <div className="space-y-3">
              {/* Telescope Block */}
              <div className="rounded-xl border bg-popover text-popover-foreground p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Telescope Array</p>
                    <p className="text-sm text-muted-foreground">
                      Enhances classification of distant light curves and planet candidates.
                    </p>
                  </div>
                  <Link
                    href="/activity/deploy"
                    className="text-sm font-medium rounded px-3 py-1 bg-primary text-primary-foreground hover:opacity-90 transition"
                  >
                    Deploy
                  </Link>
                </div>
              </div>

              {/* Satellites Block */}
              <div className="rounded-xl border bg-popover text-popover-foreground p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium text-foreground">Satellites</p>
                    <p className="text-sm text-muted-foreground">
                      Send your satellites to planet candidates you've discovered and find new clouds!
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <label className="text-sm text-foreground font-medium block">
                    Send satellite to:
                  </label>

                  <select
                    className="text-sm font-medium rounded px-3 py-1 bg-primary text-primary-foreground hover:opacity-90 transition w-auto"
                    disabled={planetTargets.length === 0}
                    defaultValue=""
                    onChange={async (e) => {
                      const selectedId = Number(e.target.value);
                      if (!isNaN(selectedId)) {
                        await handleSendSatellite(selectedId);
                        await checkActiveSatellite();
                      }
                    }}
                  >
                    <option value="" disabled>
                      {planetTargets.length === 0 ? "No planets available" : "Select a planet"}
                    </option>
                    {planetTargets.map((planet) => (
                      <option key={planet.id} value={planet.id}>
                        {planet.name}
                      </option>
                    ))}
                  </select>
                </div>

                {activeSatelliteMessage && (
                  <p className="mt-2 text-sm text-muted-foreground italic">
                    {activeSatelliteMessage}
                  </p>
                )}
              </div>

              {/* Upcoming Items */}
              {[
                {
                  label: "Rovers",
                  description: "Explore surface geology and send rich data back.",
                },
                {
                  label: "Balloons",
                  description: "Float above atmospheres for weather anomaly mapping.",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border bg-muted text-muted-foreground p-4 shadow-sm"
                >
                  <p className="font-medium">{item.label} (Coming Soon)</p>
                  <p className="text-sm">{item.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {showTipsPanel && <TipsPanel />}
      </div>

      <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-primary">Complete Your Profile</DialogTitle>
          </DialogHeader>
          <CompleteProfileForm onSuccess={() => setShowProfileModal(false)} />
        </DialogContent>
      </Dialog>

      {showNpsModal && (
        <NPSPopup
          userId={session.user.id}
          isOpen={true}
          onClose={() => setShowNpsModal(false)}
        />
      )}

      <WeeklyBanner
        message="🚀 The full Star Sailors experience has more projects and deeper mechanics. Feel free to explore—or stay here for a simpler start."
        buttonLabel="Play"
        buttonHref="/alpha"
      />
    </div>
  );
};