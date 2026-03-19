"use client";

import { Suspense, useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { usePostHog } from "posthog-js/react";

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
import { ErrorBoundary } from "@/src/components/ui/ErrorBoundary";

// Station UI components — critical path (statically imported)
import { CommandHeader }    from "@/src/features/game/components/station/CommandHeader";
import { SectorBar }        from "@/src/features/game/components/station/SectorBar";
import { MissionBriefCard } from "@/src/features/game/components/station/MissionBriefCard";
import { StationCard }      from "@/src/features/game/components/station/StationCard";
import { StationNav }       from "@/src/features/game/components/station/StationNav";
import { ViewportHeader }   from "@/src/features/game/components/station/ViewportHeader";
import { SectionLabel }     from "@/src/features/game/components/station/SectionLabel";
import { MissionLogPanel, buildLogEntries } from "@/src/features/game/components/station/MissionLogPanel";
import { StationSchematic } from "@/src/features/game/components/station/StationSchematic";
import { SectorRadar }     from "@/src/features/game/components/station/SectorRadar";
import { HUDStrip }        from "@/src/features/game/components/station/HUDStrip";
import { StructureCard, StructureState, StructureId } from "@/src/features/game/components/station/StructureCard";

// Station UI components — deferred (right column / overlays)
const AgencyNetworkCard  = dynamic(() => import("@/src/features/game/components/station/AgencyNetworkCard").then(m => ({ default: m.AgencyNetworkCard })), { ssr: false });
const CoralFishtank      = dynamic(() => import("@/src/features/game/components/station/CoralFishtank").then(m => ({ default: m.CoralFishtank })), { ssr: false });
const HubLeaderboard     = dynamic(() => import("@/src/features/game/components/station/HubLeaderboard").then(m => ({ default: m.HubLeaderboard })), { ssr: false });
const GuidedDeployOverlay = dynamic(() => import("@/src/features/game/components/station/GuidedDeployOverlay").then(m => ({ default: m.GuidedDeployOverlay })), { ssr: false });
const LivingWorldBg      = dynamic(() => import("@/src/features/game/components/station/LivingWorldBg").then(m => ({ default: m.LivingWorldBg })), { ssr: false });

// Preserved feature components
import RecentActivity from "@/src/components/social/activity/RecentActivity";
import ProjectPreferencesModal from "@/src/components/onboarding/ProjectPreferencesModal";
import PushNotificationPrompt from "@/src/features/notifications/components/PushNotificationPrompt";
import ActivityHeader from "@/src/components/scenes/deploy/ActivityHeader";
import { GameSurveys } from "@/src/features/surveys/components/GameSurveys";
import ReferralMissionPrompt from "@/src/features/game/components/ReferralMissionPrompt";

// Hooks
import { useUserPreferences } from "@/src/hooks/useUserPreferences";
import type { TutorialId } from "@/src/hooks/useUserPreferences";
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
import { buildClientReferralUrl } from "@/src/features/referrals/referral-links";

// Icons
import { Telescope, Satellite, Car, Package, Sun, FlaskConical, AlertTriangle } from "lucide-react";

type ViewMode = "base" | "telescope" | "satellite" | "rover" | "solar" | "inventory";
type StructureSignalMap = Record<StructureId, number>;

const POSTHOG_SURVEY_ID = "019c83d3-d0a5-0000-4e8f-5b7fd8794666";
const POSTHOG_SURVEY_SHOWN_KEY = "posthog_survey_webapp_22_shown_v1";
const POSTHOG_SURVEY_LAST_SHOWN_AT_KEY = "posthog_survey_webapp_22_last_shown_at_v1";
const POSTHOG_SURVEY_COOLDOWN_MS = 14 * 24 * 60 * 60 * 1000;
const SURVEY_REWARD_GRANTED_KEY = "posthog_survey_webapp_22_reward_granted_v1";
const SURVEY_REWARD_STARDUST = 5;
const REFERRAL_MISSION_DISMISSED_KEY = "referral_mission_prompt_dismissed_v1";
const GAME_DATA_REFRESH_MS = 60_000;
const INCOMING_SIGNAL_WINDOW_MS = 1_600;

function safeStorageGet(key: string): string | null {
  if (typeof window === "undefined") return null;
  try { return window.localStorage.getItem(key); } catch { return null; }
}
function safeStorageSet(key: string, value: string) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(key, value); } catch { /* ignore */ }
}

interface GameClientProps {
    initialData: any;
    user: any;
}

export default function GameClient({ initialData, user }: GameClientProps) {
  const posthog = usePostHog();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialView = (searchParams.get("view") as ViewMode) || "base";

  const [activeView, setActiveView]           = useState<ViewMode>(initialView);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [showProfileModal, setShowProfileModal]   = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [openedViewports, setOpenedViewports] = useState<Set<ViewMode>>(new Set());
  const [referralMissionDismissed, setReferralMissionDismissed] = useState(true);
  const [surveyRewardToast, setSurveyRewardToast] = useState<{
    variant: "success" | "error" | "info";
    title: string;
    description: string;
  } | null>(null);
  const [activeMechanicSurvey, setActiveMechanicSurvey] = useState<MechanicMicroSurvey | null>(null);
  const [analyticsSessionToken] = useState<string | null>(() => getOrCreateAnalyticsSessionToken());

  // Guided deploy overlay
  const [guidedDeployTarget, setGuidedDeployTarget] = useState<StructureId | null>(null);
  const [ambientReady, setAmbientReady] = useState(false);

  // Use initialData as state so it can be updated if needed (optimistic updates or refetch)
  const [data, setData] = useState(initialData);
  const [incomingStructures, setIncomingStructures] = useState<Set<StructureId>>(new Set());
  const previousSignalCountsRef = useRef<StructureSignalMap | null>(null);
  const incomingTimeoutsRef = useRef<Partial<Record<StructureId, ReturnType<typeof setTimeout>>>>({});

  const { isDark } = UseDarkMode();
  const {
    preferences,
    isLoading: preferencesLoading,
    needsPreferencesPrompt,
    setProjectInterests,
    hasTutorialCompleted,
    markTutorialComplete,
  } = useUserPreferences();

  const handleViewChange = useCallback((view: ViewMode) => {
    posthog?.capture("structure_tab_switched", { from: activeView, to: view });
    setActiveView(view);
    if (view !== "base") {
      setOpenedViewports((prev) => new Set(prev).add(view));
    }
    // Update URL without full navigation
    const params = new URLSearchParams(window.location.search);
    if (view === "base") params.delete("view");
    else params.set("view", view);
    // Remove the from=apt param if present
    params.delete("from");
    router.replace(`/game?${params.toString()}`, { scroll: false });
  }, [router, posthog, activeView]);

  const handleStructureClick = useCallback((id: StructureId) => {
    const tutorialKey = `${id}-deploy` as TutorialId;
    if (!hasTutorialCompleted(tutorialKey)) {
      setGuidedDeployTarget(id);
    } else {
      handleViewChange(id);
    }
  }, [hasTutorialCompleted, handleViewChange]);

  // Hub viewed + apt redirect tracking
  useEffect(() => {
    posthog?.capture("game_hub_viewed", { userId: user?.id });
    if (searchParams.get("from") === "apt") {
      posthog?.capture("apt_logged_in_redirect", { userId: user?.id });
    }
    if (searchParams.get("from") === "landing") {
      posthog?.capture("landing_logged_in_redirect", { userId: user?.id });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Derived data
  const logEntries = useMemo(() => buildLogEntries(data.classifications, data.linkedAnomalies), [data]);

  const radarStations = useMemo(() => {
    const counts = {
      telescope: 0,
      satellite: 0,
      rover: 0,
      solar: 0,
    };
    data.linkedAnomalies.forEach((a: any) => {
      const type = a.anomaly?.anomalytype;
      if (type === "telescope") counts.telescope++;
      else if (type === "satellite") counts.satellite++;
      else if (type === "rover") counts.rover++;
      else if (type === "solar") counts.solar++;
    });

    return {
      telescope: { deployed: data.visibleStructures.telescope, signals: counts.telescope },
      satellite: { deployed: data.visibleStructures.satellites, signals: counts.satellite },
      rover:     { deployed: data.visibleStructures.rovers,    signals: counts.rover },
      solar:     { deployed: data.visibleStructures.balloons,  signals: counts.solar },
    };
  }, [data.linkedAnomalies, data.visibleStructures]);

  const signalCounts = useMemo<StructureSignalMap>(() => ({
    telescope: radarStations.telescope.signals,
    satellite: radarStations.satellite.signals,
    rover: radarStations.rover.signals,
    solar: radarStations.solar.signals,
  }), [radarStations]);

  const referralCode = typeof data.referralCode === "string" ? data.referralCode : null;
  const referralCount = Number(data.referralCount ?? 0);
  const userHasReferral = Boolean(data.hasReferral);
  const showReferralMission = !referralMissionDismissed && !userHasReferral;
  const showAmbientLayers = activeView === "base";

  const structureStates = useMemo<Record<StructureId, StructureState>>(() => ({
    telescope: !radarStations.telescope.deployed ? "undeployed" : incomingStructures.has("telescope") ? "incoming" : radarStations.telescope.signals > 0 ? "active" : "standby",
    satellite: !radarStations.satellite.deployed ? "undeployed" : incomingStructures.has("satellite") ? "incoming" : radarStations.satellite.signals > 0 ? "active" : "standby",
    rover: !radarStations.rover.deployed ? "undeployed" : incomingStructures.has("rover") ? "incoming" : radarStations.rover.signals > 0 ? "active" : "standby",
    solar: !radarStations.solar.deployed ? "undeployed" : incomingStructures.has("solar") ? "incoming" : radarStations.solar.signals > 0 ? "active" : "standby",
  }), [incomingStructures, radarStations]);

  const primaryMissionView = useMemo<ViewMode | null>(() => {
    const priority: StructureId[] = ["telescope", "satellite", "rover", "solar"];
    for (const view of priority) {
      if (structureStates[view] === "incoming" || structureStates[view] === "active") {
        return view;
      }
    }
    for (const view of priority) {
      if (radarStations[view].deployed) {
        return view;
      }
    }
    return null;
  }, [radarStations, structureStates]);

  const refreshGameData = useCallback(async () => {
    try {
      const response = await fetch("/api/gameplay/page-data", { cache: "no-store" });
      if (!response.ok) return;
      const nextData = await response.json();
      setData(nextData);
    } catch {
      // Keep the hub stable if background refresh fails.
    }
  }, []);

  useEffect(() => {
    let isRefreshing = false;

    const refreshIfVisible = async () => {
      if (document.visibilityState !== "visible" || isRefreshing) return;
      isRefreshing = true;
      try {
        await refreshGameData();
      } finally {
        isRefreshing = false;
      }
    };

    const intervalId = window.setInterval(() => {
      void refreshIfVisible();
    }, GAME_DATA_REFRESH_MS);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void refreshIfVisible();
      }
    };

    window.addEventListener("focus", handleVisibilityChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleVisibilityChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refreshGameData]);

  useEffect(() => {
    const previous = previousSignalCountsRef.current;
    previousSignalCountsRef.current = signalCounts;
    if (!previous) return;

    (Object.keys(signalCounts) as StructureId[]).forEach((structureId) => {
      if (signalCounts[structureId] <= previous[structureId]) return;

      setIncomingStructures((current) => {
        const next = new Set(current);
        next.add(structureId);
        return next;
      });

      const existingTimeout = incomingTimeoutsRef.current[structureId];
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      incomingTimeoutsRef.current[structureId] = setTimeout(() => {
        setIncomingStructures((current) => {
          const next = new Set(current);
          next.delete(structureId);
          return next;
        });
        delete incomingTimeoutsRef.current[structureId];
      }, INCOMING_SIGNAL_WINDOW_MS);
    });
  }, [signalCounts]);

  useEffect(() => () => {
    Object.values(incomingTimeoutsRef.current).forEach((timeoutId) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    });
  }, []);

  useEffect(() => {
    setReferralMissionDismissed(safeStorageGet(REFERRAL_MISSION_DISMISSED_KEY) === "1");
  }, []);

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let idleId: number | null = null;

    const enableAmbient = () => {
      if (!cancelled) {
        setAmbientReady(true);
      }
    };

    const supportsIdleCallback =
      typeof window !== "undefined" && typeof window.requestIdleCallback === "function";

    if (supportsIdleCallback) {
      idleId = window.requestIdleCallback(enableAmbient, { timeout: 300 });
    } else {
      timeoutId = globalThis.setTimeout(enableAmbient, 180);
    }

    return () => {
      cancelled = true;
      if (idleId !== null && typeof window !== "undefined" && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId !== null) {
        globalThis.clearTimeout(timeoutId);
      }
    };
  }, []);

  return (
    <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-background text-foreground selection:bg-primary/30">
      {showAmbientLayers && ambientReady ? (
        <TelescopeBackground variant="stars-only" />
      ) : (
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background to-background/80" />
      )}

      {/* ─── Living World Background ─── */}
      {showAmbientLayers && ambientReady && (
        <LivingWorldBg
          classifications={data.classifications ?? []}
          deployed={{
            telescope: radarStations.telescope.deployed,
            satellite: radarStations.satellite.deployed,
            rover:     radarStations.rover.deployed,
            solar:     radarStations.solar.deployed,
          }}
        />
      )}

      {/* ─── Command Header ─── */}
      <CommandHeader 
        stardust={Number(data.profile?.classificationPoints || 0)}
        hasAlerts={data.activityFeed?.length > 0}
        onAlertsClick={() => setNotificationsOpen(true)}
        onProfileClick={() => setShowProfileModal(true)}
        agencyId={data.profile?.username || data.profile?.id}
      />

      {/* ─── Persistent HUD Strip ─── */}
      <HUDStrip
        signals={Object.values(radarStations).reduce((s, r) => s + r.signals, 0)}
        anomalies={data.linkedAnomalies?.length ?? 0}
        classifications={data.classifications?.length ?? 0}
      />

      <main className="relative flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeView === "base" ? (
            <motion.div 
              key="base"
              initial={{ opacity: 0, scale: 1.06 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
              className="h-full overflow-hidden"
            >
              <div className="grid h-full grid-cols-1 gap-0 lg:grid-cols-[1fr_300px] lg:overflow-hidden">

                {/* ── Left / Main column ── */}
                <div className="flex h-full flex-col gap-3 p-3 sm:gap-4 sm:p-4 lg:overflow-y-auto">

                  {/* Mission Brief — always above fold */}
                  <MissionBriefCard
                    variant={
                      Object.values(radarStations).some(r => r.signals > 0) ? "alert"
                      : Object.values(radarStations).some(r => r.deployed) ? "progress"
                      : "boot"
                    }
                    title={
                      Object.values(radarStations).some(r => r.signals > 0)
                        ? "Signals detected — awaiting classification"
                        : Object.values(radarStations).some(r => r.deployed)
                          ? "Station active — all systems nominal"
                          : "No structures deployed"
                    }
                    subtitle={
                      !Object.values(radarStations).some(r => r.deployed)
                        ? "Deploy your first structure to begin receiving signals."
                        : Object.values(radarStations).some(r => r.signals > 0)
                          ? "Your live structures have fresh work queued. Jump straight to the active viewport."
                        : undefined
                    }
                    actionLabel={
                      !Object.values(radarStations).some(r => r.deployed)
                        ? "Deploy now"
                        : primaryMissionView
                          ? "Resume your mission"
                          : undefined
                    }
                    onAction={
                      !Object.values(radarStations).some(r => r.deployed)
                        ? () => handleViewChange("telescope")
                        : primaryMissionView
                          ? () => handleViewChange(primaryMissionView)
                          : undefined
                    }
                  />

                  {/* Sector Radar — hidden until first deployment */}
                  {Object.values(radarStations).some(r => r.deployed) ? (
                    <>
                      <SectionLabel text="Sector Radar" />
                      <SectorRadar
                        {...radarStations}
                        onSelect={handleStructureClick}
                        states={structureStates}
                        className="origin-top justify-center scale-[0.94] sm:scale-100 lg:justify-start"
                      />
                    </>
                  ) : (
                    <div className="rounded-xl border border-border/20 p-4 text-center sm:p-6">
                      <p className="text-sm font-bold text-foreground/60">What do you want to do today?</p>
                      <p className="mt-1 text-xs text-muted-foreground/50">Deploy a structure to start scanning your sector.</p>
                      <div className="mt-4 grid grid-cols-2 gap-2 text-left">
                        {[
                          { id: "telescope" as const, label: "Hunt planets", accent: "border-teal-500/30 text-teal-300 hover:bg-teal-500/10" },
                          { id: "satellite" as const, label: "Track weather", accent: "border-sky-500/30 text-sky-300 hover:bg-sky-500/10" },
                          { id: "rover" as const, label: "Train rovers", accent: "border-amber-500/30 text-amber-300 hover:bg-amber-500/10" },
                          { id: "solar" as const, label: "Join solar", accent: "border-orange-500/30 text-orange-300 hover:bg-orange-500/10" },
                        ].map((option) => (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => handleStructureClick(option.id)}
                            className={cn(
                              "rounded-lg border px-3 py-2 text-xs font-semibold transition-colors",
                              option.accent,
                            )}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => setShowPreferencesModal(true)}
                        className="mt-4 rounded-full border border-teal-500/40 px-5 py-2 text-xs font-bold text-teal-400 hover:bg-teal-500/10 transition-colors"
                      >
                        + Add project
                      </button>
                    </div>
                  )}

                  {/* Structure cards — primary navigation */}
                  <SectionLabel text="Station Systems" />
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
                    {(["telescope","satellite","rover","solar"] as const).map((id) => {
                      const station = radarStations[id];
                      const state = structureStates[id];
                      return (
                        <StructureCard
                          key={id}
                          id={id}
                          state={state}
                          signals={station.signals}
                          isSolar={id === "solar"}
                          onClick={() => handleStructureClick(id)}
                        />
                      );
                    })}
                  </div>

                  {/* Add project button — post-onboarding */}
                  <button
                    onClick={() => setShowPreferencesModal(true)}
                    className="self-start rounded-full border border-border/30 px-4 py-1.5 text-[11px] font-bold text-muted-foreground/60 transition-colors hover:border-border/60 hover:text-foreground"
                  >
                    + Add project
                  </button>
                </div>

                {/* ── Right column (desktop only) ── */}
                <div className="hidden lg:flex flex-col gap-4 p-4 border-l border-border/20 overflow-y-auto">
                  {/* Referral — primary growth mechanic, top of right column */}
                  <SectionLabel text="Recruit New Sailors" />
                  {showReferralMission && (
                    <ReferralMissionPrompt
                      referralCode={referralCode}
                      onOpenReferral={() => router.push("/referrals")}
                      onDismiss={() => {
                        safeStorageSet(REFERRAL_MISSION_DISMISSED_KEY, "1");
                        setReferralMissionDismissed(true);
                      }}
                      onCopyInvite={() => {
                        if (!referralCode) return;
                        navigator.clipboard.writeText(buildClientReferralUrl(referralCode) || referralCode);
                      }}
                      className="mb-4"
                    />
                  )}
                  <AgencyNetworkCard 
                    referralCode={referralCode}
                    referralsCount={referralCount}
                    userId={user?.id}
                    onCopyInvite={() => {
                      if (referralCode) {
                        navigator.clipboard.writeText(buildClientReferralUrl(referralCode) || `${window.location.origin}/auth?ref=${referralCode}`);
                      }
                    }}
                  />

                  <SectionLabel text="Mission Log" />
                  <MissionLogPanel entries={logEntries} />

                  <SectionLabel text="Rankings" />
                  <HubLeaderboard
                    entries={data.hubLeaderboard?.entries ?? []}
                    currentUser={data.hubLeaderboard?.currentUser ?? null}
                  />

                  <SectionLabel text="Coral Lab" />
                  <CoralFishtank userId={user?.id} />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="viewport"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.06 }}
              transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
              className="flex h-full flex-col"
            >
              <ViewportHeader 
                label={activeView.toUpperCase()}
                stationId={activeView} 
                onBack={() => handleViewChange("base")} 
              />
              <div className="flex-1 overflow-y-auto p-4 md:p-6">
                <ErrorBoundary label={activeView}>
                  {activeView === "telescope" && <TelescopeTab />}
                  {activeView === "satellite" && <SatelliteTab />}
                  {activeView === "rover"     && <RoverTab />}
                  {activeView === "solar"     && <SolarTab />}
                  {activeView === "inventory" && <InventoryTab />}
                </ErrorBoundary>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ─── Modals & Overlays ─── */}
      <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Sailor Profile</DialogTitle>
          </DialogHeader>
          <CompleteProfileForm onSuccess={() => setShowProfileModal(false)} />
        </DialogContent>
      </Dialog>

      <Sheet open={notificationsOpen} onOpenChange={setNotificationsOpen}>
        <SheetContent side="right" className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Notifications</SheetTitle>
          </SheetHeader>
          <div className="py-6">
             <RecentActivity 
                activityFeed={data.activityFeed}
                otherClassifications={data.otherClassifications}
             />
          </div>
        </SheetContent>
      </Sheet>

      <ProjectPreferencesModal
        isOpen={showPreferencesModal || needsPreferencesPrompt}
        initialInterests={preferences?.projectInterests ?? []}
        onClose={() => setShowPreferencesModal(false)}
        onSave={(prefs) => {
          setProjectInterests(prefs);
          setShowPreferencesModal(false);
        }}
      />

      {guidedDeployTarget && (
        <GuidedDeployOverlay
          structureId={guidedDeployTarget}
          onComplete={() => {
            markTutorialComplete(`${guidedDeployTarget}-deploy` as TutorialId);
            setGuidedDeployTarget(null);
            handleViewChange(guidedDeployTarget);
          }}
          onSkip={() => {
            markTutorialComplete(`${guidedDeployTarget}-deploy` as TutorialId);
            setGuidedDeployTarget(null);
            handleViewChange(guidedDeployTarget);
          }}
        />
      )}

      <PWAPrompt />
      <PushNotificationPrompt />
      <GameSurveys userId={user?.id} classifications={data.classifications ?? []} />
    </div>
  );
}

// Framer motion imports
import { motion, AnimatePresence } from "framer-motion";
