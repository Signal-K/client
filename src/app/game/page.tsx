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
    <div className="p-4 text-xs text-muted-foreground">Loading telescope…</div>
  ),
});
const SatelliteTab = dynamic(() => import("@/src/components/tabs/SatelliteTab"), {
  loading: () => (
    <div className="p-4 text-xs text-muted-foreground">Loading satellite…</div>
  ),
});
const RoverTab = dynamic(() => import("@/src/components/tabs/RoverTab"), {
  loading: () => <div className="p-4 text-xs text-muted-foreground">Loading rover…</div>,
});
const SolarTab = dynamic(() => import("@/src/components/tabs/SolarTab"), {
  loading: () => <div className="p-4 text-xs text-muted-foreground">Loading solar…</div>,
});
const InventoryTab = dynamic(() => import("@/src/components/tabs/InventoryTab"), {
  loading: () => (
    <div className="p-4 text-xs text-muted-foreground">Loading inventory…</div>
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

// New redesigned components
import GameHeader from "@/src/features/game/components/GameHeader";
import PlanetHeroSection from "@/src/features/game/components/PlanetHeroSection";
import MissionControlCard from "@/src/features/game/components/MissionControlCard";
import StructureCard from "@/src/features/game/components/StructureCard";
import BottomNavigation from "@/src/features/game/components/BottomNavigation";
import ReferralBoostCard from "@/src/features/game/components/ReferralBoostCard";
import ReferralMissionPrompt from "@/src/features/game/components/ReferralMissionPrompt";
import EcosystemMissionsCard from "@/src/features/game/components/EcosystemMissionsCard";
import MechanicPulseSurvey from "@/src/features/surveys/components/MechanicPulseSurvey";
import RecentActivity from "@/src/components/social/activity/RecentActivity";

// Hooks
import { usePageData } from "@/hooks/usePageData";
import { useNPSManagement } from "@/hooks/useNPSManagement";
import { useUserPreferences } from "@/src/hooks/useUserPreferences";
import UseDarkMode from "@/src/shared/hooks/useDarkMode";
import PushNotificationPrompt from "@/src/features/notifications/components/PushNotificationPrompt";

// Onboarding components
import ProjectPreferencesModal from "@/src/components/onboarding/ProjectPreferencesModal";
import { ProjectType } from "@/src/hooks/useUserPreferences";

// Utils
import { cn } from "@/src/shared/utils";
import { getOrCreateAnalyticsSessionToken } from "@/src/lib/analytics/session-token";
import {
  MECHANIC_SURVEYS,
  SURVEY_DISPLAY_DELAY_MS,
  surveyStorageKey,
} from "@/src/features/surveys/mechanic-surveys";
import type { MechanicMicroSurvey } from "@/src/features/surveys/types";

// Icons
import {
  Telescope,
  Satellite,
  Car,
  Package,
  Sun,
  FlaskConical,
  AlertCircle,
  CheckCircle,
  Clock,
  ChevronLeft,
} from "lucide-react";

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
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeStorageSet(key: string, value: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore storage write failures (private mode/storage restrictions).
  }
}

// Create a separate component for the search params logic
function GamePageContent() {
  const { user, isLoading: isAuthLoading } = useAuthUser();
  const posthog = usePostHog();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialView = (searchParams.get("view") as ViewMode) || "base";

  // State
  const [activeView, setActiveView] = useState<ViewMode>(initialView);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [openedViewports, setOpenedViewports] = useState<Set<ViewMode>>(new Set());
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralCount, setReferralCount] = useState(0);
  const [userHasReferral, setUserHasReferral] = useState<boolean | null>(null);
  const [showReferralMission, setShowReferralMission] = useState(false);
  const [surveyRewardToast, setSurveyRewardToast] = useState<{
    variant: "success" | "error" | "info";
    title: string;
    description: string;
  } | null>(null);
  const [activeMechanicSurvey, setActiveMechanicSurvey] = useState<MechanicMicroSurvey | null>(null);
  const [analyticsSessionToken] = useState<string | null>(() => getOrCreateAnalyticsSessionToken());

  // Hooks
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

  useEffect(() => {
    let ignore = false;
    const loadReferralSummary = async () => {
      if (!user) return;
      try {
        const response = await fetch("/api/gameplay/research/summary", { cache: "no-store" });
        const payload = await response.json().catch(() => null);
        if (!response.ok || !payload || ignore) return;
        setReferralCode(payload.referralCode ?? null);
        setReferralCount(Number(payload.referralCount ?? 0));
      } catch {
        if (!ignore) {
          setReferralCode(null);
          setReferralCount(0);
        }
      }
    };

    void loadReferralSummary();
    return () => {
      ignore = true;
    };
  }, [user]);

  useEffect(() => {
    let ignore = false;
    const loadReferralStatus = async () => {
      if (!user) return;
      try {
        const response = await fetch("/api/gameplay/profile/referral-status", {
          cache: "no-store",
        });
        const payload = await response.json().catch(() => null);
        if (!response.ok || !payload || ignore) return;
        const hasReferral = Boolean(payload.hasReferral);
        setUserHasReferral(hasReferral);

        const dismissed = safeStorageGet(REFERRAL_MISSION_DISMISSED_KEY) === "1";
        const shouldShow = !hasReferral && !dismissed;
        setShowReferralMission(shouldShow);
        if (shouldShow) {
          posthog?.capture("referral_mission_prompt_shown", {
            trigger_surface: "game",
            has_referral: false,
          });
        }
      } catch {
        if (!ignore) {
          setUserHasReferral(null);
          setShowReferralMission(false);
        }
      }
    };

    void loadReferralStatus();
    return () => {
      ignore = true;
    };
  }, [user, posthog]);

  const handleDismissReferralMission = useCallback(() => {
    safeStorageSet(REFERRAL_MISSION_DISMISSED_KEY, "1");
    setShowReferralMission(false);
    posthog?.capture("referral_mission_prompt_dismissed", {
      trigger_surface: "game",
    });
  }, [posthog]);

  const handleOpenReferralConsole = useCallback(() => {
    posthog?.capture("referral_mission_open_clicked", {
      trigger_surface: "game",
    });
    router.push("/referrals");
  }, [posthog, router]);

  const handleCopyReferralInvite = useCallback(async () => {
    if (!referralCode || typeof window === "undefined") return;
    const inviteUrl = `${window.location.origin}/auth?ref=${encodeURIComponent(referralCode)}`;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      posthog?.capture("referral_mission_copy_clicked", {
        trigger_surface: "game",
        has_referral_code: true,
      });
      setSurveyRewardToast({
        variant: "info",
        title: "Invite link copied",
        description: "Share it with a crewmate to grow your network.",
      });
      setTimeout(() => setSurveyRewardToast(null), 3000);
    } catch {
      // Ignore clipboard write issues.
    }
  }, [posthog, referralCode]);

  const completeMechanicSurvey = useCallback(
    async (survey: MechanicMicroSurvey, answers: Record<string, string>) => {
      if (!user) return;
      safeStorageSet(surveyStorageKey(survey.id, user.id), "done");
      posthog?.capture("mechanic_micro_survey_submitted", {
        survey_id: survey.id,
        survey_title: survey.title,
        trigger_surface: "game",
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
      posthog?.capture("mechanic_micro_survey_dismissed", {
        survey_id: survey.id,
        trigger_surface: "game",
        starsailors_session_token: analyticsSessionToken,
      });
      setActiveMechanicSurvey(null);
    },
    [analyticsSessionToken, posthog, user]
  );

  // Grant stardust reward when the user completes the PostHog survey.
  // Intercepts posthog.capture to detect the "survey sent" completion event.
  const handleSurveyReward = useCallback(async () => {
    if (!user || typeof window === "undefined") return;
    try {
      const alreadyRewarded = safeStorageGet(SURVEY_REWARD_GRANTED_KEY) === "1";
      if (alreadyRewarded) return; // Silent — already handled

      const res = await fetch("/api/gameplay/survey-reward", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          surveyId: POSTHOG_SURVEY_ID,
          surveyName: "Star Sailors Webapp Loop Survey 2.2",
        }),
      });
      const data = (await res.json()) as {
        granted?: boolean;
        alreadyGranted?: boolean;
        stardust?: number;
      };

      if (data.alreadyGranted) {
        safeStorageSet(SURVEY_REWARD_GRANTED_KEY, "1");
        // No toast — silently dedup server-side (client missed the key)
        return;
      }

      if (data.granted) {
        safeStorageSet(SURVEY_REWARD_GRANTED_KEY, "1");
        setSurveyRewardToast({
          variant: "success",
          title: `⭐ +${data.stardust ?? SURVEY_REWARD_STARDUST} Stardust`,
          description: "Thanks for your feedback!",
        });
      } else {
        setSurveyRewardToast({
          variant: "error",
          title: "Reward unavailable",
          description: "Couldn't grant reward — try refreshing.",
        });
      }
    } catch {
      setSurveyRewardToast({
        variant: "error",
        title: "Reward unavailable",
        description: "Couldn't grant reward — try refreshing.",
      });
    }
    setTimeout(() => setSurveyRewardToast(null), 4000);
  }, [user]);

  // Intercept posthog.capture to detect survey completion and trigger reward.
  useEffect(() => {
    if (!posthog || !user || typeof window === "undefined") return;

    const phAny = posthog as unknown as Record<string, unknown>;
    const originalCapture = phAny["capture"] as
      | ((this: unknown, ...args: unknown[]) => unknown)
      | undefined;
    if (typeof originalCapture !== "function") return;

    phAny["capture"] = function (this: unknown, eventName: unknown, ...rest: unknown[]) {
      if (eventName === "survey sent") {
        const props = rest[0] as Record<string, unknown> | undefined;
        if (
          props?.["$survey_id"] === POSTHOG_SURVEY_ID &&
          props?.["$survey_completed"] === true
        ) {
          void handleSurveyReward();
        }
      }
      return originalCapture.call(this, eventName, ...rest);
    };

    return () => {
      phAny["capture"] = originalCapture;
    };
  }, [posthog, user, handleSurveyReward]);

  // Show preferences modal on first visit or new device
  useEffect(() => {
    if (!preferencesLoading && needsPreferencesPrompt && user) {
      setShowPreferencesModal(true);
    }
  }, [preferencesLoading, needsPreferencesPrompt, user]);

        // Determine which structures to show based on preferences
        const shouldShowStructure = (structureType: "telescope" | "satellite" | "rover" | "solar") => {
          // If no preferences set, show all
          if (preferences.projectInterests.length === 0) return true;
          
          // Map structure types to project interests
          const structureToProjects: Record<string, ProjectType[]> = {
            telescope: ["planet-hunting", "asteroid-hunting"],
            satellite: ["cloud-tracking", "ice-tracking"],
            rover: ["rover-training"],
            solar: ["solar-monitoring"],
          };
          
          const relatedProjects = structureToProjects[structureType] || [];
          return relatedProjects.some(project => preferences.projectInterests.includes(project));
        };

        // Handle structure click - navigate to dedicated setup pages
        const handleStructureClick = (
          structureType: "telescope" | "satellite" | "rover" | "solar",
          viewMode: ViewMode
        ) => {
          console.log("[DEBUG] handleStructureClick - navigating to setup page:", structureType);
          
          // Navigate to dedicated setup pages with onboarding
          const setupRoutes = {
            telescope: "/setup/telescope",
            satellite: "/setup/satellite", 
            rover: "/setup/rover",
            solar: "/setup/solar"
          };
          
          router.push(setupRoutes[structureType]);
        };

        const handlePreferencesSave = (interests: ProjectType[]) => {
          setProjectInterests(interests);
          setShowPreferencesModal(false);
        };

        // Calculate mission control stats
        const missionStats = useMemo(() => {
          const unclassifiedCount = linkedAnomalies.filter((la) => {
            // Check if this anomaly has been classified
            return !classifications.some((c) => c.anomaly?.content === la.anomaly?.content);
          }).length;

          const recentClassifications = classifications.filter((c) => {
            const classDate = new Date(c.created_at);
            const now = new Date();
            const diffHours = (now.getTime() - classDate.getTime()) / (1000 * 60 * 60);
            return diffHours < 24;
          });

          // Check for upcoming unlocks
          const lockedAnomalies = linkedAnomalies.filter(
            (la) => la.unlocked === false || la.unlocked === null
          );
          const nextUnlock = lockedAnomalies.length > 0 ? lockedAnomalies[0] : null;

          return {
            awaiting: unclassifiedCount,
            recentCount: recentClassifications.length,
            lastClassification: recentClassifications[0],
            nextUnlock,
            hasUnlockingSoon: lockedAnomalies.length > 0,
          };
        }, [linkedAnomalies, classifications]);

        // Structure deployment status
        const structureStatus = useMemo(() => {
          const telescopeAnomalies = linkedAnomalies.filter(
            (la) =>
              la.automaton?.includes("telescope") ||
              la.anomaly?.anomalySet?.includes("telescope") ||
              la.anomaly?.anomalytype?.includes("planet")
          );
          const satelliteAnomalies = linkedAnomalies.filter(
            (la) =>
              la.automaton?.includes("Satellite") ||
              la.automaton?.includes("Weather") ||
              la.anomaly?.anomalySet?.includes("cloud")
          );
          const roverAnomalies = linkedAnomalies.filter(
            (la) =>
              la.automaton?.includes("rover") ||
              la.anomaly?.anomalySet?.includes("automaton")
          );
          const solarAnomalies = linkedAnomalies.filter(
            (la) => la.anomaly?.anomalySet?.includes("sunspot")
          );

          return {
            telescope: {
              deployed: telescopeAnomalies.length > 0,
              count: telescopeAnomalies.length,
              status: telescopeAnomalies.length > 0 ? `${telescopeAnomalies.length} targets` : "Deploy now",
            },
            satellite: {
              deployed: satelliteAnomalies.length > 0,
              count: satelliteAnomalies.length,
              status: satelliteAnomalies.length > 0 ? `${satelliteAnomalies.length} clouds` : "Unlocking...",
            },
            rover: {
              deployed: roverAnomalies.length > 0,
              count: roverAnomalies.length,
              status: roverAnomalies.length > 0 ? `${roverAnomalies.length} waypoints` : "Deploy now",
            },
            solar: {
              deployed: solarAnomalies.length > 0,
              count: solarAnomalies.length,
              status: solarAnomalies.length > 0 ? "Active" : "Join mission",
            },
          };
        }, [linkedAnomalies]);

        // Track page view
        useEffect(() => {
          if (user) {
            posthog?.capture("game_page_viewed", {
              user_id: user.id,
              classification_count: classifications.length,
              discovery_count: linkedAnomalies.length,
            });
          }
        }, [user, posthog, classifications.length, linkedAnomalies.length]);

        // Show the PostHog survey once, after meaningful engagement in gameplay.
        useEffect(() => {
          if (!user || !posthog || activeView !== "base") {
            return;
          }

          if (showNpsModal || showPreferencesModal || showProfileModal) {
            return;
          }

          if (typeof window === "undefined") {
            return;
          }

      const alreadyShown = safeStorageGet(POSTHOG_SURVEY_SHOWN_KEY) === "1";
      const lastShownRaw = safeStorageGet(POSTHOG_SURVEY_LAST_SHOWN_AT_KEY);
          const lastShown = lastShownRaw ? Number(lastShownRaw) : 0;
          const inCooldown = Number.isFinite(lastShown) && Date.now() - lastShown < POSTHOG_SURVEY_COOLDOWN_MS;

          if (alreadyShown || inCooldown) {
            return;
          }

          const meaningfulViewports = ["telescope", "satellite", "rover", "solar"].filter((view) =>
            openedViewports.has(view as ViewMode)
          ).length;
          const hasMeaningfulProgress =
            classifications.length >= 3 ||
            linkedAnomalies.length >= 5 ||
            meaningfulViewports >= 2;

          if (!hasMeaningfulProgress) {
            return;
          }

          const timeout = window.setTimeout(() => {
            posthog.displaySurvey(POSTHOG_SURVEY_ID);
            posthog.capture("posthog_survey_triggered", {
              survey_id: POSTHOG_SURVEY_ID,
              trigger_page: "game",
              trigger_surface: "web-client",
              classifications: classifications.length,
              linked_anomalies: linkedAnomalies.length,
              meaningful_viewports: meaningfulViewports,
            });
        safeStorageSet(POSTHOG_SURVEY_SHOWN_KEY, "1");
        safeStorageSet(POSTHOG_SURVEY_LAST_SHOWN_AT_KEY, String(Date.now()));
      }, 12000);

          return () => window.clearTimeout(timeout);
        }, [
          user,
          posthog,
          activeView,
          showNpsModal,
          showPreferencesModal,
          showProfileModal,
          classifications.length,
          linkedAnomalies.length,
          openedViewports,
        ]);

        useEffect(() => {
          if (!user || !posthog || activeView !== "base" || activeMechanicSurvey) return;
          if (showNpsModal || showPreferencesModal || showProfileModal || showReferralMission) return;

          const candidates = MECHANIC_SURVEYS.filter((survey) => survey.triggerSurface === "game");
          const telescopeClassifications = classifications.filter((c) =>
            (c.classificationtype || "").toLowerCase().includes("planet")
          ).length;
          const roverSignals = linkedAnomalies.filter(
            (la) =>
              (la.automaton || "").toLowerCase().includes("rover") ||
              (la.anomaly?.anomalySet || "").toLowerCase().includes("automaton")
          ).length;

          const firstEligible = candidates.find((survey) => {
            const alreadyDone = safeStorageGet(surveyStorageKey(survey.id, user.id)) === "done";
            if (alreadyDone) return false;

            if (survey.id === "mechanic_telescope_loop_v1") {
              return openedViewports.has("telescope") && telescopeClassifications >= 2;
            }
            if (survey.id === "mechanic_rover_loop_v1") {
              return openedViewports.has("rover") && roverSignals >= 1;
            }
            return false;
          });

          if (!firstEligible) return;

          const timeout = window.setTimeout(() => {
            setActiveMechanicSurvey(firstEligible);
            posthog.capture("mechanic_micro_survey_shown", {
              survey_id: firstEligible.id,
              survey_title: firstEligible.title,
              trigger_surface: "game",
              starsailors_session_token: analyticsSessionToken,
            });
          }, SURVEY_DISPLAY_DELAY_MS);

          return () => window.clearTimeout(timeout);
        }, [
          activeMechanicSurvey,
          activeView,
          analyticsSessionToken,
          classifications,
          linkedAnomalies,
          openedViewports,
          posthog,
          showNpsModal,
          showPreferencesModal,
          showProfileModal,
          showReferralMission,
          user,
        ]);

        // Redirect unauthenticated users
        useEffect(() => {
          if (!isAuthLoading && !user) {
            router.replace("/auth?next=/game");
          }
        }, [isAuthLoading, user, router]);

        // Handle view navigation
        const handleViewChange = (view: ViewMode) => {
          console.log("[DEBUG] handleViewChange called with:", view);
          console.log("[DEBUG] current activeView:", activeView);
          setActiveView(view);
          if (view !== "base" && view !== "inventory") {
            setOpenedViewports((prev) => {
              const next = new Set(prev);
              next.add(view);
              return next;
            });
          }
          posthog?.capture("viewport_opened", { viewport: view });
        };

        // Handle classify now action
        const handleClassifyNow = () => {
          // Find the first unclassified anomaly and navigate to it
          if (structureStatus.telescope.count > 0) {
            handleViewChange("telescope");
          } else if (structureStatus.satellite.count > 0) {
            handleViewChange("satellite");
          } else if (structureStatus.rover.count > 0) {
            handleViewChange("rover");
          }
        };

        const needsProfileSetup = !profile?.username || !profile?.full_name;

        // Loading state
        if (!user) {
          return (
            <div className="min-h-screen w-full flex items-center justify-center text-sm text-muted-foreground">
              Redirecting…
            </div>
          );
        }

        if (loading) {
          return (
            <div className="min-h-screen w-full relative">
              <div className="fixed inset-0 -z-10 bg-gradient-to-b from-background via-background to-background" />
              <div className="w-full max-w-screen-xl mx-auto px-4 py-20 space-y-4">
                <div className="h-32 bg-card/20 rounded-2xl animate-pulse" />
                <div className="h-24 bg-card/20 rounded-xl animate-pulse" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-28 bg-card/20 rounded-xl animate-pulse" />
                  <div className="h-28 bg-card/20 rounded-xl animate-pulse" />
                </div>
              </div>
            </div>
          );
        }

        // If in a viewport (not base), show full-screen viewport content
        if (activeView !== "base") {
          return (
            <div className="min-h-screen w-full relative">
              {/* Background */}
              <div className="fixed inset-0 -z-10">
                <TelescopeBackground
                  sectorX={0}
                  sectorY={0}
                  showAllAnomalies={false}
                  isDarkTheme={isDark}
                  variant="stars-only"
                  onAnomalyClick={() => {}}
                />
              </div>

              {/* Viewport Header */}
              <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
                <div className="flex items-center gap-4 px-4 py-3">
                  <button
                    onClick={() => setActiveView("base")}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    <span className="text-sm font-medium">Back</span>
                  </button>
                  <h1 className="text-lg font-semibold capitalize">{activeView}</h1>
                </div>
              </header>

              {/* Viewport Content */}
              <main className="pt-16 pb-4 px-4 min-h-screen">
                <div className="max-w-screen-xl mx-auto">
                  {activeView === "telescope" && <TelescopeTab />}
                  {activeView === "satellite" && <SatelliteTab />}
                  {activeView === "rover" && <RoverTab />}
                  {activeView === "solar" && <SolarTab />}
                  {activeView === "inventory" && <InventoryTab />}
                </div>
              </main>

              {/* NPS Popup */}
              {showNpsModal && user && (
                <NPSPopup userId={user.id} isOpen={true} onClose={handleCloseNps} />
              )}

              <PWAPrompt />
            </div>
          );
        }

        // Base view - main dashboard
        return (
          <Suspense fallback={<div>Loading...</div>}>
            <div className="min-h-screen w-full relative pb-20 md:pb-6">
              {/* Background */}
              <div className="fixed inset-0 -z-10">
                <TelescopeBackground
                  sectorX={0}
                  sectorY={0}
                  showAllAnomalies={false}
                  isDarkTheme={isDark}
                  variant="stars-only"
                  onAnomalyClick={() => {}}
                />
              </div>

              {/* Header */}
              <GameHeader
                stardust={classifications.length}
                hasNotifications={activityFeed.length > 0}
                onNotificationsClick={() => setNotificationsOpen(true)}
              />

              {/* Main Content */}
              <main className="pt-16">
                {/* Planet Hero Section */}
                <PlanetHeroSection
                  planetName="Earth"
                  sectorName="Home Base"
                  backgroundImage="/assets/Backdrops/Earth.png"
                  stardust={classifications.length}
                  rank={42}
                />

                {/* Content Container */}
                <div className="px-4 py-6 max-w-screen-xl mx-auto space-y-6">
                  <PushNotificationPrompt />
                  {showReferralMission && userHasReferral === false && (
                    <ReferralMissionPrompt
                      referralCode={referralCode}
                      onOpenReferral={handleOpenReferralConsole}
                      onDismiss={handleDismissReferralMission}
                      onCopyInvite={handleCopyReferralInvite}
                    />
                  )}
                  <ReferralBoostCard referralCode={referralCode} referralsCount={referralCount} />
                  {activeMechanicSurvey && (
                    <MechanicPulseSurvey
                      survey={activeMechanicSurvey}
                      onSubmit={(answers) => completeMechanicSurvey(activeMechanicSurvey, answers)}
                      onDismiss={() => dismissMechanicSurvey(activeMechanicSurvey)}
                    />
                  )}

                  {/* Anonymous User Prompt */}
                  <AnonymousUserPrompt
                    classificationsCount={classifications.length}
                    discoveryCount={linkedAnomalies.length}
                  />

                  {/* Profile Setup */}
                  {needsProfileSetup && (
                    <div
                      onClick={() => setShowProfileModal(true)}
                      className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 cursor-pointer hover:bg-amber-500/20 transition-colors"
                    >
                      <p className="text-sm text-amber-300">
                        <strong>Complete your profile</strong> to unlock all features
                      </p>
                    </div>
                  )}

                  {/* Mission Control Section */}
                  <section>
                    <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-3 px-1">
                      Mission Control
                    </h2>
                    <div className="space-y-3">
                      {/* Anomalies Awaiting */}
                      {missionStats.awaiting > 0 && (
                        <MissionControlCard
                          icon={<AlertCircle className="w-5 h-5" />}
                          title={`${missionStats.awaiting} Anomalies Awaiting`}
                          subtitle="Telescope targets ready to classify"
                          variant="action"
                          actionLabel="Classify Now"
                          onAction={handleClassifyNow}
                        />
                      )}

                      {/* Recent Classification */}
                      {missionStats.lastClassification && (
                        <MissionControlCard
                          icon={<CheckCircle className="w-5 h-5" />}
                          title="Classification Confirmed"
                          subtitle={`${missionStats.lastClassification.classificationtype || "Discovery"} • ${
                            new Date(missionStats.lastClassification.created_at).toLocaleDateString()
                          }`}
                          variant="status"
                        />
                      )}

                      {/* Unlock Progress */}
                      {missionStats.hasUnlockingSoon && (
                        <MissionControlCard
                          icon={<Clock className="w-5 h-5" />}
                          title="Satellite Unlocks Soon"
                          subtitle="Cloud formations awaiting analysis"
                          variant="progress"
                          progress={65}
                        />
                      )}
                    </div>
                  </section>

                  {/* Your Structures Section */}
                  <section>
                    <div className="flex items-center justify-between mb-3 px-1">
                      <h2 className="text-xs uppercase tracking-wider text-muted-foreground">
                        Your Structures
                      </h2>
                      {preferences.projectInterests.length > 0 && (
                        <button
                          onClick={() => setShowPreferencesModal(true)}
                          className="text-xs text-primary hover:underline"
                        >
                          Edit interests
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {shouldShowStructure("telescope") && (
                        <StructureCard
                          icon={<Telescope className="w-6 h-6" />}
                          name="Telescope"
                          status={structureStatus.telescope.status}
                          statusColor={structureStatus.telescope.deployed ? "green" : "muted"}
                          hasNotification={structureStatus.telescope.count > 0}
                          onClick={() => handleStructureClick("telescope", "telescope")}
                          data-structure="telescope"
                        />
                      )}
                      {shouldShowStructure("satellite") && (
                        <StructureCard
                          icon={<Satellite className="w-6 h-6" />}
                          name="Satellite"
                          status={structureStatus.satellite.status}
                          statusColor={structureStatus.satellite.deployed ? "blue" : "muted"}
                          onClick={() => handleStructureClick("satellite", "satellite")}
                          data-structure="satellite"
                        />
                      )}
                      {shouldShowStructure("rover") && (
                        <StructureCard
                          icon={<Car className="w-6 h-6" />}
                          name="Rover"
                          status={structureStatus.rover.status}
                          statusColor={structureStatus.rover.deployed ? "green" : "muted"}
                          onClick={() => handleStructureClick("rover", "rover")}
                          data-structure="rover"
                        />
                      )}
                      {shouldShowStructure("solar") && (
                        <StructureCard
                          icon={<Sun className="w-6 h-6" />}
                          name="Solar"
                          status={structureStatus.solar.status}
                          statusColor={structureStatus.solar.deployed ? "amber" : "muted"}
                          onClick={() => handleStructureClick("solar", "solar")}
                          data-structure="solar"
                        />
                      )}
                      <StructureCard
                        icon={<FlaskConical className="w-6 h-6" />}
                        name="Research"
                        status="Upgrades available"
                        statusColor="amber"
                        onClick={() => router.push("/research")}
                      />
                      <StructureCard
                        icon={<Package className="w-6 h-6" />}
                        name="Inventory"
                        status="View minerals"
                        statusColor="muted"
                        onClick={() => handleViewChange("inventory")}
                      />
                    </div>
                  </section>

                  <section>
                    <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-3 px-1">
                      Ecosystem Expansion
                    </h2>
                    <EcosystemMissionsCard />
                  </section>
                </div>
              </main>

              {/* Bottom Navigation (Mobile) */}
              <BottomNavigation
                activeItem="base"
                onItemClick={(item) => handleViewChange(item as ViewMode)}
                telescopeNotification={structureStatus.telescope.count > 0}
                satelliteNotification={structureStatus.satellite.count > 0}
                roverNotification={structureStatus.rover.count > 0}
                solarNotification={structureStatus.solar.count > 0}
              />

              {/* Notifications Sheet */}
              <Sheet open={notificationsOpen} onOpenChange={setNotificationsOpen}>
                <SheetContent side="right" className="w-full sm:max-w-md">
                  <SheetHeader>
                    <SheetTitle>Activity</SheetTitle>
                  </SheetHeader>
                  <div className="mt-4">
                    <RecentActivity
                      activityFeed={activityFeed}
                      otherClassifications={otherClassifications}
                    />
                  </div>
                </SheetContent>
              </Sheet>

              {/* Profile Modal */}
              <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-primary">Complete Your Profile</DialogTitle>
                  </DialogHeader>
                  <CompleteProfileForm onSuccess={() => setShowProfileModal(false)} />
                </DialogContent>
              </Dialog>

              {/* NPS Popup */}
              {showNpsModal && user && (
                <NPSPopup userId={user.id} isOpen={true} onClose={handleCloseNps} />
              )}

              {/* Project Preferences Modal */}
              <ProjectPreferencesModal
                isOpen={showPreferencesModal}
                onClose={() => setShowPreferencesModal(false)}
                onSave={handlePreferencesSave}
                initialInterests={preferences.projectInterests}
              />

              <PWAPrompt />

              {/* Survey Reward Toast */}
              {surveyRewardToast && (
                <div
                  className={cn(
                    "fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[200]",
                    "flex items-start gap-3 px-4 py-3 rounded-xl shadow-xl border",
                    "animate-in slide-in-from-bottom-4 fade-in duration-300 whitespace-nowrap",
                    surveyRewardToast.variant === "success" &&
                      "bg-emerald-950/90 border-emerald-500/40 text-emerald-100",
                    surveyRewardToast.variant === "error" &&
                      "bg-red-950/90 border-red-500/40 text-red-100",
                    surveyRewardToast.variant === "info" &&
                      "bg-card/90 border-border/60 text-foreground"
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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <GamePageContent />
    </Suspense>
  );
}
