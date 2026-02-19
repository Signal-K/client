"use client";

import { Suspense, useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { useSession, useSessionContext } from "@supabase/auth-helpers-react";
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
import GameHeader from "@/src/components/game/GameHeader";
import PlanetHeroSection from "@/src/components/game/PlanetHeroSection";
import MissionControlCard from "@/src/components/game/MissionControlCard";
import StructureCard from "@/src/components/game/StructureCard";
import BottomNavigation from "@/src/components/game/BottomNavigation";
import RecentActivity from "@/src/components/social/activity/RecentActivity";

// Hooks
import { usePageData } from "@/hooks/usePageData";
import { useNPSManagement } from "@/hooks/useNPSManagement";
import { useUserPreferences } from "@/src/hooks/useUserPreferences";
import UseDarkMode from "@/src/shared/hooks/useDarkMode";

// Onboarding components
import ProjectPreferencesModal from "@/src/components/onboarding/ProjectPreferencesModal";
import { ProjectType } from "@/src/hooks/useUserPreferences";

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

const POSTHOG_SURVEY_ID = "019bb036-6cd7-0000-fc06-1c83a01e7759";
const POSTHOG_SURVEY_SHOWN_KEY = "posthog_survey_g5zk5h_shown_v1";

// Create a separate component for the search params logic
function GamePageContent() {
  const session = useSession();
  const { isLoading: isAuthLoading } = useSessionContext();
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

  // Show preferences modal on first visit or new device
  useEffect(() => {
    if (!preferencesLoading && needsPreferencesPrompt && session) {
      setShowPreferencesModal(true);
    }
  }, [preferencesLoading, needsPreferencesPrompt, session]);

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
          if (session?.user) {
            posthog?.capture("game_page_viewed", {
              user_id: session.user.id,
              classification_count: classifications.length,
              discovery_count: linkedAnomalies.length,
            });
          }
        }, [session, posthog, classifications.length, linkedAnomalies.length]);

        // Show the PostHog survey once, after meaningful engagement in gameplay.
        useEffect(() => {
          if (!session?.user || !posthog || activeView !== "base") {
            return;
          }

          if (showNpsModal || showPreferencesModal || showProfileModal) {
            return;
          }

          if (typeof window === "undefined") {
            return;
          }

          const alreadyShown = window.localStorage.getItem(POSTHOG_SURVEY_SHOWN_KEY) === "1";
          if (alreadyShown) {
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
              classifications: classifications.length,
              linked_anomalies: linkedAnomalies.length,
              meaningful_viewports: meaningfulViewports,
            });
            window.localStorage.setItem(POSTHOG_SURVEY_SHOWN_KEY, "1");
          }, 12000);

          return () => window.clearTimeout(timeout);
        }, [
          session?.user,
          posthog,
          activeView,
          showNpsModal,
          showPreferencesModal,
          showProfileModal,
          classifications.length,
          linkedAnomalies.length,
          openedViewports,
        ]);

        // Redirect unauthenticated users
        useEffect(() => {
          if (!isAuthLoading && !session) {
            router.push("/");
          }
        }, [isAuthLoading, session, router]);

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
        if (!session) {
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
              {showNpsModal && session && (
                <NPSPopup userId={session.user.id} isOpen={true} onClose={handleCloseNps} />
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
              {showNpsModal && session && (
                <NPSPopup userId={session.user.id} isOpen={true} onClose={handleCloseNps} />
              )}

              {/* Project Preferences Modal */}
              <ProjectPreferencesModal
                isOpen={showPreferencesModal}
                onClose={() => setShowPreferencesModal(false)}
                onSave={handlePreferencesSave}
                initialInterests={preferences.projectInterests}
              />

              <PWAPrompt />
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
