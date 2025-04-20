"use client";

import * as THREE from "three";
import { noise } from "@/lib/noise";
import { calculateLandmarkTerrainInfluence } from "@/lib/planet-physics";

// Generate height map for planet surface
export function generateHeightMap(planetStats: any, planetType: string) {
  const heightData = new Map<string, number>()
  const resolution = 12
  const geometry = new THREE.IcosahedronGeometry(1, resolution)
  const positions = geometry.getAttribute("position")

  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i),
      y = positions.getY(i),
      z = positions.getZ(i)
    const normalizedPos = new THREE.Vector3(x, y, z).normalize()
    let heightValue = 0

    if (planetType === "terrestrial") {
      const roughness = (planetStats.surfaceRoughness || 0.5) * 1.2
      let frequency = 1,
        amplitude = 1,
        persistence = 0.5

      for (let j = 0; j < 7; j++) {
        const n = noise(
          normalizedPos.x * frequency * roughness,
          normalizedPos.y * frequency * roughness,
          normalizedPos.z * frequency * roughness,
        )
        heightValue += n * amplitude
        amplitude *= persistence
        frequency *= 2
      }

      heightValue *= planetStats.mountainHeight || 0.5
      if (planetStats.terrainErosion) {
        heightValue *= 1 - planetStats.terrainErosion * 0.3
      }

      // Apply landmark terrain influences
      const position = normalizedPos.clone().multiplyScalar(planetStats.radius)
      const landmarkInfluence = calculateLandmarkTerrainInfluence(position, planetStats.landmarks, planetStats.radius)

      // Apply landmark height influence
      heightValue += landmarkInfluence.height

      // Apply landmark roughness influence by adding noise
      if (landmarkInfluence.roughness > 0) {
        const additionalRoughness =
          noise(
            normalizedPos.x * 20 * landmarkInfluence.roughness,
            normalizedPos.y * 20 * landmarkInfluence.roughness,
            normalizedPos.z * 20 * landmarkInfluence.roughness,
          ) *
          landmarkInfluence.roughness *
          0.2

        heightValue += additionalRoughness
      }
    } else {
      const roughness = planetStats.surfaceRoughness || 0.5
      heightValue =
        noise(normalizedPos.x * 2 * roughness, normalizedPos.y * 2 * roughness, normalizedPos.z * 2 * roughness) * 0.1

      // For gas giants, landmarks can still influence the surface (like storms)
      if (planetStats.landmarks && planetStats.landmarks.length > 0) {
        const position = normalizedPos.clone().multiplyScalar(planetStats.radius)
        const landmarkInfluence = calculateLandmarkTerrainInfluence(position, planetStats.landmarks, planetStats.radius)
        heightValue += landmarkInfluence.height * 0.5 // Reduced effect for gas giants
      }
    }

    const key = `${normalizedPos.x.toFixed(5)},${normalizedPos.y.toFixed(5)},${normalizedPos.z.toFixed(5)}`
    heightData.set(key, heightValue)
  }

  return {
    getHeight: (normalizedPos: THREE.Vector3): number => {
      const key = `${normalizedPos.x.toFixed(5)},${normalizedPos.y.toFixed(5)},${normalizedPos.z.toFixed(5)}`
      const exactMatch = heightData.get(key)
      if (exactMatch !== undefined) return exactMatch

      let closestDist = Number.POSITIVE_INFINITY,
        closestHeight = 0
      heightData.forEach((height, keyStr) => {
        const [x, y, z] = keyStr.split(",").map(Number.parseFloat)
        const pos = new THREE.Vector3(x, y, z)
        const dist = normalizedPos.distanceTo(pos)
        if (dist < closestDist) {
          closestDist = dist
          closestHeight = height
        }
      })
      return closestHeight
    },
  };
};