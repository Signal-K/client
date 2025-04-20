"use client";

import * as THREE from "three"
import type { PlanetStats, Landmark } from "@/lib/planet-physics"
import { noise } from "@/lib/noise"

// List of all terrestrial landmark types
export const terrestrialTypes = [
  "mountain",
  "crater",
  "valley",
  "basin",
  "canyon",
  "volcano",
  "dune",
  "glacier",
  "trench",
  "ocean_ridge",
  "ice_patch",
  "lava_flow",
];

// Generate terrestrial terrain geometry and material
export function generateTerrestrialTerrain(
  geometry: THREE.BufferGeometry,
  positionAttribute: THREE.BufferAttribute,
  colors: Float32Array,
  landmark: Landmark,
  planetStats: PlanetStats,
  influenceType: string,
  influenceRadius: number,
  influenceStrength: number,
  influenceRoughness: number,
): { geometry: THREE.BufferGeometry; material: THREE.Material } {
  // Apply terrain modification based on landmark type
  for (let i = 0; i < positionAttribute.count; i++) {
    const x = positionAttribute.getX(i)
    const y = positionAttribute.getY(i)
    const z = positionAttribute.getZ(i)

    // Distance from center (0,0)
    const distance = Math.sqrt(x * x + y * y)

    // Calculate falloff with distance
    const falloff = Math.max(0, 1 - distance / (influenceRadius * 2))
    const influence = falloff * influenceStrength * 2.5 // Amplify the effect

    let height = 0
    let color = new THREE.Color(0xa1887f) // Default color

    // Apply terrain modification based on landmark type
    switch (influenceType) {
      case "crater":
        height = generateCraterTerrain(distance, influence, influenceRadius)
        color = new THREE.Color(0x8d6e63) // Brown
        break

      case "mountain":
        height = generateMountainTerrain(distance, influence, influenceRadius)

        // Base color (brown)
        color = new THREE.Color(0xa1887f)

        // Add snow to peaks
        if (height > 0.5) {
          // Blend between rock and snow based on height
          color.lerp(new THREE.Color(0xffffff), (height - 0.5) * 2)
        }
        break

      case "volcano":
        height = generateVolcanoTerrain(distance, influence, influenceRadius)

        // Gradient from dark to reddish brown
        const t = Math.max(0, Math.min(1, height / 1.5))
        color = new THREE.Color(0x5d4037).lerp(new THREE.Color(0xbf360c), t)
        break

      case "valley":
      case "canyon":
        height = generateValleyTerrain(y, influence, influenceRadius)
        color = new THREE.Color(0x795548) // Brown
        break

      case "basin":
        height = generateBasinTerrain(distance, influence, influenceRadius)
        color = new THREE.Color(0x8d6e63) // Brown
        break

      case "dune":
        height = generateDuneTerrain(distance, x, influence, influenceRadius)
        color = new THREE.Color(0xd7ccc8) // Light tan
        break

      case "glacier":
        height = generateGlacierTerrain(distance, x, y, influence, influenceRadius)
        color = new THREE.Color(0xe0f7fa) // Light blue
        break

      case "ocean_ridge":
        height = generateOceanRidgeTerrain(y, x, influence, influenceRadius)
        color = new THREE.Color(0x0288d1) // Blue
        break

      case "trench":
        height = generateTrenchTerrain(y, influence, influenceRadius)
        color = new THREE.Color(0x01579b) // Dark blue
        break

      case "ice_patch":
        height = generateIcePatchTerrain(distance, x, y, influence, influenceRadius)
        color = new THREE.Color(0xeceff1) // Very light blue-gray
        break

      case "lava_flow":
        height = generateLavaFlowTerrain(distance, x, y, influence, influenceRadius)
        color = new THREE.Color(0xd84315) // Deep orange-red
        break

      default:
        // Generic terrain
        height = influence * noise(x * 5, y * 5, 0) * 0.8
        color = new THREE.Color(0xa1887f) // Default brown
    }

    // Add some noise based on the planet's roughness and the landmark's roughness
    const combinedRoughness = (planetStats.surfaceRoughness || 0.5) * influenceRoughness
    const noiseScale = 8 + combinedRoughness * 15
    const noiseInfluence = combinedRoughness * 0.4
    height += noise(x * noiseScale, y * noiseScale, 0) * noiseInfluence

    // Apply height to vertex
    positionAttribute.setZ(i, height)

    // Store color
    colors[i * 3] = color.r
    colors[i * 3 + 1] = color.g
    colors[i * 3 + 2] = color.b
  }

  positionAttribute.needsUpdate = true
  geometry.computeVertexNormals()

  // Add colors to geometry
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3))

  // Create material with vertex colors
  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.7,
    metalness: 0.1,
    flatShading: false,
  })

  // Adjust material based on landmark type
  if (influenceType === "volcano") {
    // Add emissive properties for volcanoes
    ;(material as THREE.MeshStandardMaterial).emissive.set("#ff2200")
    ;(material as THREE.MeshStandardMaterial).emissiveIntensity = 0.2
  } else if (influenceType === "glacier" || influenceType === "trench" || influenceType === "ocean_ridge") {
    // More reflective for ice and water
    ;(material as THREE.MeshStandardMaterial).roughness = 0.3
    ;(material as THREE.MeshStandardMaterial).metalness = 0.2
  } else if (influenceType === "lava_flow") {
    // Glowing effect for lava
    ;(material as THREE.MeshStandardMaterial).emissive.set("#ff3300")
    ;(material as THREE.MeshStandardMaterial).emissiveIntensity = 0.3
    ;(material as THREE.MeshStandardMaterial).roughness = 0.5
  } else if (influenceType === "ice_patch") {
    // Reflective ice
    ;(material as THREE.MeshStandardMaterial).roughness = 0.2
    ;(material as THREE.MeshStandardMaterial).metalness = 0.3
    ;(material as THREE.MeshStandardMaterial).envMapIntensity = 1.5
  }

  // Adjust material based on planet surface properties
  if (planetStats.soilType) {
    switch (planetStats.soilType) {
      case "volcanic":
        ;(material as THREE.MeshStandardMaterial).roughness = 0.9
        if (influenceType !== "volcano" && influenceType !== "lava_flow") {
          ;(material as THREE.MeshStandardMaterial).emissive.set("#ff4400")
          ;(material as THREE.MeshStandardMaterial).emissiveIntensity = 0.1
        }
        break
      case "sandy":
        ;(material as THREE.MeshStandardMaterial).roughness = Math.min(
          (material as THREE.MeshStandardMaterial).roughness + 0.1,
          1.0,
        )
        break
      case "frozen":
        ;(material as THREE.MeshStandardMaterial).roughness = Math.max(
          (material as THREE.MeshStandardMaterial).roughness - 0.2,
          0.1,
        )
        ;(material as THREE.MeshStandardMaterial).metalness = Math.min(
          (material as THREE.MeshStandardMaterial).metalness + 0.1,
          1.0,
        )
        break
    }
  }

  return { geometry, material }
}

// Individual terrain generation functions

function generateCraterTerrain(distance: number, influence: number, influenceRadius: number): number {
  if (distance < influenceRadius * 0.8) {
    // Crater depression
    return -influence * 1.2 + noise(distance * 10, 0, 0) * influence * 0.1
  } else if (distance < influenceRadius * 1.2) {
    // Raised rim
    return influence * 0.8
  }
  return 0
}

function generateMountainTerrain(distance: number, influence: number, influenceRadius: number): number {
  // Mountain peak
  const height = influence * 1.5 * Math.exp(-distance / (influenceRadius * 0.6))
  // Add some noise for rocky texture
  return height + noise(distance * 15, distance * 15, 0) * influence * 0.3
}

function generateVolcanoTerrain(distance: number, influence: number, influenceRadius: number): number {
  if (distance < influenceRadius * 0.2) {
    // Caldera (crater at top)
    return -influence * 0.8 + noise(distance * 20, distance * 20, 0) * influence * 0.1
  } else {
    // Cone shape
    const height = influence * 1.8 * Math.exp(-distance / (influenceRadius * 0.4))
    // Add some noise for volcanic texture
    return height + noise(distance * 12, distance * 12, 0) * influence * 0.2
  }
}

function generateValleyTerrain(y: number, influence: number, influenceRadius: number): number {
  // Valley aligned with x-axis
  const yDist = Math.abs(y)
  if (yDist < influenceRadius * 0.3) {
    // Valley floor
    return -influence * 1.2 + noise(y * 25, y * 5, 0) * influence * 0.15
  } else if (yDist < influenceRadius * 0.5) {
    // Valley walls
    return influence * 0.4 * (1 - (yDist - influenceRadius * 0.3) / (influenceRadius * 0.2))
  }
  return 0
}

function generateBasinTerrain(distance: number, influence: number, influenceRadius: number): number {
  // Basin (wide depression)
  const height = -influence * 0.8 * Math.exp(-distance / (influenceRadius * 1.5))
  // Add some noise to the basin floor
  return height + noise(distance * 8, distance * 8, 0) * influence * 0.15
}

function generateDuneTerrain(distance: number, x: number, influence: number, influenceRadius: number): number {
  // Dune field with wave patterns
  const height = influence * 0.8 * Math.sin((distance * 8) / influenceRadius)
  // Add some cross-ripples
  return height + influence * 0.3 * Math.sin((x * 12) / influenceRadius)
}

function generateGlacierTerrain(
  distance: number,
  x: number,
  y: number,
  influence: number,
  influenceRadius: number,
): number {
  // Ice cap with crevasses
  const height = influence * 0.8 * (1 - Math.pow(distance / influenceRadius, 1.5))
  // Add crevasses and ice texture
  const iceCracks = noise(x * 20, y * 20, 0)
  if (iceCracks > 0.7) {
    return height - influence * 0.4 * (iceCracks - 0.7) * 3
  }
  return height
}

function generateOceanRidgeTerrain(y: number, x: number, influence: number, influenceRadius: number): number {
  // Oceanic ridge along x-axis
  const ridgeDist = Math.abs(y)
  const height = influence * 0.8 * Math.exp(-ridgeDist / (influenceRadius * 0.2))
  // Add some noise for texture
  return height + noise(x * 15, y * 5, 0) * influence * 0.2
}

function generateTrenchTerrain(y: number, influence: number, influenceRadius: number): number {
  // Oceanic trench along x-axis
  const trenchDist = Math.abs(y)
  if (trenchDist < influenceRadius * 0.2) {
    // Deep trench
    return -influence * 1.5 + noise(y * 20, y * 5, 0) * influence * 0.1
  } else if (trenchDist < influenceRadius * 0.4) {
    // Sloping sides
    return -influence * (1 - (trenchDist - influenceRadius * 0.2) / (influenceRadius * 0.2))
  }
  return 0
}

function generateIcePatchTerrain(
  distance: number,
  x: number,
  y: number,
  influence: number,
  influenceRadius: number,
): number {
  // Ice patch with subtle elevation
  const height = influence * 0.3 * Math.exp(-distance / (influenceRadius * 0.8))

  // Add crystalline texture
  const crystalNoise = noise(x * 30, y * 30, 0)
  const crystalDetail = crystalNoise > 0.7 ? influence * 0.15 : 0

  return height + crystalDetail
}

function generateLavaFlowTerrain(
  distance: number,
  x: number,
  y: number,
  influence: number,
  influenceRadius: number,
): number {
  // Lava flow with channels
  const baseHeight = influence * 0.4 * Math.exp(-distance / (influenceRadius * 0.7))

  // Create flow channels
  const channelNoise = noise(x * 8, y * 8, 0)
  const channelPattern = Math.sin(x * 5 + y * 5 + channelNoise * 10) * 0.5 + 0.5

  // Deeper channels where the pattern is low
  const channelDepth = channelPattern < 0.3 ? -influence * 0.2 : 0

  return baseHeight + channelDepth
};