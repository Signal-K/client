"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from 'next/dynamic';
import { useSession } from "@supabase/auth-helpers-react";
import { usePostHog } from 'posthog-js/react';

// Dynamic heavy components (Three.js scene, popup, banners, forms)
const TelescopeBackground = dynamic(() => import('@/src/components/classification/telescope/telescope-background').then(m => m.TelescopeBackground), { ssr: false, loading: () => <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background to-background/80" /> });
const NPSPopup = dynamic(() => import('@/src/components/ui/helpers/nps-popup'), { loading: () => null });
const WeeklyBanner = dynamic(() => import('@/src/components/ui/update-banner'), { loading: () => null });
const CompleteProfileForm = dynamic(() => import('@/src/components/profile/setup/FinishProfile'), { loading: () => <div className="p-4 text-xs text-muted-foreground">Loading profile form…</div> });
const PWAPrompt = dynamic(() => import('@/src/components/pwa/PWAPrompt'), { loading: () => null });
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import AnonymousUserPrompt from "@/src/components/profile/auth/AnonymousUserPrompt";

import MainHeader from "@/src/components/layout/Header/MainHeader";
const ActivityHeaderSection = dynamic(() => import('@/src/components/social/activity/ActivityHeaderSection'), { loading: () => null });
const ProfileSetupRequired = dynamic(() => import('@/src/components/profile/setup/ProfileSetupRequired'), { loading: () => null });
// Remove unused NotificationSubscribeButton (not rendered)

// Import custom hooks
import { usePageData } from "@/hooks/usePageData";
import { useNPSManagement } from "@/hooks/useNPSManagement";
import { useTabsPersistence, TabConfig } from "@/hooks/useTabsPersistence";
import UseDarkMode from "@/src/shared/hooks/useDarkMode";

// Import tab components
const TelescopeTab = dynamic(() => import('@/src/components/tabs/TelescopeTab'), { loading: () => <div className="p-2 text-xs text-muted-foreground">Loading telescope…</div> });
const SatelliteTab = dynamic(() => import('@/src/components/tabs/SatelliteTab'), { loading: () => <div className="p-2 text-xs text-muted-foreground">Loading satellite…</div> });
const RoverTab = dynamic(() => import('@/src/components/tabs/RoverTab'), { loading: () => <div className="p-2 text-xs text-muted-foreground">Loading rover…</div> });
const SolarTab = dynamic(() => import('@/src/components/tabs/SolarTab'), { loading: () => <div className="p-2 text-xs text-muted-foreground">Loading solar…</div> });
const InventoryTab = dynamic(() => import('@/src/components/tabs/InventoryTab'), { loading: () => <div className="p-2 text-xs text-muted-foreground">Loading inventory…</div> });
const UpdatesTab = dynamic(() => import('@/src/components/tabs/UpdatesTab'), { loading: () => <div className="p-2 text-xs text-muted-foreground">Loading updates…</div> });
const OnboardingTab = dynamic(() => import('@/src/components/tabs/OnboardingTab'), { loading: () => <div className="p-2 text-xs text-muted-foreground">Loading onboarding…</div> });

// Import icons
import { Telescope, Satellite, Car, Package, Bell, Sun, ArrowLeft, ArrowRight } from "lucide-react";

// Simple Tab Trigger with reorder buttons
interface SimpleTabTriggerProps {
  id: string;
  icon: React.ReactNode;
  label: string;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
  canMoveLeft: boolean;
  canMoveRight: boolean;
  onTabClick: (id: string) => void;
};

function SimpleTabTrigger({ 
  id, 
  icon, 
  label, 
  onMoveLeft, 
  onMoveRight,
  canMoveLeft,
  canMoveRight,
  onTabClick
}: SimpleTabTriggerProps) {
  return (
    <div className="relative group flex flex-shrink-0 items-center gap-0.5">
      {canMoveLeft && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMoveLeft?.();
          }}
          className="hidden rounded p-1 transition-opacity hover:bg-background/40 sm:flex sm:opacity-0 sm:group-hover:opacity-100"
          title="Move left"
        >
          <ArrowLeft className="w-3 h-3 text-muted-foreground" />
        </button>
      )}
      
      <TabsTrigger
        value={id}
        className="flex h-9 flex-shrink-0 items-center gap-1.5 data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
        onClick={(e) => {
          e.preventDefault();
          onTabClick(id);
        }}
      >
        {icon}
        <span className="text-xs sm:text-sm">{label}</span>
      </TabsTrigger>

      {canMoveRight && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMoveRight?.();
          }}
          className="hidden rounded p-1 transition-opacity hover:bg-background/40 sm:flex sm:opacity-0 sm:group-hover:opacity-100"
          title="Move right"
        >
          <ArrowRight className="w-3 h-3 text-muted-foreground" />
        </button>
      )}
    </div>
  );
}

type TabId = "updates" | "solar" | "telescope" | "satellite" | "rover" | "inventory";

export default function GamePage() {
  const session = useSession();
  const posthog = usePostHog();
  const router = useRouter();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [landmarksExpanded, setLandmarksExpanded] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [tabContentExpanded, setTabContentExpanded] = useState(false);
  const [showReorderHint, setShowReorderHint] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const tabListContainerRef = useRef<HTMLDivElement | null>(null);

  const updateScrollState = useCallback(() => {
    const container = tabListContainerRef.current;
    if (!container) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }

    const { scrollLeft, scrollWidth, clientWidth } = container;
    const epsilon = 1;
    setCanScrollLeft(scrollLeft > epsilon);
    setCanScrollRight(scrollWidth - clientWidth - scrollLeft > epsilon);
  }, []);

  // Custom hooks for data management
  const {
    linkedAnomalies,
    activityFeed,
    profile,
    classifications,
    otherClassifications,
    loading,
  } = usePageData();

  const { showNpsModal, handleCloseNps } = useNPSManagement();

  // Use the global theme hook
  const { isDark, toggleDarkMode } = UseDarkMode();

  // Tab persistence hook
  const {
    activeTab,
    setActiveTab,
    initializeTabOrder,
    reorderTabs,
    getOrderedTabs,
    isInitialized,
    hasSavedOrder,
  } = useTabsPersistence('updates');

  // Handle tab click - toggle full screen if clicking active tab, otherwise switch tabs
  const handleTabClick = (tabId: string) => {
    if (tabId === activeTab) {
      // Toggle full screen when clicking active tab
      setIsFullScreen(prev => !prev);
      posthog?.capture('tab_fullscreen_toggled', {
        tab_id: tabId,
        is_fullscreen: !isFullScreen,
      });
    } else {
      // Switch to new tab, keep full screen state
      setActiveTab(tabId);
      posthog?.capture('tab_switched', {
        from_tab: activeTab,
        to_tab: tabId,
        classification_count: classifications.length,
      });
    }
  };

  // Track page view and user state
  useEffect(() => {
    if (session?.user) {
      posthog?.capture('game_page_viewed', {
        user_id: session.user.id,
        has_classifications: classifications.length > 0,
        classification_count: classifications.length,
        has_discoveries: linkedAnomalies.length > 0,
        discovery_count: linkedAnomalies.length,
        needs_profile_setup: needsProfileSetup,
      });
    }
  }, [session, posthog]);

  // Check if user has seen the reorder hint
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasSeenHint = localStorage.getItem('tab-reorder-hint-seen');
      if (hasSeenHint) {
        setShowReorderHint(false);
      }
    }
  }, []);

  const dismissReorderHint = () => {
    setShowReorderHint(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('tab-reorder-hint-seen', 'true');
    }
    posthog?.capture('reorder_hint_dismissed');
  };

  const tabPriorityCounts = useMemo(() => {
    const counts: Record<TabId, number> = {
      updates: 0,
      solar: 0,
      telescope: 0,
      satellite: 0,
      rover: 0,
      inventory: 0,
    };

    linkedAnomalies.forEach((linked) => {
      const automaton = (linked.automaton || '').toLowerCase();
      const anomalyType = (linked.anomaly?.anomalytype || '').toLowerCase();
      const anomalySet = (linked.anomaly?.anomalySet || '').toLowerCase();

      if (anomalyType.includes('sunspot') || anomalyType.includes('solar') || anomalySet.includes('sunspot')) {
        counts.solar += 1;
      }

      if (
        automaton.includes('telescope') ||
        anomalyType.includes('planet') ||
        anomalyType.includes('asteroid') ||
        anomalyType.includes('variable') ||
        anomalyType.includes('disk') ||
        anomalySet.includes('telescope') ||
        anomalySet.includes('planet') ||
        anomalySet.includes('asteroid') ||
        anomalySet.includes('variable') ||
        anomalySet.includes('disk')
      ) {
        counts.telescope += 1;
      }

      if (
        automaton.includes('satellite') ||
        automaton.includes('weather') ||
        anomalyType.includes('cloud') ||
        anomalyType.includes('balloon') ||
        anomalyType.includes('lidar') ||
        anomalySet.includes('cloud') ||
        anomalySet.includes('balloon') ||
        anomalySet.includes('lidar')
      ) {
        counts.satellite += 1;
      }

      if (
        automaton.includes('rover') ||
        anomalyType.includes('rover') ||
        anomalyType.includes('automaton') ||
        anomalySet.includes('rover') ||
        anomalySet.includes('automaton')
      ) {
        counts.rover += 1;
      }
    });

    return counts;
  }, [linkedAnomalies]);

  const baseTabs: TabConfig[] = useMemo(() => [
    {
      id: 'updates',
      label: 'Updates',
      icon: <Bell className="w-4 h-4" />,
    },
    {
      id: 'solar',
      label: 'Solar',
      icon: <Sun className="w-4 h-4" />,
    },
    {
      id: 'telescope',
      label: 'Telescope',
      icon: <Telescope className="w-4 h-4" />,
    },
    {
      id: 'satellite',
      label: 'Satellite',
      icon: <Satellite className="w-4 h-4" />,
    },
    {
      id: 'rover',
      label: 'Rover',
      icon: <Car className="w-4 h-4" />,
    },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: <Package className="w-4 h-4" />,
    },
  ], []);

  const prioritizedTabs = useMemo(() => {
    if (hasSavedOrder) {
      return baseTabs;
    }

    const baseOrder: Record<TabId, number> = {
      updates: 0,
      solar: 1,
      telescope: 2,
      satellite: 3,
      rover: 4,
      inventory: 5,
    };

    return [...baseTabs].sort((a, b) => {
      const aId = a.id as TabId;
      const bId = b.id as TabId;
      const aBoost = tabPriorityCounts[aId] > 0 ? 10 : 0;
      const bBoost = tabPriorityCounts[bId] > 0 ? 10 : 0;
      const aScore = baseOrder[aId] - aBoost - tabPriorityCounts[aId] * 0.01;
      const bScore = baseOrder[bId] - bBoost - tabPriorityCounts[bId] * 0.01;
      return aScore - bScore;
    });
  }, [baseTabs, tabPriorityCounts, hasSavedOrder]);

  const orderedTabs = useMemo(() => getOrderedTabs(prioritizedTabs), [prioritizedTabs, getOrderedTabs]);

  useEffect(() => {
    if (isInitialized) {
      initializeTabOrder(prioritizedTabs);
    }
  }, [prioritizedTabs, initializeTabOrder, isInitialized]);

  useEffect(() => {
    const container = tabListContainerRef.current;
    updateScrollState();

    if (!container) {
      return;
    }

    const handleScroll = () => updateScrollState();
    const rafId = requestAnimationFrame(updateScrollState);

    container.addEventListener('scroll', handleScroll);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => updateScrollState());
      resizeObserver.observe(container);
    }

    window.addEventListener('resize', updateScrollState);

    return () => {
      cancelAnimationFrame(rafId);
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateScrollState);
      resizeObserver?.disconnect();
    };
  }, [orderedTabs, updateScrollState]);

  // Move tab left or right
  const moveTab = (tabId: string, direction: 'left' | 'right') => {
    const tabIds = orderedTabs.map(tab => tab.id);
    const currentIndex = tabIds.indexOf(tabId);
    
    if (direction === 'left' && currentIndex > 0) {
      const newOrder = [...tabIds];
      [newOrder[currentIndex - 1], newOrder[currentIndex]] = [newOrder[currentIndex], newOrder[currentIndex - 1]];
      reorderTabs(newOrder);
      posthog?.capture('tab_reordered', {
        tab_id: tabId,
        direction: 'left',
        new_index: currentIndex - 1,
      });
    } else if (direction === 'right' && currentIndex < tabIds.length - 1) {
      const newOrder = [...tabIds];
      [newOrder[currentIndex], newOrder[currentIndex + 1]] = [newOrder[currentIndex + 1], newOrder[currentIndex]];
      reorderTabs(newOrder);
      posthog?.capture('tab_reordered', {
        tab_id: tabId,
        direction: 'right',
        new_index: currentIndex + 1,
      });
    }
  };

  const needsProfileSetup = !profile?.username || !profile?.full_name;

  // Redirect unauthenticated users to `/` (middleware may handle this server-side; this is a client fallback)
  useEffect(() => {
    if (!session) {
      router.push('/');
    }
  }, [session, router]);

  // If not logged in, show minimal gate while redirect happens.
  if (!session) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center text-sm text-muted-foreground">
        Redirecting…
      </div>
    );
  }

  // Lightweight skeleton while data loads to avoid blocking on dynamic chunk hydration.
  // Important: do not gate the entire page on having data, or new users will see the
  // skeleton forever.
  if (loading) {
    return (
      <div className="min-h-screen w-full relative flex justify-center">
        <div className="fixed inset-0 -z-10 bg-gradient-to-b from-background via-background to-background" />
        <div className="w-full max-w-screen-xl px-4 py-6 space-y-6 pt-24 relative z-10">
          <div className="h-8 w-48 bg-primary/10 rounded animate-pulse" />
          <div className="grid gap-4">
            <div className="h-40 bg-background/40 border border-primary/10 rounded animate-pulse" />
            <div className="h-64 bg-background/40 border border-primary/10 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative flex justify-center">
      {/* Telescope Background - Full screen behind everything */}
      <div className="fixed inset-0 -z-10">
        <TelescopeBackground
          sectorX={0}
          sectorY={0}
          showAllAnomalies={false}
          isDarkTheme={isDark}
          variant="stars-only"
          onAnomalyClick={(anomaly) => console.log("Clicked anomaly:", anomaly)}
        />
      </div>

      {/* Main Header */}
      <MainHeader
        isDark={isDark}
        onThemeToggle={() => {
          toggleDarkMode();
          posthog?.capture('theme_toggled', { new_theme: !isDark ? 'dark' : 'light' });
        }}
        notificationsOpen={notificationsOpen}
        onToggleNotifications={() => {
          setNotificationsOpen((open) => {
            posthog?.capture('notifications_toggled', { is_open: !open });
            return !open;
          });
        }}
        activityFeed={activityFeed}
        otherClassifications={otherClassifications}
      />

      <div className="w-full max-w-screen-xl px-4 py-6 space-y-6 pt-24 relative z-10">
        {/* Anonymous User Upgrade Prompt */}
        <AnonymousUserPrompt
          classificationsCount={classifications.length}
          discoveryCount={linkedAnomalies.length}
        />

        {/* Activity Header - User profile and deployment status - Hidden when full screen */}
        {!tabContentExpanded && !isFullScreen && (
          <ActivityHeaderSection
            classificationsCount={classifications.length}
            landmarksExpanded={landmarksExpanded}
            onToggleLandmarks={() => {
              setLandmarksExpanded((prev) => {
                posthog?.capture('landmarks_toggled', { is_expanded: !prev });
                return !prev;
              });
            }}
          />
        )}

        {/* Profile Setup Required */}
        {needsProfileSetup && (
          <ProfileSetupRequired
            onOpenProfileModal={() => {
              posthog?.capture('profile_setup_modal_opened');
              setShowProfileModal(true);
            }}
          />
        )}

        {/* Main Tabbed Interface */}
        <div className="bg-background/40 backdrop-blur-md rounded-xl border border-[#78cce2]/30 shadow-2xl overflow-hidden">
          <Tabs value={activeTab} className="w-full">
            {/* Tab Navigation */}
            <div className="border-b border-[#78cce2]/20 bg-background/60 backdrop-blur-sm">
              <div className="relative">
                {canScrollLeft && (
                  <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-background to-transparent" />
                )}
                <div
                  ref={tabListContainerRef}
                  className="overflow-x-auto sm:overflow-visible"
                  style={{ WebkitOverflowScrolling: "touch" }}
                >
                  <TabsList className="flex min-w-max flex-nowrap gap-1 p-2 bg-transparent sm:min-w-0 sm:flex-wrap">
                    {orderedTabs.map((tab, index) => (
                      <SimpleTabTrigger
                        key={tab.id}
                        id={tab.id}
                        icon={tab.icon}
                        label={tab.label}
                        onMoveLeft={() => moveTab(tab.id, 'left')}
                        onMoveRight={() => moveTab(tab.id, 'right')}
                        canMoveLeft={index > 0}
                        canMoveRight={index < orderedTabs.length - 1}
                        onTabClick={handleTabClick}
                      />
                    ))}
                  </TabsList>
                </div>
                {canScrollRight && (
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex w-14 items-center justify-end bg-gradient-to-l from-background to-transparent pr-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full border border-primary/40 bg-background/90 shadow-sm">
                      <ArrowRight className="h-3.5 w-3.5 text-primary" />
                    </div>
                  </div>
                )}
              </div>

              {/* Reorder hint - shows on first visit */}
              {showReorderHint && (
                <div className="px-3 pb-2">
                  <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-primary/10 border border-primary/30">
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <ArrowLeft className="w-3.5 h-3.5 text-primary" />
                      <ArrowRight className="w-3.5 h-3.5 text-primary" />
                      <span>
                        <strong className="text-primary">New!</strong> Hover over tabs to see arrows and reorder them. Your layout is saved automatically.
                      </span>
                    </p>
                    <button
                      onClick={dismissReorderHint}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-0.5 rounded hover:bg-background/40"
                    >
                      Got it
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Tab Content - Expands to full height when full screen is active */}
            <div className={`p-4 md:p-6 min-h-[400px] overflow-y-auto ${
              tabContentExpanded || isFullScreen
                ? 'max-h-[calc(100vh-180px)]' 
                : 'max-h-[calc(100vh-420px)]'
            }`}>
              <TabsContent value="onboarding" className="mt-0">
                <OnboardingTab />
              </TabsContent>

              <TabsContent value="updates" className="mt-0">
                <UpdatesTab />
              </TabsContent>

              <TabsContent value="solar" className="mt-0">
                <SolarTab onExpandedChange={setTabContentExpanded} />
              </TabsContent>

              <TabsContent value="telescope" className="mt-0">
                <TelescopeTab />
              </TabsContent>

              <TabsContent value="satellite" className="mt-0">
                <SatelliteTab />
              </TabsContent>

              <TabsContent value="rover" className="mt-0">
                <RoverTab />
              </TabsContent>

              <TabsContent value="inventory" className="mt-0">
                <InventoryTab />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Notification Subscription */}
      </div>

      <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-primary">
              Complete Your Profile
            </DialogTitle>
          </DialogHeader>
          <CompleteProfileForm onSuccess={() => setShowProfileModal(false)} />
        </DialogContent>
      </Dialog>

      {showNpsModal && session && (
        <NPSPopup
          userId={session.user.id}
          isOpen={true}
          onClose={handleCloseNps}
        />
      )}

      <WeeklyBanner
        message="🚀 The full Star Sailors experience has more projects and deeper mechanics. Feel free to explore—or stay here for a simpler start."
        buttonLabel="Play"
        buttonHref="/alpha"
      />

      {/* PWA Install Prompt - Only for authenticated users */}
      {session && <PWAPrompt />}
    </div>
  );
};
