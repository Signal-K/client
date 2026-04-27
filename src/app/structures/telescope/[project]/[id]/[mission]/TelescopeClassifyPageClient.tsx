'use client'

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSessionContext } from "@/src/lib/auth/session-context"

// Mission imports
import PlanetHuntersSteps from "@/src/components/deployment/missions/structures/Astronomers/PlanetHunters/PlanetHunters"
import { StarterSunspot } from "@/src/components/projects/Telescopes/Sunspots"
import { StarterTelescopeTess, TelescopeTessWithId } from "@/src/components/projects/Telescopes/Transiting"
import MainHeader from "@/src/components/layout/Header/MainHeader"
import PlanetTypeCommentForm from "@/src/components/deployment/missions/structures/Astronomers/PlanetHunters/PlanetType"
import VotePlanetClassifications from "@/src/components/deployment/missions/structures/Astronomers/PlanetHunters/PHVote"
import { DailyMinorPlanetWithId } from "@/src/components/projects/Telescopes/DailyMinorPlanet"
import { TelescopeBackground } from "@/src/components/classification/telescope/telescope-background"
import { DiskDetectorTutorial } from "@/src/components/projects/Telescopes/DiskDetector"
import { SuperWASPTutorial } from "@/src/components/projects/Telescopes/SuperWASP"
import { ActiveAsteroidWithId, ActiveAsteroidClassifyWithId } from "@/src/components/projects/Telescopes/ActiveAsteroids"
import UseDarkMode from "@/src/shared/hooks/useDarkMode"

export default function TelescopeClassifyPage() {
  const params = useParams()
  const router = useRouter()

  const { session, isLoading } = useSessionContext()
  const { isDark, toggleDarkMode } = UseDarkMode()

  const [MissionComponent, setMissionComponent] = useState<React.ReactNode | null>(null)

  useEffect(() => {
    if (!isLoading && !session) {
      router.push('/')
    }
  }, [session, isLoading, router])

    useEffect(() => {
      if (isLoading || !session) return;

      const project = params ? String(params.project) : "";
      const mission = params ? String(params.mission) : "";
      const idParam = params ? String(params.id || "") : "";

      let classificationId: string | undefined;
      if (idParam.startsWith("cl-")) {
        classificationId = idParam.replace("cl-", "");
      } else if (idParam.startsWith("db-")) {
        classificationId = idParam.replace("db-", "");
      } else if (!isNaN(Number(idParam))) {
        classificationId = idParam;
      }

      let component: React.ReactNode = null;

      switch (project) {
        case "planet-hunters":
          switch (mission) {
            case "one":
              component = <StarterTelescopeTess />;
              break;
            case "classify":
              component = <TelescopeTessWithId anomalyId={classificationId || '8'} />;
              break;
            case "comment":
              component = (
                <PlanetTypeCommentForm classificationId={classificationId} />
              );
              break;
            case "survey":
              component = (
                <VotePlanetClassifications classificationId={classificationId || '8'} />
              );
              break;
            case "paint":
              component = (
                <div className="flex h-full flex-col items-center justify-center space-y-4 p-8 text-center text-white">
                  <h2 className="text-2xl font-bold text-cyan-400">Surface Visualisation Offline</h2>
                  <p className="max-w-md text-slate-400">
                    The advanced planetary surface imaging suite has been decommissioned for station maintenance. Please focus on core classification tasks.
                  </p>
                  <button
                    onClick={() => router.push("/game")}
                    className="mt-4 rounded-lg bg-cyan-600 px-6 py-2 transition-colors hover:bg-cyan-700"
                  >
                    Return to Station
                  </button>
                </div>
              );
              break;
            default:
              component = <PlanetHuntersSteps />;
              break;
          }
          break;

        case "sunspots":
        case "sunspot":
          switch (mission) {
            case "count":
              // If id is present, pass it to StarterSunspot for direct anomaly
              if (classificationId) {
                component = <StarterSunspot anomalyId={classificationId} />;
              } else {
                component = <StarterSunspot />;
              }
              break;
            default:
              component = <StarterSunspot />;
              break;
          }
          break;

        case "daily-minor-planet":
          switch (mission) {
            case "classify":
              const anomalyId = idParam.startsWith("db-") ? idParam.replace("db-", "") : idParam;
              component = <DailyMinorPlanetWithId anomalyId={anomalyId} />;
              break;
          }
          break;

        case "active-asteroids":
          switch (mission) {
            case "classify":
              const activeAsteroidId = idParam.startsWith("db-") ? idParam.replace("db-", "") : idParam;
              component = <ActiveAsteroidClassifyWithId anomalyId={activeAsteroidId} />;
              break;
          }
          break;

        case "disk-detective":
        case "diskdetective":
          switch (mission) {
            case "classify":
              const diskDetectiveId = idParam.startsWith("db-") ? idParam.replace("db-", "") : idParam;
              component = <DiskDetectorTutorial anomalyId={diskDetectiveId} />;
              break;
          }
          break;

        case "superwasp":
        case "superwasp-variable":
        case "stellar-classification":
          switch (mission) {
            case "classify":
              const superwaspId = idParam.startsWith("db-") ? idParam.replace("db-", "") : idParam;
              component = <SuperWASPTutorial anomalyId={superwaspId} />;
              break;
          }
          break;

        default:
          component = <div className="text-white p-4">Unknown mission or project.</div>;
          break;
      }

      setMissionComponent(component);
    }, [params, session, isLoading]);

  return (
    <div className="relative h-screen w-full flex flex-col overflow-hidden">
      {/* Telescope Background - Full screen behind everything */}
      <div className="fixed inset-0 -z-10">
        <TelescopeBackground
          sectorX={0}
          sectorY={0}
          showAllAnomalies={true}
          onAnomalyClick={(anomaly) => {}}
        />
      </div>

      {/* Sticky/relative nav and content */}
      <MainHeader
        isDark={isDark}
        onThemeToggle={toggleDarkMode}
        notificationsOpen={false}
        onToggleNotifications={() => {}}
        activityFeed={[]}
        otherClassifications={[]}
      />

      <main className="relative z-20 pt-20 flex-1 min-h-0 flex justify-center overflow-hidden">
        <div className="w-full max-w-6xl bg-black/20 rounded-lg border border-[#78cce2]/30 h-full overflow-hidden">
          {MissionComponent}
        </div>
      </main>
    </div>
  );
};
