'use client';

import { useRouter, useParams } from 'next/navigation';
import { useSession } from '@supabase/auth-helpers-react';
import Home from '@/app/page';
import GameNavbar from '@/components/Layout/Tes';
import AI4M from '@/components/Structures/Missions/Astronomers/SatellitePhotos/AI4M/AIForMars';
import PlanetFour from '@/components/Structures/Missions/Astronomers/SatellitePhotos/P4/PlanetFour';
import CloudspottingOnMars from '@/components/Structures/Missions/Meteorologists/Cloudspotting/CloudspottingOnMars';
import JovianVortexHunters from '@/components/Structures/Missions/Meteorologists/JVH/JovianVortexHunters';
import { DataSourcesModal } from '@/components/Data/unlockNewDataSources';
import React from 'react';

export default function WeatherBalloonProjectPage() {
  const session = useSession();
  const router = useRouter();
  const params = useParams();

  if (!session) return <Home />;

  const project = params?.project;

  const componentMap: { [key: string]: React.ReactNode } = {
    research: <DataSourcesModal structureId="3105" structure="LIDAR" />,
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
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col">
      <img
        className="absolute inset-0 w-full h-full object-cover"
        src="/assets/Backdrops/Earth.png"
        alt="Earth Background"
      />
      <GameNavbar />
      <div className="relative z-10 py-12 p-6 max-w-4xl mx-auto w-full">
        {SelectedComponent}
      </div>
    </div>
  );
};