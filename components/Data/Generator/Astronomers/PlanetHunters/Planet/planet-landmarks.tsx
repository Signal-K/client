"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import type { PlanetStats } from "@/lib/planet-physics";

interface PlanetLandmarksProps {
  planetStats: PlanetStats;
};

// Function to determine planet type based on mass and radius
function determinePlanetType(mass: number, radius: number): "terrestrial" | "gaseous" {
  // Simplified logic: Adjust thresholds as needed
  const density = mass / ((4 / 3) * Math.PI * Math.pow(radius, 3))
  return density > 1 ? "terrestrial" : "gaseous"
};

// Update the PlanetLandmarks component to only render active landmarks
export function PlanetLandmarks({ planetStats }: PlanetLandmarksProps) {
  const planetType = determinePlanetType(planetStats.mass, planetStats.radius)
  const isGasGiant = planetType === "gaseous"
  const landmarks = planetStats.landmarks || []

  // Only show landmarks that match the current planet type
  const activeLandmarks = landmarks.filter((landmark) => {
    if (!landmark.category) {
      // If no category is specified, infer from influence type
      const gasTypes = ["storm", "vortex", "band", "spot", "turbulent", "cyclone", "anticyclone", "zonal_flow"]
      return isGasGiant
        ? gasTypes.includes(landmark.influence_type || "")
        : !gasTypes.includes(landmark.influence_type || "")
    }
    return isGasGiant ? landmark.category === "gaseous" : landmark.category === "terrestrial"
  })

  // Create landmark markers
  const landmarkMarkers = useMemo(() => {
    return activeLandmarks.map((landmark, index) => {
      // Calculate position on planet surface
      const { x, y, z } = landmark.coordinates
      const position = new THREE.Vector3(x, y, z).normalize().multiplyScalar(planetStats.radius * 1.02)

      // Determine marker color based on landmark type
      let markerColor = "#22c55e" // Default green

      if (landmark.type.includes("Volcano") || landmark.type.includes("Storm")) {
        markerColor = "#ef4444" // Red for volcanic/storm features
      } else if (landmark.type.includes("Ocean") || landmark.type.includes("Water")) {
        markerColor = "#3b82f6" // Blue for water features
      } else if (landmark.type.includes("Ice") || landmark.type.includes("Frozen")) {
        markerColor = "#a5f3fc" // Light blue for ice features
      } else if (landmark.type.includes("Sand") || landmark.type.includes("Desert")) {
        markerColor = "#fcd34d" // Yellow for desert features
      }

      // Determine if landmark has visual effects
      const hasVisualEffect = landmark.visual_effect && landmark.visual_effect !== "None"

      return (
        <group key={index} position={[position.x, position.y, position.z]}>
          {/* Marker sphere */}
          <mesh>
            <sphereGeometry args={[0.03, 16, 16]} />
            <meshStandardMaterial color={markerColor} />
          </mesh>

          {/* Pulse effect for landmarks with visual effects */}
          {hasVisualEffect && (
            <mesh>
              <sphereGeometry args={[0.05, 16, 16]} />
              <meshBasicMaterial color={markerColor} transparent={true} opacity={0.3} depthWrite={false} />
            </mesh>
          )}

          {/* Label */}
          <Html position={[0, 0.1, 0]} center distanceFactor={10} occlude>
            <div className="bg-black/80 text-green-400 px-2 py-1 text-xs font-mono rounded border border-green-500/50 whitespace-nowrap">
              {landmark.classification_id}
            </div>
          </Html>
        </group>
      )
    })
  }, [activeLandmarks, planetStats.radius])

  return <>{landmarkMarkers}</>
};