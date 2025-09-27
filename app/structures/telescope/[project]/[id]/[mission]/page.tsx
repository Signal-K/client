'use client'

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSessionContext } from "@supabase/auth-helpers-react"

// Mission imports
import PlanetHuntersSteps from "@/src/components/deployment/missions/structures/Astronomers/PlanetHunters/PlanetHunters"
import { StarterSunspot } from "@/src/components/projects/Telescopes/Sunspots"
import { StarterTelescopeTess, TelescopeTessWithId } from "@/src/components/projects/Telescopes/Transiting"
import GameNavbar from "@/src/components/layout/Tes"
import PlanetTypeCommentForm from "@/src/components/deployment/missions/structures/Astronomers/PlanetHunters/PlanetType"
import VotePlanetClassifications from "@/src/components/deployment/missions/structures/Astronomers/PlanetHunters/PHVote"
import PlanetGenerator from "@/src/components/discovery/data-sources/Astronomers/PlanetHunters/PlanetGenerator"
import { DailyMinorPlanetWithId } from "@/src/components/projects/Telescopes/DailyMinorPlanet"
import { TelescopeBackground } from "@/src/components/classification/telescope/telescope-background"

export default function TelescopeClassifyPage() {
  const params = useParams()
  const router = useRouter()

  const { session, isLoading } = useSessionContext()

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
                <PlanetGenerator classificationId={classificationId || '8'} />
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
              component = <DailyMinorPlanetWithId anomalyId={activeAsteroidId} />;
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
    <div className="relative min-h-screen w-full flex flex-col">
      {/* Telescope Background - Full screen behind everything */}
      <div className="fixed inset-0 -z-10">
        <TelescopeBackground 
          sectorX={0} 
          sectorY={0} 
          showAllAnomalies={true}
          onAnomalyClick={(anomaly) => console.log('Clicked anomaly:', anomaly)}
        />
      </div>

      {/* Original Earth background - commented out */}
      {/* 
      <div className="fixed inset-0 -z-10">
        <img
          className="w-full h-full object-cover"
          src="/assets/Backdrops/Earth.png"
          alt="Earth Background"
        />
      </div>
      */}

      {/* Sticky/relative nav and content */}
      <div className="relative z-50 pb-8">
        <GameNavbar />
      </div>

      <main className="relative z-20 py-8 pb-24 flex justify-center">
        <div className="w-full max-w-6xl px-4 bg-black/20 rounded-lg border border-[#78cce2]/30">
          {MissionComponent}
        </div>
      </main>

      {/* Bottom Navigation - stays above everything else */}
      {/* <div className="fixed bottom-0 left-0 right-0 z-50 w-full">
        <div className="w-full pb-10 py-5" style={{ position: 'fixed', bottom: '0', left: '0', right: '0', zIndex: 9999 }}>
          <GameNavbar />
        </div>
      </div> */}
    </div>
  );
};