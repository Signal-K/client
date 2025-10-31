"use client";

import { useState } from "react";
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
import { Telescope, Satellite, Car, Package, Bell, Sun, Sparkles, FlaskConical } from "lucide-react";

export default function ActivityPage() {
  const session = useSession();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [landmarksExpanded, setLandmarksExpanded] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [activeTab, setActiveTab] = useState("onboarding");

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

        {/* Activity Header - User profile and deployment status */}
        <ActivityHeaderSection
          classificationsCount={classifications.length}
          landmarksExpanded={landmarksExpanded}
          onToggleLandmarks={() => setLandmarksExpanded((prev) => !prev)}
        />

        {/* Profile Setup Required */}
        {needsProfileSetup && (
          <ProfileSetupRequired
            onOpenProfileModal={() => setShowProfileModal(true)}
          />
        )}

        {/* Main Tabbed Interface */}
        <div className="bg-background/40 backdrop-blur-md rounded-xl border border-[#78cce2]/30 shadow-2xl overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Tab Navigation */}
            <div className="border-b border-[#78cce2]/20 bg-background/60 backdrop-blur-sm">
              <TabsList className="w-full h-auto flex flex-wrap justify-start gap-1 p-2 bg-transparent">
                <TabsTrigger
                  value="updates"
                  className="flex items-center gap-1.5 h-9 data-[state=active]:bg-primary/20 data-[state=active]:text-primary relative"
                >
                  <Bell className="w-4 h-4" />
                  <span className="text-xs sm:text-sm">Updates</span>
                </TabsTrigger>
                {classifications.length > 0 && (
                  <>
                    <TabsTrigger
                      value="telescope"
                      className="flex items-center gap-1.5 h-9 data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
                    >
                      <Telescope className="w-4 h-4" />
                      <span className="text-xs sm:text-sm">Telescope</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="satellite"
                      className="flex items-center gap-1.5 h-9 data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
                    >
                      <Satellite className="w-4 h-4" />
                      <span className="text-xs sm:text-sm">Satellite</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="rover"
                      className="flex items-center gap-1.5 h-9 data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
                    >
                      <Car className="w-4 h-4" />
                      <span className="text-xs sm:text-sm">Rover</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="solar"
                      className="flex items-center gap-1.5 h-9 data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
                    >
                      <Sun className="w-4 h-4" />
                      <span className="text-xs sm:text-sm">Solar</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="inventory"
                      className="flex items-center gap-1.5 h-9 data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
                    >
                      <Package className="w-4 h-4" />
                      <span className="text-xs sm:text-sm">Inventory</span>
                    </TabsTrigger>
                  </>
                )}
              </TabsList>
            </div>

            {/* Tab Content */}
            <div className="p-4 md:p-6 min-h-[400px] max-h-[calc(100vh-420px)] overflow-y-auto">
              <TabsContent value="onboarding" className="mt-0">
                <OnboardingTab />
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

                  <TabsContent value="solar" className="mt-0">
                    <SolarTab />
                  </TabsContent>

                  <TabsContent value="inventory" className="mt-0">
                    <InventoryTab />
                  </TabsContent>
                </>
              )}

              <TabsContent value="updates" className="mt-0">
                <UpdatesTab />
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