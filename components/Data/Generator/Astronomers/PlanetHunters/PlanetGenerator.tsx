"use client";

import { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars, Environment } from "@react-three/drei";
import { PlanetShader } from "./PlanetShader";
import { Planet } from "./Planet/planet-main";
import { SettingsPanel } from "./SettingsPanel";
import { Cog } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  type PlanetStats,
  calculateDensity,
  defaultPlanetStats,
  mergeWithDefaults,
  generateDefaultLandmarks,
} from "@/lib/planet-physics";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

export interface PlanetGeneratorProps {
  classificationConfig?: any;
  content?: string;
  classificationId: string;
  author: string;
  type?: string;
  biome?: string;
  planetConfiguration?: any;
}

export function PlanetGenerator({
  classificationId = "UNCLASSIFIED",
  author = "UNKNOWN",
  type,
  biome,
  planetConfiguration,
  classificationConfig,
  content,
}: PlanetGeneratorProps) {
  const supabase = useSupabaseClient();

  const initialPlanetStats = planetConfiguration
    ? mergeWithDefaults(planetConfiguration)
    : {
        ...defaultPlanetStats,
        ...(biome ? { biome } : {}),
        ...(type ? { type } : {}),
      };

  if (!initialPlanetStats.landmarks || initialPlanetStats.landmarks.length === 0) {
    initialPlanetStats.landmarks = generateDefaultLandmarks(initialPlanetStats);
  } else {
    const hasTerrestrial = initialPlanetStats.landmarks.some((l) => l.category === "terrestrial");
    const hasGaseous = initialPlanetStats.landmarks.some((l) => l.category === "gaseous");

    if (!hasTerrestrial || !hasGaseous) {
      const defaultLandmarks = generateDefaultLandmarks(initialPlanetStats);
      if (!hasTerrestrial) {
        const terrestrial = defaultLandmarks.find((l) => l.category === "terrestrial");
        if (terrestrial) initialPlanetStats.landmarks.push(terrestrial);
      }
      if (!hasGaseous) {
        const gaseous = defaultLandmarks.find((l) => l.category === "gaseous");
        if (gaseous) initialPlanetStats.landmarks.push(gaseous);
      }
    }
  }

  const [showSettings, setShowSettings] = useState(false);
  const [useShader, setUseShader] = useState(true);
  const [planetStats, setPlanetStats] = useState<PlanetStats>(initialPlanetStats);

  useEffect(() => {
    const fetchExportedValues = async () => {
      const idAsNumber = parseInt(classificationId);
      if (isNaN(idAsNumber)) return;

      const { data, error } = await supabase
        .from("classifications")
        .select("classificationConfiguration")
        .eq("id", idAsNumber)
        .single();

      if (error || !data?.classificationConfiguration?.exportedValue) return;

      const { exportedValue } = data.classificationConfiguration;

      setPlanetStats((prev) => ({
        ...prev,
        ...(exportedValue.mass && { mass: exportedValue.mass }),
        ...(exportedValue.radius && { radius: exportedValue.radius }),
      }));
    };

    fetchExportedValues();
  }, [classificationId]);

  useEffect(() => {
    setPlanetStats((prev) => ({
      ...prev,
      density: calculateDensity(prev.mass, prev.radius),
    }));
  }, [planetStats.mass, planetStats.radius]);

  return (
    <div className="flex-1 w-full h-screen relative">
      <div className="absolute top-4 left-4 z-10 bg-black/70 text-green-400 font-mono p-2 rounded border border-green-500/30 text-sm">
        <div>
          <span className="text-green-500/70">ID:</span> {classificationId}
        </div>
        <div>
          <span className="text-green-500/70">AUTHOR:</span> {author}
        </div>
        {type && (
          <div>
            <span className="text-green-500/70">TYPE:</span> {type}
          </div>
        )}
        {biome && (
          <div>
            <span className="text-green-500/70">BIOME:</span> {biome}
          </div>
        )}
        {planetStats.landmarks && planetStats.landmarks.length > 0 && (
          <div>
            <span className="text-green-500/70">LANDMARKS:</span> {planetStats.landmarks.length}
          </div>
        )}
      </div>

      {classificationConfig && (
        <pre className="text-xs text-white/70">
          {JSON.stringify(classificationConfig, null, 2)}
        </pre>
      )}

      <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
        {/* <color attach="background" args={["#020209"]} /> */}
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={2} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#b0c4de" />
        <directionalLight position={[5, 5, 5]} intensity={1.5} castShadow />
        <Environment preset="sunset" />
        {useShader ? <PlanetShader planetStats={planetStats} /> : <Planet planetStats={planetStats} />}
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
        <mesh position={[0, 0, -15]}>
          <sphereGeometry args={[5, 32, 32]} />
          <meshBasicMaterial color="#4060ff" transparent opacity={0.03} />
        </mesh>
      </Canvas>

      <div className="absolute top-4 right-4 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="bg-black/50 hover:bg-black/70 text-white"
          onClick={() => setUseShader(!useShader)}
        >
          {useShader ? "Standard Render" : "Shader Render"}
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="bg-black/50 hover:bg-black/70 text-white"
          onClick={() => setShowSettings(!showSettings)}
        >
          <Cog className="h-4 w-4" />
        </Button>
      </div>

      {showSettings && (
        <SettingsPanel
          planetStats={planetStats}
          setPlanetStats={setPlanetStats}
          classificationId={classificationId}
          author={author}
        />
      )}
    </div>
  );
};