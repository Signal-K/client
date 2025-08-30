"use client"

import { useState } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Stars } from "@react-three/drei"
import { Cog } from "lucide-react"
import type { PlanetConfig } from "@/src/components/discovery/planets/planet-config"
import Planet from "./planet"
import SettingsPanel from "./SettingsPanel"

interface PlanetViewerProps {
  planetConfig: PlanetConfig;
  onConfigChange: (config: Partial<PlanetConfig>) => void;
  hideBackground?: boolean;
  hideSky?: boolean;
  hideZoom?: boolean;
    cameraZoom?: number;
  }


export default function PlanetViewer({ planetConfig, onConfigChange, hideBackground, hideSky, hideZoom, cameraZoom }: PlanetViewerProps) {
  // Remove all background, ensure planet is centered, and allow camera zoom override
  return (
    <div className="w-full h-full relative overflow-hidden" style={{ background: hideBackground ? "none" : "#000" }}>
      <Canvas camera={{ position: [0, 0, cameraZoom ?? 10], fov: 45 }} style={{ width: "100%", height: "100%", background: "none" }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <Planet config={planetConfig} />
        <OrbitControls enablePan={false} enableZoom={!hideZoom} enableRotate={true} />
        {!hideSky && <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />}
      </Canvas>
    </div>
  );
}

export function PlanetOnly({ planetConfig }: { planetConfig: PlanetConfig }) {
  return (
    <Canvas camera={{ position: [0, 0, 10], fov: 45 }} style={{ width: "100%", height: "300%", background: "none" }}>
      <Planet config={planetConfig} />
    </Canvas>
  );
}