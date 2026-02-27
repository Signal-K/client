'use client'

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSessionContext } from "@/src/lib/auth/session-context";

import PlanetHuntersSteps from "@/src/components/deployment/missions/structures/Astronomers/PlanetHunters/PlanetHunters";
import { TelescopeDiskDetector } from "@/src/components/projects/Telescopes/DiskDetector";
import DailyMinorPlanetMissions from "@/src/components/deployment/missions/structures/Astronomers/DailyMinorPlanet/DailyMinorPlanet";
import SunspotSteps from "@/src/components/projects/Telescopes/Sunspots/SunspotShell";
import MainHeader from "@/src/components/layout/Header/MainHeader";
import UseDarkMode from "@/src/shared/hooks/useDarkMode";
import { TelescopeBackground } from "@/src/components/classification/telescope/telescope-background";

export default function TelescopeProjectRoute() {
  const params = useParams();
  const projectParam = params ? params['project'] : undefined;
  const project = Array.isArray(projectParam) ? projectParam[0] : projectParam;
  const router = useRouter();
  const { isDark, toggleDarkMode } = UseDarkMode();

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
      };
    };
  }, [project, session, isLoading, router]);

  if (isLoading) {
    return null;
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

      <main className="pt-20 min-h-screen z-10 px-4 py-12 flex justify-center items-start overflow-y-auto">
        <div className="max-w-4xl w-full">
          <div className="mb-6 flex justify-end">
            <button
              onClick={() => router.push('/structures/telescope')}
              className="bg-muted hover:bg-muted/70 text-sm text-foreground border border-border rounded-md px-4 py-2 transition-colors"
            >
              All Projects
            </button>
          </div>
          {ProjectComponent}
        </div>
      </main>
    </div>
  );
};
