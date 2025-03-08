"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { PlanetMesh } from "./planet-mesh";
import type { PlanetStats } from "@/utils/planet-physics";

interface PlanetSceneProps {
  stats: PlanetStats;
  terrainHeight: number;
  classificationConfig?: any;
  content?: any;
  classificationId: string;
  author: string;
  type?: string;
};

export function PlanetScene({ stats, classificationConfig, classificationId, terrainHeight }: PlanetSceneProps) {
  console.log(classificationConfig);

  return (
    <div className="w-full h-full bg-black">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <PlanetMesh stats={stats} />
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