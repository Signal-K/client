"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, Stars } from "@react-three/drei"
import { SimplePlanetMesh } from "./simple-planet-mesh"
import type { PlanetStats } from "@/utils/planet-physics"

interface SimplePlanetSceneProps {
  stats: PlanetStats
}

export function SimplePlanetScene({ stats }: SimplePlanetSceneProps) {
  return (
    <div className="w-full h-full bg-black">
      <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <SimplePlanetMesh stats={stats} />
        <Stars radius={300} depth={50} count={7500} factor={4} />
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={2}
          maxDistance={10}
          minPolarAngle={Math.PI / 2.5}
          maxPolarAngle={Math.PI / 1.5}
        />
      </Canvas>
    </div>
  );
};