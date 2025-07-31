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

import MainHeader from "@/src/components/layout/Header/MainHeader";
import ActivityHeaderSection from "@/src/components/social/activity/ActivityHeaderSection";
import NextStepsSection from "@/src/components/profile/dashboard/NextStepsSection";
// import TipsGuidanceSection from "@/src/components/profile/dashboard/TipsGuidanceSection";
import ResearchProgressSection from "@/src/components/research/ResearchProgressSection";
import StructuresEquipmentSection from "@/src/components/deployment/structures/StructuresEquipmentSection";
import MilestonesSection from "@/src/components/deployment/missions/MilestonesSection";
import ProfileSetupSection from "@/src/components/profile/setup/ProfileSetupSection";
import CompleteStructuresSection from "@/src/components/deployment/structures/CompleteStructuresSection";
import ProfileSetupRequired from "@/src/components/profile/setup/ProfileSetupRequired";
import LegacyTipsPanel from "@/src/components/profile/dashboard/LegacyTipsPanel";
import LegacyMilestonesSection from "@/src/components/profile/dashboard/LegacyMilestonesSection";
import RecentDiscoveries from "@/src/components/social/activity/RecentDiscoveries";

// Import custom hooks
import { usePageData } from "@/hooks/usePageData";
import { useSatelliteManagement } from "@/hooks/useSatelliteManagement";
import { useNPSManagement } from "@/hooks/useNPSManagement";
import SatellitePosition from "@/src/components/ui/scenes/deploy/SatellitePosition";

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
  const [showTipsPanel, setShowTipsPanel] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isDark, setIsDark] = useState(false);
  
  // Additional state for the new components
  const [weeklyMissions, setWeeklyMissions] = useState<any[]>([]);
  const [userMissionsLoading, setUserMissionsLoading] = useState(false);
  const [profileCreated, setProfileCreated] = useState(false);

  // Custom hooks for data management
  const {
    linkedAnomalies,
    activityFeed,
    profile,
    classifications,
    otherClassifications,
    incompletePlanet,
    planetTargets,
    visibleStructures,
    loading,
  } = usePageData();

  const {
    activeSatelliteMessage,
    handleSendSatellite,
    checkActiveSatellite,
  } = useSatelliteManagement();

  const { showNpsModal, handleCloseNps } = useNPSManagement();

  const handleThemeToggle = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark", !isDark);
  };

  if (!session) return <LandingSS />;

  const needsProfileSetup = !profile?.username || !profile?.full_name;

  const satelliteData: PageSatellite | null = (() => {
    const weatherSatelliteAnomaly = linkedAnomalies.find(anomaly => anomaly.automaton === "WeatherSatellite");
    
    if (weatherSatelliteAnomaly) {
      return {
        id: "satellite-1",
        x: 50, // Centered position
        y: 50, // Centered position
        hasUnclassifiedAnomaly: true,
        anomalyId: weatherSatelliteAnomaly.anomaly?.id?.toString(),
        tile: "/assets/Viewports/Satellite/Satellite_Tile1.png",
        unlocked: false, // Will be fetched by SatellitePosition component
        linkedAnomalyId: weatherSatelliteAnomaly.id.toString(),
      };
    }
    
    return null;
  })();

  return (
    <div className="min-h-screen w-full relative flex justify-center pb-20">
      {/* Telescope Background - Full screen behind everything */}
      <div className="fixed inset-0 -z-10">
        <TelescopeBackground 
          sectorX={0} 
          sectorY={0} 
          showAllAnomalies={false}
          isDarkTheme={isDark}
          variant="stars-only"
          onAnomalyClick={(anomaly) => console.log('Clicked anomaly:', anomaly)}
        />
      </div>

      {/* Main Header */}
      <MainHeader
        isDark={isDark}
        onThemeToggle={handleThemeToggle}
        notificationsOpen={notificationsOpen}
        onToggleNotifications={() => setNotificationsOpen((open) => !open)}
        activityFeed={activityFeed}
        otherClassifications={otherClassifications}
      />

      <div className="w-full max-w-screen-xl px-4 py-6 space-y-8 pt-24 relative z-10">
        {/* Activity Header - User profile and deployment status */}
        <ActivityHeaderSection
          classificationsCount={classifications.length}
          landmarksExpanded={landmarksExpanded}
          onToggleLandmarks={() => setLandmarksExpanded((prev) => !prev)}
        />

        {satelliteData && (
          <SatellitePosition
            satellites={[satelliteData]} // Pass a single satellite
            flashingIndicator={satelliteData.hasUnclassifiedAnomaly} // Add flashing indicator
          />
        )}

        {/* Recent Discoveries */}
        <RecentDiscoveries
          linkedAnomalies={linkedAnomalies}
          classifications={classifications}
          incompletePlanet={incompletePlanet}
        />

        {/* Next Steps Guide - PRIORITY #1 for new users */}
        <NextStepsSection
          incompletePlanet={incompletePlanet}
        />

        {/* Research Progress */}
        <ResearchProgressSection />

        {/* Milestones */}
        <MilestonesSection 
          weeklyMissions={weeklyMissions}
          userMissionsLoading={userMissionsLoading}
        />

        {/* Structures & Equipment */}
        <StructuresEquipmentSection
          planetTargets={planetTargets}
          activeSatelliteMessage={activeSatelliteMessage}
          visibleStructures={visibleStructures}
          onSendSatellite={handleSendSatellite}
          onCheckActiveSatellite={checkActiveSatellite}
        />

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
        <LegacyMilestonesSection />

        {/* Profile Setup or Complete Structures Section */}
        {needsProfileSetup ? (
          <ProfileSetupRequired onOpenProfileModal={() => setShowProfileModal(true)} />
        ) : (
          <CompleteStructuresSection
            planetTargets={planetTargets}
            activeSatelliteMessage={activeSatelliteMessage}
            visibleStructures={visibleStructures}
            onSendSatellite={handleSendSatellite}
            onCheckActiveSatellite={checkActiveSatellite}
          />
        )}

        {/* Legacy Tips Panel */}
        <LegacyTipsPanel 
          showTipsPanel={showTipsPanel}
          onToggleTipsPanel={() => setShowTipsPanel(!showTipsPanel)}
        />
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