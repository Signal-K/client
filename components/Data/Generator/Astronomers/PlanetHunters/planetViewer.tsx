"use client";

import { useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import type { PlanetConfig } from "@/utils/planet-physics";
import Planet from "./planet";
import SettingsPanel from "./SettingsPanel";

interface PlanetViewerProps {
  planetConfig: PlanetConfig;
  onConfigChange: (config: Partial<PlanetConfig>) => void;
  editMode?: boolean;
  classificationId?: string;
  showSettings: boolean;
  onToggleSettings: () => void;
};

export default function PlanetViewer({
  planetConfig,
  onConfigChange,
  editMode,
  classificationId,
  showSettings,
  onToggleSettings,
}: PlanetViewerProps) {
  useEffect(() => {
    // Default show settings on desktop
    if (editMode && window.innerWidth >= 768 && !showSettings) {
      onToggleSettings();
    }
  }, [editMode]);

  return (
    <div className="w-full h-screen relative overflow-hidden">
      <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <Planet config={planetConfig} />
        <OrbitControls enablePan enableZoom enableRotate />
        <Stars
          radius={100}
          depth={50}
          count={5000}
          factor={4}
          saturation={0}
          fade
          speed={1}
        />
      </Canvas>

      {/* Slide-in Settings Panel */}
      <div
        className={`fixed md:static top-0 right-0 h-full w-full md:w-96 bg-white dark:bg-slate-900 text-gray-900 dark:text-white z-30 p-4 backdrop-blur-sm transition-transform duration-300 ease-in-out ${
          showSettings ? "translate-x-0" : "translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Planet Settings</h2>
          <button
            onClick={onToggleSettings}
            className="text-gray-500 hover:text-gray-300 md:hidden"
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
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <SettingsPanel
          planetConfig={planetConfig}
          classificationId={classificationId ? Number(classificationId) : undefined}
          onChange={onConfigChange}
        />
      </div>

      {/* Mobile backdrop */}
      {showSettings && (
        <div
          className="fixed inset-0 bg-black/30 z-20 md:hidden"
          onClick={onToggleSettings}
        />
      )}
    </div>
  );
};