"use client";

import { useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";

import LandingSS from "@/src/components/profile/auth/landing";
import NPSPopup from "@/src/components/ui/helpers/nps-popup";
import { TelescopeBackground } from "@/src/components/classification/telescope/telescope-background";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
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
import SatellitePosition from "@/src/components/scenes/deploy/satellite/SatellitePosition";
import SolarHealth from "@/src/components/scenes/deploy/solar/SolarHealth";
import TelescopeViewportSection from "@/src/components/scenes/deploy/Telescope/TelescopeSection";
import RoverViewportSection from "@/src/components/scenes/deploy/Rover/RoverSection";
import ViewportSkillTree from "@/src/components/research/section/skillTreeSection";
import ResearchSkillViewport from "@/src/components/research/section/skillTreeSection";
import ProjectSelectionViewport from "@/src/components/onboarding/ProjectSelectionViewport";
import Landing from "./apt/page";

type PageSatellite = {
  id: string;
  x: number;
  y: number;
  hasUnclassifiedAnomaly: boolean;
  anomalyId: string | undefined;
  tile: string;
  unlocked: boolean;
  linkedAnomalyId: string;
};

export default function ActivityPage() {
  const session = useSession();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [landmarksExpanded, setLandmarksExpanded] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

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

  const satelliteData: (PageSatellite & { deployTime: Date }) | null = (() => {
    const weatherSatelliteAnomaly = linkedAnomalies.find(
      (anomaly) => anomaly.automaton === "WeatherSatellite"
    );
    if (weatherSatelliteAnomaly) {
      return {
        id: "satellite-1",
        x: 50,
        y: 50,
        hasUnclassifiedAnomaly: true,
        anomalyId: weatherSatelliteAnomaly.anomaly?.id?.toString(),
        tile: "/assets/Viewports/Satellite/Satellite_Tile1.png",
        unlocked: false,
        linkedAnomalyId: weatherSatelliteAnomaly.id.toString(),
        deployTime: new Date(),
      };
    }
    return null;
  })();

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

      <div className="w-full max-w-screen-xl px-4 py-6 space-y-8 pt-24 relative z-10">
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

        {/* Project Selection for New Users */}
        {classifications.length === 0 && (
          <ProjectSelectionViewport 
            classificationsCount={classifications.length}
            showWelcomeMessage={true}
            onProjectSelect={(projectId) => {
              console.log('Selected project:', projectId);
              // Here we could trigger fast deployment logic in the future
            }}
          />
        )}

        {/* Only show regular viewports if user has made classifications */}
        {classifications.length > 0 && (
          <>
            <TelescopeViewportSection />
            <SatellitePosition
              satellites={satelliteData ? [satelliteData] : []}
              flashingIndicator={satelliteData?.hasUnclassifiedAnomaly}
            />
            <RoverViewportSection />
            <ResearchSkillViewport />
            <SolarHealth />
          </>
        )}

        {/* Recent Discoveries */}
        {/* <RecentDiscoveries
          linkedAnomalies={linkedAnomalies}
          classifications={classifications}
          incompletePlanet={incompletePlanet}
        /> */}

        {/* <ViewportSkillTree /> */}

        {/* Notification Subscription */}
        <NotificationSubscribeButton />

        {/* Next Steps Guide - PRIORITY #1 for new users */}
        {/* <NextStepsSection
          incompletePlanet={incompletePlanet}
        /> */}

        {/* Milestones */}
        {/* <MilestonesSection 
          weeklyMissions={weeklyMissions}
          userMissionsLoading={userMissionsLoading}
        /> */}

        {/* Structures & Equipment */}
        {/* <StructuresEquipmentSection
          planetTargets={planetTargets}
          activeSatelliteMessage={activeSatelliteMessage}
          visibleStructures={visibleStructures}
          onSendSatellite={handleSendSatellite}
          onCheckActiveSatellite={checkActiveSatellite}
        /> */}

        {/* Profile Setup */}
        {/* <ProfileSetupSection
          session={session}
          profile={profile ? {
            id: profile.id,
            username: profile.username ?? undefined,
            full_name: profile.full_name ?? undefined,
          } : null}
          profileCreated={profileCreated}
          hasMadeClassifications={classifications.length > 0}
        /> */}

        {/* Legacy Milestones Section */}
        {/* <LegacyMilestonesSection /> */}

        {/* Profile Setup or Complete Structures Section */}
        {needsProfileSetup && (
          <ProfileSetupRequired
            onOpenProfileModal={() => setShowProfileModal(true)}
          />
        )}

        {/* Legacy Tips Panel */}
        {/* <LegacyTipsPanel 
          showTipsPanel={showTipsPanel}
          onToggleTipsPanel={() => setShowTipsPanel(!showTipsPanel)}
        /> */}

        {/* Research Progress */}
        {/* <ResearchProgressSection /> */}
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
}
