"use client"

import * as THREE from "three"
import type { PlanetStats, Landmark } from "@/lib/planet-physics"
import { generateTerrestrialTerrain, generateGaseousTerrain } from "./Landmark-Types"

export function generateTerrainGeometry(
  landmark: Landmark,
  planetStats: PlanetStats,
  isGasGiant: boolean,
): { geometry: THREE.BufferGeometry; material: THREE.Material } {
  // Create a higher resolution geometry for more detailed terrain
  const geometry = new THREE.PlaneGeometry(3, 3, 128, 128)

  // Get landmark type and influence parameters
  const influenceType = landmark.influence_type || "mountain"
  const influenceRadius = landmark.influence_radius || 0.5
  const influenceStrength = landmark.influence_strength || 0.5
  const influenceRoughness = landmark.influence_roughness || 0.5

  // Apply height deformation based on landmark type
  const positionAttribute = geometry.getAttribute("position") as THREE.BufferAttribute
  const colors = new Float32Array(positionAttribute.count * 3)

  // Generate terrain based on planet type
  if (isGasGiant || landmark.category === "gaseous") {
    return generateGaseousTerrain(
      geometry,
      positionAttribute,
      colors,
      landmark,
      planetStats,
      influenceType,
      influenceRadius,
      influenceStrength,
      influenceRoughness,
    )
  } else {
    return generateTerrestrialTerrain(
      geometry,
      positionAttribute,
      colors,
      landmark,
      planetStats,
      influenceType,
      influenceRadius,
      influenceStrength,
      influenceRoughness,
    )
  }
}