"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "@supabase/auth-helpers-react";

import NPSPopup from "@/src/components/ui/helpers/nps-popup";
import { TelescopeBackground } from "@/src/components/classification/telescope/telescope-background";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import WeeklyBanner from "@/src/components/ui/update-banner";
import CompleteProfileForm from "@/src/components/profile/setup/FinishProfile";
import AnonymousUserPrompt from "@/src/components/profile/auth/AnonymousUserPrompt";

import MainHeader from "@/src/components/layout/Header/MainHeader";
import ActivityHeaderSection from "@/src/components/social/activity/ActivityHeaderSection";
import ProfileSetupRequired from "@/src/components/profile/setup/ProfileSetupRequired";
import NotificationSubscribeButton from "@/src/components/providers/NotificationSubscribeButton";

// Import custom hooks
import { usePageData } from "@/hooks/usePageData";
import { useNPSManagement } from "@/hooks/useNPSManagement";
import { useTabsPersistence, TabConfig } from "@/hooks/useTabsPersistence";
import UseDarkMode from "@/src/shared/hooks/useDarkMode";
import Landing from "./apt/page";

// Import tab components
import TelescopeTab from "@/src/components/tabs/TelescopeTab";
import SatelliteTab from "@/src/components/tabs/SatelliteTab";
import RoverTab from "@/src/components/tabs/RoverTab";
import SolarTab from "@/src/components/tabs/SolarTab";
import InventoryTab from "@/src/components/tabs/InventoryTab";
import UpdatesTab from "@/src/components/tabs/UpdatesTab";
import OnboardingTab from "@/src/components/tabs/OnboardingTab";

// Import icons
import { Telescope, Satellite, Car, Package, Bell, Sun, Sparkles, FlaskConical, GripVertical, ArrowLeft, ArrowRight } from "lucide-react";

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
}

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
    <div className="relative group flex items-center gap-0.5">
      {canMoveLeft && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMoveLeft?.();
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-background/40 rounded"
          title="Move left"
        >
          <ArrowLeft className="w-3 h-3 text-muted-foreground" />
        </button>
      )}
      
      <TabsTrigger
        value={id}
        className="flex items-center gap-1.5 h-9 data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
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
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-background/40 rounded"
          title="Move right"
        >
          <ArrowRight className="w-3 h-3 text-muted-foreground" />
        </button>
      )}
    </div>
  );
}

export default function ActivityPage() {
  const session = useSession();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [landmarksExpanded, setLandmarksExpanded] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [tabContentExpanded, setTabContentExpanded] = useState(false);
  const [showReorderHint, setShowReorderHint] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Custom hooks for data management
  const {
    linkedAnomalies,
    activityFeed,
    profile,
    classifications,
    otherClassifications,
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
  } = useTabsPersistence('updates');

  // Handle tab click - toggle full screen if clicking active tab, otherwise switch tabs
  const handleTabClick = (tabId: string) => {
    if (tabId === activeTab) {
      // Toggle full screen when clicking active tab
      setIsFullScreen(prev => !prev);
    } else {
      // Switch to new tab, keep full screen state
      setActiveTab(tabId);
    }
  };

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
  };

  // Define all available tabs with conditions
  const allTabs: TabConfig[] = useMemo(() => [
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
      condition: classifications.length > 0,
    },
    {
      id: 'satellite',
      label: 'Satellite',
      icon: <Satellite className="w-4 h-4" />,
      condition: classifications.length > 0,
    },
    {
      id: 'rover',
      label: 'Rover',
      icon: <Car className="w-4 h-4" />,
      condition: classifications.length > 0,
    },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: <Package className="w-4 h-4" />,
      condition: classifications.length > 0,
    },
  ], [classifications.length]);

  // Get ordered and filtered tabs
  const orderedTabs = useMemo(() => getOrderedTabs(allTabs), [allTabs, getOrderedTabs]);

  // Initialize tab order when tabs change
  useEffect(() => {
    if (isInitialized) {
      initializeTabOrder(allTabs);
    }
  }, [allTabs, initializeTabOrder, isInitialized]);

  // Move tab left or right
  const moveTab = (tabId: string, direction: 'left' | 'right') => {
    const tabIds = orderedTabs.map(tab => tab.id);
    const currentIndex = tabIds.indexOf(tabId);
    
    if (direction === 'left' && currentIndex > 0) {
      const newOrder = [...tabIds];
      [newOrder[currentIndex - 1], newOrder[currentIndex]] = [newOrder[currentIndex], newOrder[currentIndex - 1]];
      reorderTabs(newOrder);
    } else if (direction === 'right' && currentIndex < tabIds.length - 1) {
      const newOrder = [...tabIds];
      [newOrder[currentIndex], newOrder[currentIndex + 1]] = [newOrder[currentIndex + 1], newOrder[currentIndex]];
      reorderTabs(newOrder);
    }
  };

  if (!session) return <Landing />;

  const needsProfileSetup = !profile?.username || !profile?.full_name;

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
        onThemeToggle={toggleDarkMode}
        notificationsOpen={notificationsOpen}
        onToggleNotifications={() => setNotificationsOpen((open) => !open)}
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
            onToggleLandmarks={() => setLandmarksExpanded((prev) => !prev)}
          />
        )}

        {/* Profile Setup Required */}
        {needsProfileSetup && (
          <ProfileSetupRequired
            onOpenProfileModal={() => setShowProfileModal(true)}
          />
        )}

        {/* Main Tabbed Interface */}
        <div className="bg-background/40 backdrop-blur-md rounded-xl border border-[#78cce2]/30 shadow-2xl overflow-hidden">
          <Tabs value={activeTab} className="w-full">
            {/* Tab Navigation */}
            <div className="border-b border-[#78cce2]/20 bg-background/60 backdrop-blur-sm">
              <TabsList className="w-full h-auto flex flex-wrap justify-start gap-1 p-2 bg-transparent">
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

              {classifications.length > 0 && (
                <>
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
                </>
              )}
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

      {showNpsModal && (
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
    </div>
  );
};