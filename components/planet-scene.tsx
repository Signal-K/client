"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, Stars } from "@react-three/drei"
import { PlanetMesh } from "./planet-mesh"
import type { PlanetStats } from "../utils/planet-physics"

interface PlanetSceneProps {
  stats: PlanetStats
}

export function PlanetScene({ stats }: PlanetSceneProps) {
  const statsWithDefaultType = {
    ...stats,
    type: stats.type ?? "terrestrial", // Default to "terrestrial" if undefined
    temperature: stats.temperature ?? 0, // Default to 0 if temperature is undefined
  }

  return (
    <div className="w-full h-full bg-black">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <PlanetMesh stats={statsWithDefaultType} />
        <Stars radius={300} depth={50} count={7500} factor={4} />
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={2}
          maxDistance={20}
          minPolarAngle={Math.PI / 2.5}
          maxPolarAngle={Math.PI / 1.5}
        />
      </Canvas>
    </div>
  );
};