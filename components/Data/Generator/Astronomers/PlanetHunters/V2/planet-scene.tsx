"use client";

import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { PlanetMesh } from "./planet-mesh";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { PlanetStats } from "@/utils/planet-physics";
import type * as THREE from "three";

interface PlanetSceneProps {
  stats: PlanetStats;
  terrainHeight?: number
  classificationId?: string
  author?: string
  onPointSelected?: (point: {
    position: THREE.Vector3
    normal: THREE.Vector3
    elevation: number
    temperature: number
    region: number
  }) => void
  selectedLandmarkId?: string
};

export function PlanetScene({ stats, terrainHeight = 5, onPointSelected, selectedLandmarkId }: PlanetSceneProps) {
  const [selectedPoint, setSelectedPoint] = useState<{
    position: THREE.Vector3
    normal: THREE.Vector3
    elevation: number
    temperature: number
    region: number
  } | null>(null)

  const handlePointClick = (point: {
    position: THREE.Vector3
    normal: THREE.Vector3
    elevation: number
    temperature: number
    region: number
  }) => {
    setSelectedPoint(point)
  }

  return (
    <div className="w-full h-full bg-black relative">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <PlanetMesh
          stats={{ ...stats, type: stats.type ?? "terrestrial" }}
          terrainHeight={terrainHeight}
          onClick={handlePointClick}
          selectedLandmarkId={selectedLandmarkId}
        />
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

      {/* Display info panel for selected point */}
      {selectedPoint && (
        <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm text-white p-4 rounded-lg shadow-lg max-w-sm">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-bold text-[#5FCBC3]">Surface Point Details</h3>
            <button className="text-gray-400 hover:text-white" onClick={() => setSelectedPoint(null)}>
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-3">
            <div className="text-gray-300">Elevation:</div>
            <div>{selectedPoint.elevation.toFixed(3)}</div>

            <div className="text-gray-300">Temperature:</div>
            <div>{selectedPoint.temperature.toFixed(1)}K</div>

            <div className="text-gray-300">Region:</div>
            <div>{selectedPoint.region + 1}</div>

            <div className="text-gray-300">Biome:</div>
            <div>{stats.biome}</div>
          </div>

          {onPointSelected && (
            <Button
              className="w-full mt-2 bg-[#5FCBC3] hover:bg-[#4DBAA9] text-black"
              onClick={() => {
                onPointSelected(selectedPoint)
                setSelectedPoint(null)
              }}
            >
              View in Topographic Map
            </Button>
          )}
        </div>
      )}
    </div>
  );
};