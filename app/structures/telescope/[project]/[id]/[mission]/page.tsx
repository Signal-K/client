'use client'

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSessionContext } from "@supabase/auth-helpers-react"

// Mission imports
import PlanetHuntersSteps from "@/components/Structures/Missions/Astronomers/PlanetHunters/PlanetHunters"
import { StarterSunspot } from "@/components/Projects/Telescopes/Sunspots"
import { StarterTelescopeTess } from "@/components/Projects/Telescopes/Transiting"
import GameNavbar from "@/components/Layout/Tes"
import PlanetTypeCommentForm from "@/components/Structures/Missions/Astronomers/PlanetHunters/PlanetType"
import VotePlanetClassifications from "@/components/Structures/Missions/Astronomers/PlanetHunters/PHVote"
import PlanetGenerator from "@/components/Data/Generator/Astronomers/PlanetHunters/PlanetGenerator"
import { DailyMinorPlanetWithId } from "@/components/Projects/Telescopes/DailyMinorPlanet"

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
    if (isLoading || !session) return

    const project = String(params.project)
    const mission = String(params.mission)
    const idParam = String(params.id || "")

    let classificationId: string | undefined
    if (idParam.startsWith("cl-")) {
      classificationId = idParam.replace("cl-", "")
    } else if (!isNaN(Number(idParam))) {
      classificationId = idParam
    }

    let component: React.ReactNode = null

    switch (project) {
      case "planet-hunters":
        switch (mission) {
          case "one":
          case "classify":
            component = <StarterTelescopeTess />
            break
          case "comment":
            component = (
              <PlanetTypeCommentForm classificationId={classificationId} />
            )
            break
          case "survey":
            component = (
              <VotePlanetClassifications classificationId={classificationId || '8'} />
            )
            break
          case "paint":
            component = (
              <PlanetGenerator
                classificationId={classificationId || '8'}
              />
            )
            break
          default:
            component = <PlanetHuntersSteps />
            break
        }
        break

      case "sunspots":
        component = <StarterSunspot />
        break

      case "daily-minor-planet":
        switch (mission) {
          case "classify":
            component = <DailyMinorPlanetWithId />
            break
        }
        break

      default:
        component = <div className="text-white p-4">Unknown mission or project.</div>
        break
    }

    setMissionComponent(component)
  }, [params, session, isLoading])

  return (
    <div className="relative min-h-screen w-full flex flex-col">
      {/* Background image behind everything */}
      <div className="fixed inset-0 -z-10">
        <img
          className="w-full h-full object-cover"
          src="/assets/Backdrops/Earth.png"
          alt="Earth Background"
        />
      </div>

      {/* Sticky/relative nav and content */}
      <div className="relative z-10 pb-8">
        <GameNavbar />
      </div>

      <main className="relative z-5 py-10 flex justify-center">
        <div className="w-full max-w-6xl px-4">
          {MissionComponent}
        </div>
      </main>
    </div>
  );
};