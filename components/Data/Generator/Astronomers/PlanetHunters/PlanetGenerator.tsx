"use client"

import { useState, useEffect } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Stars, Environment } from "@react-three/drei"
import { PlanetShader } from "./PlanetShader"
import { SettingsPanel } from "./SettingsPanel";
import { Cog } from "lucide-react"
import { Button } from "@/components/ui/button"
import { type PlanetStats, calculateDensity, defaultPlanetStats } from "@/lib/planet-physics"

export interface PlanetGeneratorProps {
  classificationId?: string;
  author?: string;
  classificationConfig?: JSON;
};

export function PlanetGenerator() {
  const [showSettings, setShowSettings] = useState(false)
  const [planetStats, setPlanetStats] = useState<PlanetStats>(defaultPlanetStats)

  // Update density when mass or radius changes
  useEffect(() => {
    setPlanetStats((prev) => ({
      ...prev,
      density: calculateDensity(prev.mass, prev.radius),
    }))
  }, [planetStats.mass, planetStats.radius])

  return (
    <div className="w-full h-screen relative">
      <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
        {/* <color attach="background" args={["#020209"]} /> */}
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={2} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#b0c4de" />
        <directionalLight position={[5, 5, 5]} intensity={1.5} castShadow />
        <Environment preset="sunset" />
        <PlanetShader planetStats={planetStats} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
        <mesh position={[0, 0, -15]}>
          <sphereGeometry args={[5, 32, 32]} />
          <meshBasicMaterial color="#4060ff" transparent opacity={0.03} />
        </mesh>
      </Canvas>

      <Button
        variant="outline"
        size="icon"
        className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white"
        onClick={() => setShowSettings(!showSettings)}
      >
        <Cog className="h-4 w-4" />
      </Button>

      {showSettings && <SettingsPanel planetStats={planetStats} setPlanetStats={setPlanetStats} />}
    </div>
  )
}