"use client"

import { useState, useEffect} from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Stars } from "@react-three/drei"
import { Cog } from "lucide-react"
import type { PlanetConfig } from "@/utils/planet-physics"
import Planet from "./planet"
import SettingsPanel from "./SettingsPanel"

interface PlanetViewerProps {
  planetConfig: PlanetConfig
  onConfigChange: (config: Partial<PlanetConfig>) => void;
  editMode?: boolean;
  classificationId?: string;
};

export default function PlanetViewer({ planetConfig, onConfigChange, editMode, classificationId }: PlanetViewerProps) {
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    if (editMode) {
      setShowSettings(true)
    }
  }, [editMode])

  return (
    <div className="w-full h-screen relative">
      <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <Planet config={planetConfig} />
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      </Canvas>

      <button
        onClick={() => setShowSettings(!showSettings)}
        className="absolute top-4 right-4 bg-slate-800 p-2 rounded-full text-white hover:bg-slate-700 transition-colors z-10 border border-slate-700"
        aria-label="Toggle settings"
      >
        <Cog className="w-6 h-6" />
      </button>

      {showSettings && (
        <div className="absolute top-0 right-0 w-full md:w-96 h-full bg-slate-900/95 text-white overflow-y-auto p-4 backdrop-blur-sm z-10 transition-all border-l border-slate-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-100">Planet Settings</h2>
            <button
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
            </button>
          </div>
          <SettingsPanel
            planetConfig={planetConfig}
            classificationId={classificationId ? Number(classificationId) : undefined}
            onChange={onConfigChange}
          />
        </div>
      )}
    </div>
  );
};