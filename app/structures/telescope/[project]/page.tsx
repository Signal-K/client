'use client'

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSessionContext } from "@supabase/auth-helpers-react";

import GameNavbar from "@/components/Layout/Tes";
import PlanetHuntersSteps from "@/components/Structures/Missions/Astronomers/PlanetHunters/PlanetHunters";
import { TelescopeDiskDetector } from "@/components/Projects/Telescopes/DiskDetector";
import DailyMinorPlanetMissions from "@/components/Structures/Missions/Astronomers/DailyMinorPlanet/DailyMinorPlanet";
import SunspotSteps from "@/components/Projects/Telescopes/Sunspots/SunspotShell";

export default function TelescopeProjectRoute() {
  const { project } = useParams();
  const router = useRouter();
  const { session, isLoading } = useSessionContext();

  const [ProjectComponent, setProjectComponent] = useState<React.ReactNode | null>(null);

  useEffect(() => {
    if (!isLoading && !session) {
      router.push('/');
    }
  }, [isLoading, session, router]);

  useEffect(() => {
    if (!isLoading && session) {
      switch (project) {
        case 'planet-hunters':
          setProjectComponent(<PlanetHuntersSteps />);
          break;
        case 'sunspots':
          setProjectComponent(<SunspotSteps />);
          break;
        case 'daily-minor-planet':
          setProjectComponent(<DailyMinorPlanetMissions />);
          break;
        case 'disk-detective':
          setProjectComponent(<TelescopeDiskDetector />);
          break;
        default:
          router.push('/structures/telescope');
          break;
      }
    }
  }, [project, session, isLoading, router]);

  if (isLoading) {
    return null;
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col">
      <img
        className="absolute inset-0 w-full h-full object-cover"
        src="/assets/Backdrops/Earth.png"
        alt='Earth Background'
      />

      <div className="relative z-10">
        <GameNavbar />
      </div>

      <main className="flex-grow z-10 px-4 py-12 flex justify-center items-start overflow-y-auto">
        <div className="max-w-4xl w-full">
          {ProjectComponent}
        </div>
      </main>
    </div>
  );
};