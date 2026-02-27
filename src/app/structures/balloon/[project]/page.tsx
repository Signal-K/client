'use client';

import { useRouter, useParams } from 'next/navigation';
import { useSession } from '@/src/lib/auth/session-context';
import AI4M from '@/src/components/deployment/missions/structures/Astronomers/SatellitePhotos/AI4M/AIForMars';
import PlanetFour from '@/src/components/deployment/missions/structures/Astronomers/SatellitePhotos/P4/PlanetFour';
import CloudspottingOnMars from '@/src/components/deployment/missions/structures/Meteorologists/Cloudspotting/CloudspottingOnMars';
import JovianVortexHunters from '@/src/components/deployment/missions/structures/Meteorologists/JVH/JovianVortexHunters';
// import { DataSourcesModal } from '@/src/components/social/activity/unlockNewDataSources';
import React from 'react';
import MainHeader from '@/src/components/layout/Header/MainHeader';
import { TelescopeBackground } from '@/src/components/classification/telescope/telescope-background';
import UseDarkMode from '@/src/shared/hooks/useDarkMode';

export default function WeatherBalloonProjectPage() {
  const session = useSession();
  
  const router = useRouter();
  const params = useParams();
  const { isDark, toggleDarkMode } = UseDarkMode();

  React.useEffect(() => {
    if (!session) {
      router.replace("/auth");
    }
  }, [session, router]);

  if (!session) return null;

  const project = params?.project;

  const componentMap: { [key: string]: React.ReactNode } = {
    // research: <DataSourcesModal structureId="3105" structure="LIDAR" />,
    clouds: <CloudspottingOnMars />,
    storms: <JovianVortexHunters />,
    landmarks: <AI4M />,
    surface: <PlanetFour />,
  };

  const SelectedComponent = componentMap[project as string];

  if (!SelectedComponent) {
    return (
      <div className="relative min-h-screen w-full">
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
        <MainHeader
          isDark={isDark}
          onThemeToggle={toggleDarkMode}
          notificationsOpen={false}
          onToggleNotifications={() => {}}
          activityFeed={[]}
          otherClassifications={[]}
        />
        <div className="pt-20 flex flex-col items-center justify-center min-h-screen text-center">
          <h1 className="text-2xl font-semibold text-white">Unknown Project</h1>
          <p className="text-gray-300 mt-2">The selected weather balloon project does not exist.</p>
        </div>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen w-full">
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
      <MainHeader
        isDark={isDark}
        onThemeToggle={toggleDarkMode}
        notificationsOpen={false}
        onToggleNotifications={() => {}}
        activityFeed={[]}
        otherClassifications={[]}
      />
      <main className="pt-20 min-h-screen z-10 px-4 py-6 flex justify-center items-start overflow-y-auto">
        <div className="max-w-4xl w-full">
          <div className="mb-6 flex justify-end">
            <button
              onClick={() => router.push('/structures/balloon')}
              className="bg-muted hover:bg-muted/70 text-sm text-foreground border border-border rounded-md px-4 py-2 transition-colors"
            >
              All Projects
            </button>
          </div>
          {SelectedComponent}
        </div>
      </main>
    </div>
  );
};
