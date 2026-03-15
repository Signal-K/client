"use client";

import { Suspense, useState, useEffect, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { usePostHog } from "posthog-js/react";
import { useAuthUser } from "@/src/hooks/useAuthUser";

// Dynamic heavy components
const TelescopeBackground = dynamic(
  () =>
    import("@/src/components/classification/telescope/telescope-background").then(
      (m) => m.TelescopeBackground
    ),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background to-background/80" />
    ),
  }
);
const NPSPopup = dynamic(() => import("@/src/components/ui/helpers/nps-popup"), {
  loading: () => null,
});
const CompleteProfileForm = dynamic(
  () => import("@/src/components/profile/setup/FinishProfile"),
  {
    loading: () => (
      <div className="p-4 text-xs text-muted-foreground">Loading profile form…</div>
    ),
  }
);
const PWAPrompt = dynamic(() => import("@/src/components/pwa/PWAPrompt"), {
  loading: () => null,
});

// Dynamic tab content components
const TelescopeTab = dynamic(() => import("@/src/components/tabs/TelescopeTab"), {
  loading: () => (
    <div className="p-4 text-xs text-muted-foreground font-mono">Loading telescope…</div>
  ),
});
const SatelliteTab = dynamic(() => import("@/src/components/tabs/SatelliteTab"), {
  loading: () => (
    <div className="p-4 text-xs text-muted-foreground font-mono">Loading satellite…</div>
  ),
});
const RoverTab = dynamic(() => import("@/src/components/tabs/RoverTab"), {
  loading: () => <div className="p-4 text-xs text-muted-foreground font-mono">Loading rover…</div>,
});
const SolarTab = dynamic(() => import("@/src/components/tabs/SolarTab"), {
  loading: () => <div className="p-4 text-xs text-muted-foreground font-mono">Loading solar…</div>,
});
const InventoryTab = dynamic(() => import("@/src/components/tabs/InventoryTab"), {
  loading: () => (
    <div className="p-4 text-xs text-muted-foreground font-mono">Loading cargo bay…</div>
  ),
});

// UI Components
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/src/components/ui/sheet";
import AnonymousUserPrompt from "@/src/components/profile/auth/AnonymousUserPrompt";

// Station UI components
import { CommandHeader }    from "@/src/features/game/components/station/CommandHeader";
import { SectorBar }        from "@/src/features/game/components/station/SectorBar";
import { MissionBriefCard } from "@/src/features/game/components/station/MissionBriefCard";
import { StationCard }      from "@/src/features/game/components/station/StationCard";
import { StationNav }       from "@/src/features/game/components/station/StationNav";
import { ViewportHeader }   from "@/src/features/game/components/station/ViewportHeader";
import { SectionLabel }     from "@/src/features/game/components/station/SectionLabel";
import { MissionLogPanel, buildLogEntries } from "@/src/features/game/components/station/MissionLogPanel";
import { AgencyNetworkCard } from "@/src/features/game/components/station/AgencyNetworkCard";
import { StationSchematic } from "@/src/features/game/components/station/StationSchematic";
import { SectorRadar }     from "@/src/features/game/components/station/SectorRadar";

// Preserved feature components
import MechanicPulseSurvey from "@/src/features/surveys/components/MechanicPulseSurvey";
import RecentActivity from "@/src/components/social/activity/RecentActivity";
import ProjectPreferencesModal from "@/src/components/onboarding/ProjectPreferencesModal";
import PushNotificationPrompt from "@/src/features/notifications/components/PushNotificationPrompt";
import ActivityHeader from "@/src/components/scenes/deploy/ActivityHeader";

// Hooks
import { usePageData } from "@/hooks/usePageData";
import { useNPSManagement } from "@/hooks/useNPSManagement";
import { useUserPreferences } from "@/src/hooks/useUserPreferences";
import UseDarkMode from "@/src/shared/hooks/useDarkMode";

// Types / utils
import { cn } from "@/src/shared/utils";
import { getOrCreateAnalyticsSessionToken } from "@/src/lib/analytics/session-token";
import {
  MECHANIC_SURVEYS,
  SURVEY_DISPLAY_DELAY_MS,
  surveyStorageKey,
} from "@/src/features/surveys/mechanic-surveys";
import type { MechanicMicroSurvey } from "@/src/features/surveys/types";
import { ProjectType } from "@/src/hooks/useUserPreferences";

// Icons
import { Telescope, Satellite, Car, Package, Sun, FlaskConical, AlertTriangle } from "lucide-react";

type ViewMode = "base" | "telescope" | "satellite" | "rover" | "solar" | "inventory";

const POSTHOG_SURVEY_ID = "019c83d3-d0a5-0000-4e8f-5b7fd8794666";
const POSTHOG_SURVEY_SHOWN_KEY = "posthog_survey_webapp_22_shown_v1";
const POSTHOG_SURVEY_LAST_SHOWN_AT_KEY = "posthog_survey_webapp_22_last_shown_at_v1";
const POSTHOG_SURVEY_COOLDOWN_MS = 14 * 24 * 60 * 60 * 1000;
const SURVEY_REWARD_GRANTED_KEY = "posthog_survey_webapp_22_reward_granted_v1";
const SURVEY_REWARD_STARDUST = 5;
const REFERRAL_MISSION_DISMISSED_KEY = "referral_mission_prompt_dismissed_v1";

function safeStorageGet(key: string): string | null {
  if (typeof window === "undefined") return null;
  try { return window.localStorage.getItem(key); } catch { return null; }
}
function safeStorageSet(key: string, value: string) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(key, value); } catch { /* ignore */ }
}

// ─── Loading skeleton ───────────────────────────────────────────────────────

function ControlStationSkeleton() {
  return (
    <div className="min-h-screen w-full bg-background">
      <div className="h-11 border-b border-border/60 bg-background/95 animate-pulse" />
      <div className="h-8 border-b border-border/40 bg-muted/20 animate-pulse" />
      <div className="px-4 py-6 space-y-4 pt-20">
        <div className="h-28 rounded-xl bg-card/20 animate-pulse" />
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-card/20 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

function GamePageContent() {
  const { user, isLoading: isAuthLoading } = useAuthUser();
  const posthog = usePostHog();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialView = (searchParams.get("view") as ViewMode) || "base";

  const [activeView, setActiveView]           = useState<ViewMode>(initialView);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [showProfileModal, setShowProfileModal]   = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [openedViewports, setOpenedViewports] = useState<Set<ViewMode>>(new Set());
  const [referralCode, setReferralCode]       = useState<string | null>(null);
  const [referralCount, setReferralCount]     = useState(0);
  const [userHasReferral, setUserHasReferral] = useState<boolean | null>(null);
  const [showReferralMission, setShowReferralMission] = useState(false);
  const [surveyRewardToast, setSurveyRewardToast] = useState<{
    variant: "success" | "error" | "info";
    title: string;
    description: string;
  } | null>(null);
  const [activeMechanicSurvey, setActiveMechanicSurvey] = useState<MechanicMicroSurvey | null>(null);
  const [analyticsSessionToken] = useState<string | null>(() => getOrCreateAnalyticsSessionToken());

  const {
    linkedAnomalies,
    activityFeed,
    profile,
    classifications,
    otherClassifications,
    loading,
  } = usePageData();

  const { showNpsModal, handleCloseNps } = useNPSManagement();
  const { isDark } = UseDarkMode();
  const {
    preferences,
    isLoading: preferencesLoading,
    needsPreferencesPrompt,
    setProjectInterests,
  } = useUserPreferences();

  // ── Referral data ──────────────────────────────────────────────────────────
  useEffect(() => {
    let ignore = false;
    const load = async () => {
      if (!user) return;
      try {
        const res = await fetch("/api/gameplay/research/summary", { cache: "no-store" });
        const p = await res.json().catch(() => null);
        if (!res.ok || !p || ignore) return;
        setReferralCode(p.referralCode ?? null);
        setReferralCount(Number(p.referralCount ?? 0));
      } catch { if (!ignore) { setReferralCode(null); setReferralCount(0); } }
    };
    void load();
    return () => { ignore = true; };
  }, [user]);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      if (!user) return;
      try {
        const res = await fetch("/api/gameplay/profile/referral-status", { cache: "no-store" });
        const p = await res.json().catch(() => null);
        if (!res.ok || !p || ignore) return;
        const hasReferral = Boolean(p.hasReferral);
        setUserHasReferral(hasReferral);
        const dismissed = safeStorageGet(REFERRAL_MISSION_DISMISSED_KEY) === "1";
        const shouldShow = !hasReferral && !dismissed;
        setShowReferralMission(shouldShow);
        if (shouldShow) posthog?.capture("referral_mission_prompt_shown", { trigger_surface: "game", has_referral: false });
      } catch { if (!ignore) { setUserHasReferral(null); setShowReferralMission(false); } }
    };
    void load();
    return () => { ignore = true; };
  }, [user, posthog]);

  const handleDismissReferralMission = useCallback(() => {
    safeStorageSet(REFERRAL_MISSION_DISMISSED_KEY, "1");
    setShowReferralMission(false);
    posthog?.capture("referral_mission_prompt_dismissed", { trigger_surface: "game" });
  }, [posthog]);

  const handleCopyReferralInvite = useCallback(async () => {
    if (!referralCode || typeof window === "undefined") return;
    const url = `${window.location.origin}/auth?ref=${encodeURIComponent(referralCode)}`;
    try {
      await navigator.clipboard.writeText(url);
      posthog?.capture("referral_mission_copy_clicked", { trigger_surface: "game", has_referral_code: true });
      setSurveyRewardToast({ variant: "info", title: "Invite link copied", description: "Share it with a crewmate." });
      setTimeout(() => setSurveyRewardToast(null), 3000);
    } catch { /* ignore */ }
  }, [posthog, referralCode]);

  // ── Survey handlers ────────────────────────────────────────────────────────
  const completeMechanicSurvey = useCallback(
    async (survey: MechanicMicroSurvey, answers: Record<string, string>) => {
      if (!user) return;
      safeStorageSet(surveyStorageKey(survey.id, user.id), "done");
      posthog?.capture("mechanic_micro_survey_submitted", {
        survey_id: survey.id, survey_title: survey.title, trigger_surface: "game",
        response_count: Object.keys(answers).length,
        q1: answers[survey.questions[0].id] ?? null,
        q2: survey.questions[1] ? answers[survey.questions[1].id] ?? null : null,
        starsailors_session_token: analyticsSessionToken,
      });
      setActiveMechanicSurvey(null);
    },
    [analyticsSessionToken, posthog, user]
  );

  const dismissMechanicSurvey = useCallback(
    (survey: MechanicMicroSurvey) => {
      if (!user) return;
      safeStorageSet(surveyStorageKey(survey.id, user.id), "done");
      posthog?.capture("mechanic_micro_survey_dismissed", { survey_id: survey.id, trigger_surface: "game", starsailors_session_token: analyticsSessionToken });
      setActiveMechanicSurvey(null);
    },
    [analyticsSessionToken, posthog, user]
  );

  const handleSurveyReward = useCallback(async () => {
    if (!user || typeof window === "undefined") return;
    try {
      const alreadyRewarded = safeStorageGet(SURVEY_REWARD_GRANTED_KEY) === "1";
      if (alreadyRewarded) return;
      const res = await fetch("/api/gameplay/survey-reward", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ surveyId: POSTHOG_SURVEY_ID, surveyName: "Star Sailors Webapp Loop Survey 2.2" }),
      });
      const data = await res.json() as { granted?: boolean; alreadyGranted?: boolean; stardust?: number };
      if (data.alreadyGranted) { safeStorageSet(SURVEY_REWARD_GRANTED_KEY, "1"); return; }
      if (data.granted) {
        safeStorageSet(SURVEY_REWARD_GRANTED_KEY, "1");
        setSurveyRewardToast({ variant: "success", title: `⭐ +${data.stardust ?? SURVEY_REWARD_STARDUST} Stardust`, description: "Thanks for your feedback!" });
      }
    } catch {
      setSurveyRewardToast({ variant: "error", title: "Reward unavailable", description: "Couldn't grant reward — try refreshing." });
    }
    setTimeout(() => setSurveyRewardToast(null), 4000);
  }, [user]);

  // Intercept posthog.capture to detect survey completion
  useEffect(() => {
    if (!posthog || !user || typeof window === "undefined") return;
    const phAny = posthog as unknown as Record<string, unknown>;
    const orig = phAny["capture"] as ((this: unknown, ...a: unknown[]) => unknown) | undefined;
    if (typeof orig !== "function") return;
    phAny["capture"] = function (this: unknown, eventName: unknown, ...rest: unknown[]) {
      if (eventName === "survey sent") {
        const props = rest[0] as Record<string, unknown> | undefined;
        if (props?.["$survey_id"] === POSTHOG_SURVEY_ID && props?.["$survey_completed"] === true) {
          void handleSurveyReward();
        }
      }
      return orig.call(this, eventName, ...rest);
    };
    return () => { phAny["capture"] = orig; };
  }, [posthog, user, handleSurveyReward]);

  // Preferences modal on first visit
  useEffect(() => {
    if (!preferencesLoading && needsPreferencesPrompt && user) setShowPreferencesModal(true);
  }, [preferencesLoading, needsPreferencesPrompt, user]);

  // Structure visibility
  const shouldShowStructure = (type: "telescope" | "satellite" | "rover" | "solar") => {
    if (preferences.projectInterests.length === 0) return true;
    const map: Record<string, ProjectType[]> = {
      telescope: ["planet-hunting", "asteroid-hunting"],
      satellite: ["cloud-tracking", "ice-tracking"],
      rover:     ["rover-training"],
      solar:     ["solar-monitoring"],
    };
    return (map[type] ?? []).some((p) => preferences.projectInterests.includes(p));
  };

  const handleStructureClick = (type: "telescope" | "satellite" | "rover" | "solar") => {
    const routes = { telescope: "/setup/telescope", satellite: "/setup/satellite", rover: "/setup/rover", solar: "/setup/solar" };
    router.push(routes[type]);
  };

  const handlePreferencesSave = (interests: ProjectType[]) => {
    setProjectInterests(interests);
    setShowPreferencesModal(false);
  };

  // ── Derived data ───────────────────────────────────────────────────────────
  const missionStats = useMemo(() => {
    const awaiting = linkedAnomalies.filter(
      (la) => !classifications.some((c) => c.anomaly?.content === la.anomaly?.content)
    ).length;
    const recentClassifications = classifications.filter((c) => {
      const diff = (Date.now() - new Date(c.created_at).getTime()) / 3_600_000;
      return diff < 24;
    });
    const lockedAnomalies = linkedAnomalies.filter((la) => la.unlocked === false || la.unlocked === null);
    return {
      awaiting,
      recentCount: recentClassifications.length,
      lastClassification: recentClassifications[0],
      hasUnlockingSoon: lockedAnomalies.length > 0,
    };
  }, [linkedAnomalies, classifications]);

  const structureStatus = useMemo(() => {
    const telescopeAnoms = linkedAnomalies.filter(
      (la) => la.automaton?.includes("telescope") || la.anomaly?.anomalySet?.includes("telescope") || la.anomaly?.anomalytype?.includes("planet")
    );
    const satelliteAnoms = linkedAnomalies.filter(
      (la) => la.automaton?.includes("Satellite") || la.automaton?.includes("Weather") || la.anomaly?.anomalySet?.includes("cloud")
    );
    const roverAnoms = linkedAnomalies.filter(
      (la) => la.automaton?.includes("rover") || la.anomaly?.anomalySet?.includes("automaton")
    );
    const solarAnoms = linkedAnomalies.filter((la) => la.anomaly?.anomalySet?.includes("sunspot"));
    return {
      telescope: { deployed: telescopeAnoms.length > 0, count: telescopeAnoms.length },
      satellite: { deployed: satelliteAnoms.length > 0, count: satelliteAnoms.length },
      rover:     { deployed: roverAnoms.length > 0,     count: roverAnoms.length     },
      solar:     { deployed: solarAnoms.length > 0,     count: solarAnoms.length     },
    };
  }, [linkedAnomalies]);

  const logEntries = useMemo(
    () => buildLogEntries(classifications, linkedAnomalies),
    [classifications, linkedAnomalies]
  );

  // ── Analytics ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (user) posthog?.capture("game_page_viewed", { user_id: user.id, classification_count: classifications.length, discovery_count: linkedAnomalies.length });
  }, [user, posthog, classifications.length, linkedAnomalies.length]);

  // PostHog NPS survey trigger
  useEffect(() => {
    if (!user || !posthog || activeView !== "base" || showNpsModal || showPreferencesModal || showProfileModal || typeof window === "undefined") return;
    const alreadyShown = safeStorageGet(POSTHOG_SURVEY_SHOWN_KEY) === "1";
    const lastShown = Number(safeStorageGet(POSTHOG_SURVEY_LAST_SHOWN_AT_KEY) ?? "0");
    if (alreadyShown || (Number.isFinite(lastShown) && Date.now() - lastShown < POSTHOG_SURVEY_COOLDOWN_MS)) return;
    const meaningfulViewports = ["telescope", "satellite", "rover", "solar"].filter((v) => openedViewports.has(v as ViewMode)).length;
    if (classifications.length < 3 && linkedAnomalies.length < 5 && meaningfulViewports < 2) return;
    const t = window.setTimeout(() => {
      posthog.displaySurvey(POSTHOG_SURVEY_ID);
      posthog.capture("posthog_survey_triggered", { survey_id: POSTHOG_SURVEY_ID, trigger_page: "game" });
      safeStorageSet(POSTHOG_SURVEY_SHOWN_KEY, "1");
      safeStorageSet(POSTHOG_SURVEY_LAST_SHOWN_AT_KEY, String(Date.now()));
    }, 12000);
    return () => window.clearTimeout(t);
  }, [user, posthog, activeView, showNpsModal, showPreferencesModal, showProfileModal, classifications.length, linkedAnomalies.length, openedViewports]);

  // Mechanic surveys
  useEffect(() => {
    if (!user || !posthog || activeView !== "base" || activeMechanicSurvey || showNpsModal || showPreferencesModal || showProfileModal || showReferralMission) return;
    const telescopeCount = classifications.filter((c) => (c.classificationtype || "").toLowerCase().includes("planet")).length;
    const roverSignals = linkedAnomalies.filter((la) => (la.automaton || "").toLowerCase().includes("rover") || (la.anomaly?.anomalySet || "").toLowerCase().includes("automaton")).length;
    const first = MECHANIC_SURVEYS.filter((s) => s.triggerSurface === "game").find((s) => {
      if (safeStorageGet(surveyStorageKey(s.id, user.id)) === "done") return false;
      if (s.id === "mechanic_telescope_loop_v1") return openedViewports.has("telescope") && telescopeCount >= 2;
      if (s.id === "mechanic_rover_loop_v1") return openedViewports.has("rover") && roverSignals >= 1;
      return false;
    });
    if (!first) return;
    const t = window.setTimeout(() => {
      setActiveMechanicSurvey(first);
      posthog.capture("mechanic_micro_survey_shown", { survey_id: first.id, survey_title: first.title, trigger_surface: "game", starsailors_session_token: analyticsSessionToken });
    }, SURVEY_DISPLAY_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [activeMechanicSurvey, activeView, analyticsSessionToken, classifications, linkedAnomalies, openedViewports, posthog, showNpsModal, showPreferencesModal, showProfileModal, showReferralMission, user]);

  // Auth redirect
  useEffect(() => {
    if (!isAuthLoading && !user) router.replace("/auth?next=/game");
  }, [isAuthLoading, user, router]);

  const handleViewChange = (view: ViewMode) => {
    setActiveView(view);
    if (view !== "base" && view !== "inventory") {
      setOpenedViewports((prev) => { const n = new Set(prev); n.add(view); return n; });
    }
    posthog?.capture("viewport_opened", { viewport: view });
  };

  const handleClassifyNow = () => {
    if (structureStatus.telescope.count > 0) handleViewChange("telescope");
    else if (structureStatus.satellite.count > 0) handleViewChange("satellite");
    else if (structureStatus.rover.count > 0) handleViewChange("rover");
  };

  const needsProfileSetup = !profile?.username || !profile?.full_name;
  const agencyId = user ? `AGENCY-ID: SS-${user.id.slice(-4).toUpperCase()}` : undefined;

  // ── Guards ─────────────────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <span className="font-mono text-xs text-muted-foreground animate-pulse">Authenticating…</span>
      </div>
    );
  }

  if (loading) return <ControlStationSkeleton />;

  // ── Viewport views ─────────────────────────────────────────────────────────
  if (activeView !== "base") {
    return (
      <div className="min-h-screen w-full relative">
        <div className="fixed inset-0 -z-10">
          <TelescopeBackground sectorX={0} sectorY={0} showAllAnomalies={false} isDarkTheme={isDark} variant="stars-only" onAnomalyClick={() => {}} />
        </div>

        <ViewportHeader
          label={activeView}
          stationId={activeView}
          onBack={() => setActiveView("base")}
        />

        <main className="pt-16 pb-24 px-4 min-h-screen">
          <div className="max-w-screen-xl mx-auto">
            {activeView === "telescope" && <TelescopeTab />}
            {activeView === "satellite" && <SatelliteTab />}
            {activeView === "rover"     && <RoverTab />}
            {activeView === "solar"     && <SolarTab />}
            {activeView === "inventory" && <InventoryTab />}
          </div>
        </main>

        <StationNav
          active={activeView}
          onSelect={handleViewChange}
          alerts={{
            telescope: structureStatus.telescope.count > 0,
            satellite: structureStatus.satellite.count > 0,
            rover:     structureStatus.rover.count > 0,
            solar:     structureStatus.solar.count > 0,
          }}
        />

        {showNpsModal && user && (
          <NPSPopup userId={user.id} isOpen={true} onClose={handleCloseNps} />
        )}
        <PWAPrompt />
      </div>
    );
  }

  // ── Base / Control Station dashboard ──────────────────────────────────────
  return (
    <Suspense fallback={<ControlStationSkeleton />}>
      <div className="min-h-screen w-full relative pb-24 md:pb-8">

        {/* Star field bg */}
        <div className="fixed inset-0 -z-10">
          <TelescopeBackground sectorX={0} sectorY={0} showAllAnomalies={false} isDarkTheme={isDark} variant="stars-only" onAnomalyClick={() => {}} />
        </div>

        {/* Page-level scan-line overlay — very subtle, gives CRT depth to the whole screen */}
        <div
          className="fixed inset-0 -z-10 pointer-events-none"
          style={{
            backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.08) 3px, rgba(0,0,0,0.08) 4px)",
          }}
          aria-hidden
        />

        {/* Vignette — darkens edges like looking through a porthole */}
        <div
          className="fixed inset-0 -z-10 pointer-events-none"
          style={{ boxShadow: "inset 0 0 120px rgba(0,0,0,0.5)" }}
          aria-hidden
        />

        {/* Command header */}
        <CommandHeader
          stardust={classifications.length}
          hasAlerts={activityFeed.length > 0}
          onAlertsClick={() => setNotificationsOpen(true)}
          agencyId={agencyId}
        />

        {/* Sector HUD bar — sits directly under fixed header */}
        <div className="pt-[52px]">
          <SectorBar
            sectorName="Home Sector"
            online={linkedAnomalies.length > 0}
            signalCount={missionStats.awaiting}
          />
        </div>

        {/* Main content */}
        <main className="px-3 pt-3 pb-6 max-w-screen-sm mx-auto space-y-4">

          {/* Planet hero — shows backdrop, avatar, and deployed structure status */}
          <ActivityHeader scrolled={false} landmarksExpanded={false} onToggleLandmarks={() => {}} />

          {/* Sector Radar — live sweep showing all deployed structures */}
          <section>
            <SectionLabel text="Sector Scan" />
            <div
              className="px-4 py-4 rounded-xl"
              style={{
                background: "rgba(2,10,6,0.85)",
                border: "1px solid rgba(0,200,100,0.12)",
                boxShadow: "0 0 24px rgba(0,100,40,0.06), inset 0 0 32px rgba(0,0,0,0.3)",
              }}
            >
              <SectorRadar
                telescope={{ deployed: structureStatus.telescope.deployed, signals: structureStatus.telescope.count }}
                satellite={{ deployed: structureStatus.satellite.deployed, signals: structureStatus.satellite.count }}
                rover={{     deployed: structureStatus.rover.deployed,     signals: structureStatus.rover.count     }}
                solar={{     deployed: structureStatus.solar.deployed,     signals: structureStatus.solar.count     }}
                className="w-full"
              />
            </div>
          </section>

          {/* Onboarding / alerts */}
          <PushNotificationPrompt />
          <AnonymousUserPrompt classificationsCount={classifications.length} discoveryCount={linkedAnomalies.length} />

          {needsProfileSetup && (
            <button
              onClick={() => setShowProfileModal(true)}
              className="w-full text-left transition-all active:scale-[0.99]"
              style={{
                background: "linear-gradient(135deg, rgba(20,12,0,0.95) 0%, rgba(15,9,0,0.97) 100%)",
                border: "1px solid rgba(251,146,60,0.35)",
                borderRadius: "0.75rem",
                boxShadow: "0 0 16px rgba(251,146,60,0.08), inset 1px 1px 0 rgba(255,255,255,0.04), inset -1px -1px 0 rgba(0,0,0,0.3)",
              }}
            >
              {/* Top accent bar */}
              <div
                className="rounded-t-[0.75rem] h-0.5"
                style={{ background: "linear-gradient(90deg, transparent 0%, rgba(251,146,60,0.7) 30%, rgba(251,191,36,0.6) 50%, rgba(251,146,60,0.7) 70%, transparent 100%)" }}
              />
              <div className="flex items-center gap-3 px-4 py-3">
                {/* Warning icon pod */}
                <div
                  className="flex items-center justify-center w-9 h-9 rounded shrink-0"
                  style={{
                    background: "rgba(251,146,60,0.1)",
                    border: "1px solid rgba(251,146,60,0.3)",
                    boxShadow: "0 0 10px rgba(251,146,60,0.15), inset 0 0 6px rgba(0,0,0,0.3)",
                  }}
                >
                  <AlertTriangle className="h-4 w-4" style={{ color: "rgba(251,191,36,0.9)" }} aria-hidden />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="font-mono text-[7px] uppercase tracking-[0.25em]"
                      style={{ color: "rgba(251,146,60,0.5)" }}
                    >
                      CAUTION · PROFILE
                    </span>
                    <span
                      className="font-mono text-[7px] animate-pulse"
                      style={{ color: "rgba(251,191,36,0.45)" }}
                    >
                      ▲
                    </span>
                  </div>
                  <p className="text-xs font-black leading-snug mt-0.5" style={{ color: "rgba(255,255,255,0.8)" }}>
                    Profile incomplete
                  </p>
                  <p className="font-mono text-[8px] mt-0.5" style={{ color: "rgba(251,146,60,0.5)" }}>
                    Complete setup to unlock all mission features
                  </p>
                </div>
                <span
                  className="font-mono text-[8px] uppercase tracking-widest shrink-0"
                  style={{ color: "rgba(251,146,60,0.4)" }}
                >
                  TAP ›
                </span>
              </div>
            </button>
          )}

          {/* Mechanic survey */}
          {activeMechanicSurvey && (
            <MechanicPulseSurvey
              survey={activeMechanicSurvey}
              onSubmit={(answers) => completeMechanicSurvey(activeMechanicSurvey, answers)}
              onDismiss={() => dismissMechanicSurvey(activeMechanicSurvey)}
            />
          )}

          {/* ── Mission Briefing ── */}
          <section>
            <SectionLabel text="Mission Briefing" />
            {missionStats.awaiting > 0 ? (
              <MissionBriefCard
                variant="alert"
                title={`${missionStats.awaiting} Signal${missionStats.awaiting > 1 ? "s" : ""} Detected`}
                subtitle="Unclassified anomalies await analysis in your sector."
                actionLabel="Analyze Now"
                onAction={handleClassifyNow}
              />
            ) : missionStats.hasUnlockingSoon ? (
              <MissionBriefCard
                variant="progress"
                title="Structure Unlocking"
                subtitle="Gathering observation data for next deployment…"
                progress={65}
              />
            ) : missionStats.lastClassification ? (
              <MissionBriefCard
                variant="nominal"
                title="All Systems Nominal"
                subtitle={`Last observation: ${missionStats.lastClassification.classificationtype ?? "Confirmed"}`}
              />
            ) : (
              <MissionBriefCard
                variant="boot"
                title="Ready for Deployment"
                subtitle="Set up your telescope to begin collecting scientific data."
                actionLabel="Deploy Telescope"
                onAction={() => handleStructureClick("telescope")}
              />
            )}
          </section>

          {/* ── Station Schematic ── FTL-style module map replaces 2×2 card grid ── */}
          <section>
            <SectionLabel
              text="Station Modules"
              right={
                preferences.projectInterests.length > 0 ? (
                  <button onClick={() => setShowPreferencesModal(true)} className="hover:text-primary transition-colors">
                    Configure
                  </button>
                ) : undefined
              }
            />
            <StationSchematic
              telescopeStatus={structureStatus.telescope.deployed ? (structureStatus.telescope.count > 0 ? "alert" : "online") : "standby"}
              telescopeText={structureStatus.telescope.deployed ? `${structureStatus.telescope.count} target${structureStatus.telescope.count !== 1 ? "s" : ""}` : "Deploy to begin scanning"}
              telescopeSignals={structureStatus.telescope.count}
              satelliteStatus={structureStatus.satellite.deployed ? (structureStatus.satellite.count > 0 ? "alert" : "online") : "standby"}
              satelliteText={structureStatus.satellite.deployed ? `${structureStatus.satellite.count} cloud${structureStatus.satellite.count !== 1 ? "s" : ""}` : "Awaiting deployment"}
              satelliteSignals={structureStatus.satellite.count}
              satelliteAvailable={true}
              roverStatus={structureStatus.rover.deployed ? (structureStatus.rover.count > 0 ? "alert" : "online") : "standby"}
              roverText={structureStatus.rover.deployed ? `${structureStatus.rover.count} waypoint${structureStatus.rover.count !== 1 ? "s" : ""}` : "Deploy to terrain"}
              roverSignals={structureStatus.rover.count}
              solarStatus={structureStatus.solar.deployed ? "online" : "standby"}
              solarText={structureStatus.solar.deployed ? "Monitoring active" : "Join mission"}
              onNavigate={(target) => handleStructureClick(target)}
            />

            {/* Keep a hidden dummy section so downstream code doesn't break */}
            <div className="hidden">
            </div>
          </section>

          {/* ── Labs ── schematic-style list ── */}
          <section>
            <SectionLabel text="Auxiliary Systems" />
            <div
              className="rounded-xl overflow-hidden"
              style={{
                background: "rgba(3, 8, 18, 0.75)",
                border: "1px solid rgba(136,192,208,0.1)",
                backgroundImage: "linear-gradient(rgba(136,192,208,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(136,192,208,0.025) 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            >
              {/* Research lab row */}
              <button
                onClick={() => router.push("/research")}
                className="group w-full flex items-center gap-3 px-3 py-3 text-left transition-all hover:bg-violet-500/5 active:scale-[0.99]"
              >
                <div className="flex items-center gap-1.5 w-16 shrink-0">
                  <div className="h-1.5 w-1.5 rounded-full bg-violet-400/50" aria-hidden />
                  <span className="font-mono text-[7px] uppercase tracking-widest" style={{ color: "rgba(136,192,208,0.3)" }}>
                    AUX-01
                  </span>
                </div>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center border border-white/5 bg-violet-500/5 shrink-0 group-hover:border-violet-400/20 transition-colors">
                  <FlaskConical className="h-4 w-4 text-violet-400/60 group-hover:text-violet-300 transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-white/75 group-hover:text-white transition-colors leading-none mb-0.5">Research Lab</p>
                  <p className="font-mono text-[9px] text-violet-400/60">Tech tree · Upgrades</p>
                </div>
                <span className="font-mono text-[7px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "rgba(167,139,250,0.5)" }}>TX ›</span>
              </button>

              {/* Divider */}
              <div style={{ height: "1px", background: "rgba(136,192,208,0.06)" }} />

              {/* Cargo bay row */}
              <button
                onClick={() => handleViewChange("inventory")}
                className="group w-full flex items-center gap-3 px-3 py-3 text-left transition-all hover:bg-white/[0.02] active:scale-[0.99]"
              >
                <div className="flex items-center gap-1.5 w-16 shrink-0">
                  <div className="h-1.5 w-1.5 rounded-full bg-white/15" aria-hidden />
                  <span className="font-mono text-[7px] uppercase tracking-widest" style={{ color: "rgba(136,192,208,0.3)" }}>
                    AUX-02
                  </span>
                </div>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center border border-white/5 bg-white/[0.02] shrink-0 group-hover:border-white/10 transition-colors">
                  <Package className="h-4 w-4 text-white/25 group-hover:text-white/60 transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-white/75 group-hover:text-white transition-colors leading-none mb-0.5">Cargo Bay</p>
                  <p className="font-mono text-[9px] text-white/25">Minerals · Inventory</p>
                </div>
                <span className="font-mono text-[7px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "rgba(136,192,208,0.4)" }}>TX ›</span>
              </button>
            </div>
          </section>

          {/* ── Mission Log ── */}
          {logEntries.length > 0 && <MissionLogPanel entries={logEntries} />}

          {/* ── Agency Network ── */}
          <section>
            <SectionLabel text="Agency Network" />
            <AgencyNetworkCard
              referralCode={referralCode}
              referralsCount={referralCount}
              onCopyInvite={handleCopyReferralInvite}
            />
          </section>

        </main>

        {/* Bottom station navigation */}
        <StationNav
          active="base"
          onSelect={handleViewChange}
          alerts={{
            telescope: structureStatus.telescope.count > 0,
            satellite: structureStatus.satellite.count > 0,
            rover:     structureStatus.rover.count > 0,
            solar:     structureStatus.solar.count > 0,
          }}
        />

        {/* Notifications sheet */}
        <Sheet open={notificationsOpen} onOpenChange={setNotificationsOpen}>
          <SheetContent side="right" className="w-full sm:max-w-md">
            <SheetHeader>
              <SheetTitle className="font-mono text-xs uppercase tracking-widest">Activity Feed</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <RecentActivity activityFeed={activityFeed} otherClassifications={otherClassifications} />
            </div>
          </SheetContent>
        </Sheet>

        {/* Profile modal */}
        <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-primary">Complete Your Profile</DialogTitle>
            </DialogHeader>
            <CompleteProfileForm onSuccess={() => setShowProfileModal(false)} />
          </DialogContent>
        </Dialog>

        {/* Preferences modal */}
        <ProjectPreferencesModal
          isOpen={showPreferencesModal}
          onClose={() => setShowPreferencesModal(false)}
          onSave={handlePreferencesSave}
          initialInterests={preferences.projectInterests}
        />

        {/* NPS popup */}
        {showNpsModal && user && (
          <NPSPopup userId={user.id} isOpen={true} onClose={handleCloseNps} />
        )}

        <PWAPrompt />

        {/* Survey reward toast */}
        {surveyRewardToast && (
          <div
            className={cn(
              "fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[200]",
              "flex items-start gap-3 px-4 py-3 rounded-xl shadow-xl border whitespace-nowrap",
              "animate-in slide-in-from-bottom-4 fade-in duration-300",
              surveyRewardToast.variant === "success" && "bg-emerald-950/90 border-emerald-500/40 text-emerald-100",
              surveyRewardToast.variant === "error"   && "bg-red-950/90 border-red-500/40 text-red-100",
              surveyRewardToast.variant === "info"    && "bg-card/90 border-border/60 text-foreground"
            )}
          >
            <div>
              <p className="text-sm font-semibold leading-none mb-1">{surveyRewardToast.title}</p>
              <p className="text-xs opacity-80">{surveyRewardToast.description}</p>
            </div>
          </div>
        )}
      </div>
    </Suspense>
  );
}

export default function GamePage() {
  return (
    <Suspense fallback={<ControlStationSkeleton />}>
      <GamePageContent />
    </Suspense>
  );
}
