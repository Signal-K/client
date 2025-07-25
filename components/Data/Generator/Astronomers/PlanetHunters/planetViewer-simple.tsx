"use client"

import { useState } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Stars } from "@react-three/drei"
import { Cog } from "lucide-react"
import type { PlanetConfig } from "@/src/features/planets/physics"
import SimplePlanetMesh from "./planet-simple"
// import SimplePlanetSettings from "./simple-planet-settings"

interface SimplePlanetViewerProps {
  planetConfig: PlanetConfig
  onConfigChange: (config: Partial<PlanetConfig>) => void
}

export default function SimplePlanetViewer({ planetConfig, onConfigChange }: SimplePlanetViewerProps) {
  const [showSettings, setShowSettings] = useState(false)

  return (
    <div className="relative">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <SimplePlanetMesh config={planetConfig} />
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} minDistance={2} maxDistance={10} />
        <Stars radius={100} depth={50} count={500} factor={4} saturation={0} fade speed={1} />
      </Canvas>


      {showSettings && (
        <div className="absolute top-0 right-0 w-full md:w-96 h-full bg-slate-900/95 text-white overflow-y-auto p-4 backdrop-blur-sm z-10 transition-all border-l border-slate-700">
          <div className="flex justify-between items-center mb-4">
            {/* <button
              onClick={() => setShowSettings(false)}
              className="text-slate-300 hover:text-slate-100"
              aria-label="Close settings"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button> */}
          </div>
          {/* <SimplePlanetSettings planetConfig={planetConfig} onChange={onConfigChange} /> */}
        </div>
      )}
    </div>
  )
};