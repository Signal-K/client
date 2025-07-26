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
import { TelescopeBackground } from "@/components/Structures/Telescope/telescope-background";
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
import { SkillTreeSection } from "@/components/Research/SkillTree/skill-tree-section";

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
  const [visibleStructures, setVisibleStructures] = useState({
    telescope: true,
    satellites: true,
    rovers: false,
    balloons: false
  });

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

      // Fetch all linked anomalies for the user
      const { data: rawLinked, error: linkedError } = await supabase
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
      
      // Let's also check the total count in the table
      const { count: totalLinkedCount, error: countError } = await supabase
        .from("linked_anomalies")
        .select("id", { count: "exact" });
    
      
      // Let's also check what's in the table without filtering by author
      const { data: allLinkedData, error: allLinkedError } = await supabase
        .from("linked_anomalies")
        .select("id, author, anomaly_id, date")
        .limit(10);
    

      // Fetch all cloud anomalies that have already been classified by the user
      const { data: classifiedClouds } = await supabase
        .from("classifications")
        .select("anomaly, anomaly:anomaly(content, anomalytype)")
        .eq("author", userId)
        .eq("classificationtype", "cloud");

      const classifiedCloudAnomalyIds = new Set(
        (classifiedClouds ?? [])
          .filter((c) => c.anomaly && c.anomaly.anomalytype === "cloud")
          .map((c) => c.anomaly)
      );

      // Filter linked anomalies: keep those not classified by user,
      // plus those of type 'cloud' that HAVE been classified by user
      const linked = (rawLinked ?? []) as unknown as LinkedAnomaly[];
      const filteredLinked = linked.filter((a) => {
        const isCloud = a.anomaly?.anomalytype === "cloud";
        if (!classifiedAnomalyIds.has(a.anomaly_id)) return true;
        if (isCloud && classifiedCloudAnomalyIds.has(a.anomaly_id)) return true;
        return false;
      });
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

      // Update structure visibility based on user progress
      setVisibleStructures({
        telescope: true, // Always visible
        satellites: transformedClassifications.length > 0, // Show if user has any classifications
        rovers: transformedClassifications.filter(c => c.classificationtype === 'planet').length >= 5, // Show after 5 planet classifications
        balloons: transformedClassifications.length >= 10 // Show after 10 total classifications
      });
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
    <div className="min-h-screen w-full relative flex justify-center pb-20">
      {/* Telescope Background - Full screen behind everything */}
      <div className="fixed inset-0 -z-10">
        <TelescopeBackground 
          sectorX={0} 
          sectorY={0} 
          showAllAnomalies={true}
          isDarkTheme={isDark}
          onAnomalyClick={(anomaly) => console.log('Clicked anomaly:', anomaly)}
        />
      </div>

      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-sm border-b border-border">
        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between px-4 lg:px-6 py-3 gap-4 sm:gap-0">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <h1 className="text-xl font-bold text-primary">Star Sailors</h1>
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
          <div className="fixed top-[60px] right-4 sm:right-6 w-full sm:w-[420px] max-h-[80vh] overflow-y-auto rounded-xl bg-card/95 backdrop-blur-sm border border-border shadow-xl z-40">
            <RecentActivity
              activityFeed={activityFeed}
              otherClassifications={otherClassifications}
              isInsidePanel={true}
            />
          </div>
        )}
      </div>

      <div className="w-full max-w-screen-xl px-4 py-6 space-y-8 pt-24 relative z-10">
        {/* Activity Header - User profile and deployment status */}
        <div className="bg-background/20 backdrop-blur-sm rounded-lg border border-[#78cce2]/30 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Your Progress</p>
              <p className="text-lg font-semibold text-primary">
                {classifications.length} discoveries made
              </p>
            </div>
          </div>
          <ActivityHeader
            scrolled={true}
            landmarksExpanded={landmarksExpanded}
            onToggleLandmarks={() => setLandmarksExpanded((prev) => !prev)}
          />
        </div>

        {/* Next Steps Guide - PRIORITY #1 for new users */}
        <div className="bg-background/20 backdrop-blur-sm rounded-lg border border-[#78cce2]/30 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
            <h3 className="text-xl font-semibold text-primary">Your Next Steps</h3>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Classification Progress */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔬</span>
                <div>
                  <h4 className="font-semibold text-foreground">Make More Discoveries</h4>
                  <p className="text-sm text-muted-foreground">
                    Classify more planets and asteroids to unlock advanced research
                  </p>
                </div>
              </div>
              
              {incompletePlanet && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    🌍 Complete your planet analysis!
                  </p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                    You have an unfinished planet classification. Add radius measurements to complete it.
                  </p>
                </div>
              )}
            </div>

            {/* Structure Deployment */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🚀</span>
                <div>
                  <h4 className="font-semibold text-foreground">Deploy Structures</h4>
                  <p className="text-sm text-muted-foreground">
                    Build telescopes and satellites to enhance your research capabilities
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tips & Guidance - PRIORITY #2 for concept explanation */}
        <div className="bg-background/20 backdrop-blur-sm rounded-lg border border-[#78cce2]/30 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-primary">💡 Tips & Next Actions</h3>
            <button
              onClick={() => setShowTipsPanel(!showTipsPanel)}
              className="text-sm font-medium px-3 py-1 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition"
            >
              {showTipsPanel ? 'Hide Tips' : 'Show Tips'}
            </button>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div className="text-center p-4 bg-card/50 rounded-lg">
              <div className="text-2xl mb-2">📊</div>
              <h4 className="font-semibold text-sm mb-1">Track Progress</h4>
              <p className="text-xs text-muted-foreground">
                Monitor your discoveries and research advancement in real-time
              </p>
            </div>
            <div className="text-center p-4 bg-card/50 rounded-lg">
              <div className="text-2xl mb-2">🏆</div>
              <h4 className="font-semibold text-sm mb-1">Complete Milestones</h4>
              <p className="text-xs text-muted-foreground">
                Achieve goals to unlock new features and capabilities
              </p>
            </div>
            <div className="text-center p-4 bg-card/50 rounded-lg">
              <div className="text-2xl mb-2">🌌</div>
              <h4 className="font-semibold text-sm mb-1">Explore Deeper</h4>
              <p className="text-xs text-muted-foreground">
                Visit the full experience for advanced projects and features
              </p>
            </div>
          </div>

          {showTipsPanel && (
            <div className="border-t border-border pt-4">
              <TipsPanel />
            </div>
          )}
        </div>

        {/* Research Progress - PRIORITY #3 for understanding core mechanics */}
        <div className="bg-background/20 backdrop-blur-sm rounded-lg border border-[#78cce2]/30 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-primary">Research & Development</h3>
              <p className="text-sm text-muted-foreground">
                Unlock new capabilities by advancing through the skill tree
              </p>
            </div>
            <Link 
              href="/research/tree"
              className="text-sm font-medium px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition"
            >
              View Full Tree
            </Link>
          </div>
          
          <div className="mb-4 p-4 bg-card/50 rounded-lg border">
            <p className="text-sm text-muted-foreground">
              <strong>How it works:</strong> Make classifications to unlock research skills. 
              Each skill provides new tools and capabilities for your space exploration journey.
            </p>
          </div>
          
          <SkillTreeSection isFullTree={false} />
        </div>

        {/* Milestones - PRIORITY #4 for goal setting */}
        <div className="bg-background/20 backdrop-blur-sm rounded-lg border border-[#78cce2]/30 p-6">
          <h3 className="text-xl font-semibold text-primary mb-4">Current Milestones</h3>
          <MilestoneCard />
        </div>

        {/* Recent Activity - PRIORITY #5 for tracking progress */}
        <div className="bg-background/20 backdrop-blur-sm rounded-lg border border-[#78cce2]/30 p-6">
          <h3 className="text-xl font-semibold text-primary mb-4">Your Recent Discoveries</h3>
          <RecentDiscoveries
            classifications={classifications}
            linkedAnomalies={linkedAnomalies}
            incompletePlanet={incompletePlanet}
          />
        </div>

        {needsProfileSetup ? (
          <section className="rounded-2xl p-6 border shadow space-y-4 text-center bg-background/30 backdrop-blur-sm border-[#78cce2]/30 text-card-foreground">
            <h3 className="text-xl font-semibold text-primary">⚠️ Action Required: Complete Your Profile</h3>
            <p className="text-sm text-muted-foreground">
              You're missing out on key features! Complete your profile to unlock:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="text-center">
                <span className="text-2xl">🏗️</span>
                <p className="text-sm font-medium">Structures</p>
                <p className="text-xs text-muted-foreground">Deploy telescopes & satellites</p>
              </div>
              <div className="text-center">
                <span className="text-2xl">🔬</span>
                <p className="text-sm font-medium">Research Tree</p>
                <p className="text-xs text-muted-foreground">Unlock new capabilities</p>
              </div>
              <div className="text-center">
                <span className="text-2xl">👥</span>
                <p className="text-sm font-medium">Social Features</p>
                <p className="text-xs text-muted-foreground">Referrals & collaboration</p>
              </div>
            </div>
            <button
              onClick={() => setShowProfileModal(true)}
              className="mt-4 px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition font-medium"
            >
              Complete Your Profile Now
            </button>
          </section>
        ) : (
          <section className="rounded-2xl border bg-background/30 backdrop-blur-sm border-[#78cce2]/30 text-card-foreground shadow p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Telescope className="text-primary" />
                <div>
                  <h3 className="font-semibold text-lg">Structures & Equipment</h3>
                  <p className="text-sm text-muted-foreground">
                    Deploy advanced equipment to enhance your research capabilities
                  </p>
                </div>
              </div>
            </div>

            {/* Getting Started Guide */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-semibold text-foreground mb-2">🎯 Deployment Strategy Guide</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">1.</span>
                  <div>
                    <strong>Start with a Telescope:</strong> Enhances your ability to classify distant objects and unlocks the research skill tree
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">2.</span>
                  <div>
                    <strong>Deploy Satellites:</strong> Send them to planets you've discovered to find atmospheric phenomena
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">3.</span>
                  <div>
                    <strong>Check Progress:</strong> Monitor your research advancement and unlock new technologies
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {/* Telescope Block - Enhanced */}
              {visibleStructures.telescope && (
                <div className="rounded-xl border bg-popover text-popover-foreground p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">🔭</span>
                        <p className="font-medium">Telescope Array</p>
                        <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
                          Recommended
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Your most important tool! Enhances classification accuracy and unlocks the research skill tree.
                      </p>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                          ✓ Better data quality
                        </span>
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                          ✓ Unlocks research
                        </span>
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                          ✓ Finds distant objects
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <Link
                        href="/activity/deploy"
                        className="text-sm font-medium rounded px-4 py-2 bg-primary text-primary-foreground hover:opacity-90 transition"
                      >
                        Deploy Now
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Satellites Block - Enhanced */}
              {visibleStructures.satellites && (
                <div className="rounded-xl border bg-popover text-popover-foreground p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">🛰️</span>
                    <p className="font-medium text-foreground">Weather Satellites</p>
                    {planetTargets.length === 0 && (
                      <span className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full">
                        Need planets first
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Send satellites to planets you've discovered to study their atmospheres and find cloud formations.
                  </p>
                  
                  {planetTargets.length === 0 ? (
                    <div className="bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <strong>Prerequisites:</strong> You need to classify at least one planet with radius measurements before deploying satellites.
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        💡 Tip: Complete any unfinished planet classifications first!
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm text-foreground font-medium">
                          Deploy satellite to planet:
                        </label>
                        <select
                          className="text-sm font-medium rounded px-3 py-1 bg-primary text-primary-foreground hover:opacity-90 transition"
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
                            Select target planet
                          </option>
                          {planetTargets.map((planet) => (
                            <option key={planet.id} value={planet.id}>
                              {planet.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {activeSatelliteMessage ? (
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                          <p className="text-sm font-medium text-green-800 dark:text-green-200">
                            🛰️ Satellite Active!
                          </p>
                          <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                            {activeSatelliteMessage}
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2 text-xs">
                          <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded">
                            ✓ Discovers clouds
                          </span>
                          <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded">
                            ✓ Atmospheric data
                          </span>
                          <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded">
                            ✓ Weekly missions
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Future Structures - Only show if any are visible */}
              {(visibleStructures.rovers || visibleStructures.balloons) && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900/30 p-4">
                  <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                    <span className="text-xl">🚧</span>
                    Coming Soon: Advanced Equipment
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    {visibleStructures.rovers && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🤖</span>
                          <div>
                            <p className="font-medium text-sm">Planetary Rovers</p>
                            <p className="text-xs text-muted-foreground">Explore surface geology and mineral compositions</p>
                          </div>
                        </div>
                      </div>
                    )}
                    {visibleStructures.balloons && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🎈</span>
                          <div>
                            <p className="font-medium text-sm">Atmospheric Balloons</p>
                            <p className="text-xs text-muted-foreground">Study weather patterns and atmospheric layers</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 italic">
                    Unlock these by advancing through the research tree and making more discoveries!
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Tips & Guidance */}
        <div className="bg-background/20 backdrop-blur-sm rounded-lg border border-[#78cce2]/30 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-primary">💡 Tips & Next Actions</h3>
            <button
              onClick={() => setShowTipsPanel(!showTipsPanel)}
              className="text-sm font-medium px-3 py-1 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition"
            >
              {showTipsPanel ? 'Hide Tips' : 'Show Tips'}
            </button>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div className="text-center p-4 bg-card/50 rounded-lg">
              <div className="text-2xl mb-2">📊</div>
              <h4 className="font-semibold text-sm mb-1">Track Progress</h4>
              <p className="text-xs text-muted-foreground">
                Monitor your discoveries and research advancement in real-time
              </p>
            </div>
            <div className="text-center p-4 bg-card/50 rounded-lg">
              <div className="text-2xl mb-2">🏆</div>
              <h4 className="font-semibold text-sm mb-1">Complete Milestones</h4>
              <p className="text-xs text-muted-foreground">
                Achieve goals to unlock new features and capabilities
              </p>
            </div>
            <div className="text-center p-4 bg-card/50 rounded-lg">
              <div className="text-2xl mb-2">🌌</div>
              <h4 className="font-semibold text-sm mb-1">Explore Deeper</h4>
              <p className="text-xs text-muted-foreground">
                Visit the full experience for advanced projects and features
              </p>
            </div>
          </div>

          {showTipsPanel && (
            <div className="border-t border-border pt-4">
              <TipsPanel />
            </div>
          )}
        </div>
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