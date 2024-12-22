'use client'

import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import { PlanetMesh } from './planet-mesh'
import type { PlanetStats } from '../utils/planet-physics'

interface PlanetSceneProps {
  stats: PlanetStats
}

function Scene({ stats }: { stats: PlanetStats }) {
  const { camera } = useThree()
  return <PlanetMesh stats={stats} camera={camera} />
}

export function PlanetScene({ stats }: PlanetSceneProps) {
  return (
    <div className="w-full h-[500px] bg-black rounded-lg overflow-hidden">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Scene stats={stats} />
        <Stars radius={300} depth={50} count={5000} factor={4} />
        <OrbitControls 
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 2.5}
          maxPolarAngle={Math.PI / 1.5}
        />
      </Canvas>
    </div>
  )
}

