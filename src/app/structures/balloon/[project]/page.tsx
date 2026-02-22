'use client';

import { useRouter, useParams } from 'next/navigation';
import { useSession } from '@/src/lib/auth/session-context';
import GameNavbar from '@/src/components/layout/Tes';
import AI4M from '@/src/components/deployment/missions/structures/Astronomers/SatellitePhotos/AI4M/AIForMars';
import PlanetFour from '@/src/components/deployment/missions/structures/Astronomers/SatellitePhotos/P4/PlanetFour';
import CloudspottingOnMars from '@/src/components/deployment/missions/structures/Meteorologists/Cloudspotting/CloudspottingOnMars';
import JovianVortexHunters from '@/src/components/deployment/missions/structures/Meteorologists/JVH/JovianVortexHunters';
// import { DataSourcesModal } from '@/src/components/social/activity/unlockNewDataSources';
import React from 'react';

export default function WeatherBalloonProjectPage() {
  const session = useSession();
  
  const router = useRouter();
  const params = useParams();

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
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <h1 className="text-2xl font-semibold">Unknown Project</h1>
        <p className="text-gray-500 mt-2">The selected weather balloon project does not exist.</p>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col">
      <img
        className="absolute inset-0 w-full h-full object-cover"
        src="/assets/Backdrops/Earth.png"
        alt="Earth Background"
      />
      <div className='pb-8'>
        <GameNavbar />
      </div>
      <main className="flex-grow z-10 px-4 py-6 flex justify-center items-start overflow-y-auto">
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
