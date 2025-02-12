"use client"

import { useRef, useEffect } from "react"
import { Canvas, useThree } from "@react-three/fiber"
import { OrbitControls, Stars } from "@react-three/drei"
import { PlanetMesh } from "./planet-mesh"
import type { PlanetStats } from "@/utils/planet-physics";

interface PlanetSceneProps {
  stats: PlanetStats
  atmosphereOpacity: number
  showAtmosphere: boolean
  showLiquid: boolean
  atmosphereOffset: number
  splitMeshes: boolean
  storms: number
}

function Scene({
  stats,
  atmosphereOpacity,
  showAtmosphere,
  showLiquid,
  atmosphereOffset,
  splitMeshes,
  storms,
}: PlanetSceneProps) {
  const { camera } = useThree()
  const controlsRef = useRef<any>()

  useEffect(() => {
    if (controlsRef.current) {
      if (splitMeshes) {
        camera.position.set(0, 0, stats.radius * 6)
        controlsRef.current.target.set(stats.radius * 1.25, 0, 0)
      } else {
        camera.position.set(0, 0, stats.radius * 3)
        controlsRef.current.target.set(0, 0, 0)
      }
      controlsRef.current.update()
    }
  }, [splitMeshes, stats.radius, camera])

  return (
    <>
<PlanetMesh
  stats={{ ...stats, temperature: stats.temperature ?? 0 }}
  atmosphereOpacity={atmosphereOpacity}
  showAtmosphere={showAtmosphere}
  showLiquid={showLiquid}
  atmosphereOffset={atmosphereOffset}
  splitMeshes={splitMeshes}
  storms={storms}
/>
      <OrbitControls ref={controlsRef} enablePan={false} />
    </>
  )
}

export function PlanetScene({
  stats,
  atmosphereOpacity,
  showAtmosphere,
  showLiquid,
  atmosphereOffset,
  splitMeshes,
  storms,
}: PlanetSceneProps) {
  return (
    <div className="w-full h-[500px] bg-black rounded-lg overflow-hidden">
      <Canvas camera={{ position: [0, 0, stats.radius * 3], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Scene
          stats={stats}
          atmosphereOpacity={atmosphereOpacity}
          showAtmosphere={showAtmosphere}
          showLiquid={showLiquid}
          atmosphereOffset={atmosphereOffset}
          splitMeshes={splitMeshes}
          storms={storms}
        />
        <Stars radius={300} depth={50} count={5000} factor={4} />
      </Canvas>
    </div>
  )
};