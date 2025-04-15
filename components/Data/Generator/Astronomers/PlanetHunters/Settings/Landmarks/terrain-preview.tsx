"use client"

import { useRef, useMemo } from "react"
import type * as THREE from "three"
import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import type { PlanetStats, Landmark } from "@/lib/planet-physics"
import { generateTerrainGeometry } from "./terrain-generators"

interface TerrainPreviewProps {
  landmark: Landmark
  planetStats: PlanetStats
}

export function TerrainPreview({ landmark, planetStats }: TerrainPreviewProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const isGasGiant = planetStats.mass > 7 || planetStats.radius > 2.5

  // Generate terrain geometry and material based on landmark type
  const { geometry, material } = useMemo(() => {
    return generateTerrainGeometry(landmark, planetStats, isGasGiant)
  }, [landmark, planetStats, isGasGiant])

  return (
    <div className="w-full h-48 bg-black rounded-md overflow-hidden">
      <Canvas camera={{ position: [0, 1.8, 2.2], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[2, 3, 4]} intensity={1.2} />
        <directionalLight position={[-2, 2, 1]} intensity={0.8} castShadow />
        <mesh
          ref={meshRef}
          rotation={[-Math.PI / 4, 0, 0]}
          geometry={geometry}
          material={material}
          receiveShadow
          castShadow
        />
        <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
        <gridHelper args={[6, 10, "#444444", "#222222"]} position={[0, -0.01, 0]} />
      </Canvas>
    </div>
  );
};