"use client"

import * as THREE from "three"
import type { PlanetStats, Landmark } from "@/lib/planet-physics"
import { noise } from "@/lib/noise"

// List of all gaseous landmark types
export const gaseousTypes = [
  "storm",
  "vortex",
  "band",
  "spot",
  "turbulent",
  "cyclone",
  "anticyclone",
  "zonal_flow",
  "jet_stream",
  "cloud_layer",
  "atmospheric_haze",
]

// Generate gaseous terrain geometry and material
export function generateGaseousTerrain(
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
    let color = new THREE.Color(0xe57373) // Default reddish

    // Apply terrain modification based on landmark type
    switch (influenceType) {
      case "storm":
        height = generateStormTerrain(distance, x, y, influence, influenceRadius)
        color = new THREE.Color(0xe57373) // Reddish
        break

      case "vortex":
        height = generateVortexTerrain(x, y, distance, influence, influenceRadius)
        color = new THREE.Color(0x81d4fa) // Light blue
        break

      case "band":
        height = generateBandTerrain(y, influence)
        color = new THREE.Color(0xffd54f) // Amber
        break

      case "spot":
        height = generateSpotTerrain(x, y, distance, influence, influenceRadius)
        color = new THREE.Color(0xff8a65) // Deep orange
        break

      case "turbulent":
        height = generateTurbulentTerrain(x, y, influence)
        color = new THREE.Color(0x9575cd) // Purple
        break

      case "cyclone":
        height = generateCycloneTerrain(x, y, distance, influence, influenceRadius)
        color = new THREE.Color(0x4fc3f7) // Blue
        break

      case "anticyclone":
        height = generateAnticycloneTerrain(x, y, distance, influence, influenceRadius)
        color = new THREE.Color(0xfff176) // Yellow
        break

      case "zonal_flow":
        height = generateZonalFlowTerrain(x, y, influence)
        color = new THREE.Color(0xaed581) // Light green
        break

      case "jet_stream":
        height = generateJetStreamTerrain(x, y, influence, influenceRadius)
        color = new THREE.Color(0x64b5f6) // Blue
        break

      case "cloud_layer":
        height = generateCloudLayerTerrain(x, y, distance, influence)
        color = new THREE.Color(0xeceff1) // White-ish
        break

      case "atmospheric_haze":
        height = generateAtmosphericHazeTerrain(x, y, distance, influence)
        color = new THREE.Color(0xb39ddb) // Light purple
        break

      default:
        // Default atmospheric disturbance
        height = influence * noise(x * 5, y * 5, 0) * 0.6
        height += influence * 0.4 * Math.sin(x * 8 + y * 8)
        color = new THREE.Color(0xb0bec5) // Blue grey
    }

    // Add some noise for texture
    height += noise(x * 15, y * 15, 0) * influence * 0.2

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
    roughness: 0.3,
    metalness: 0.1,
    flatShading: false,
    transparent: true,
    opacity: 0.9,
  })

  return { geometry, material }
}

// Individual terrain generation functions

function generateStormTerrain(
  distance: number,
  x: number,
  y: number,
  influence: number,
  influenceRadius: number,
): number {
  // Circular storm pattern with raised center
  const height = influence * Math.exp(-distance / (influenceRadius * 0.5))
  // Add swirling pattern
  return height + influence * 0.3 * Math.sin(Math.atan2(y, x) * 5 + distance * 10)
}

function generateVortexTerrain(
  x: number,
  y: number,
  distance: number,
  influence: number,
  influenceRadius: number,
): number {
  // Spiral vortex pattern
  const angle = Math.atan2(y, x)
  return influence * Math.sin(angle * 8 + distance * 15) * Math.exp(-distance / influenceRadius)
}

function generateBandTerrain(y: number, influence: number): number {
  // Horizontal bands
  return influence * Math.sin(y * 15)
}

function generateSpotTerrain(
  x: number,
  y: number,
  distance: number,
  influence: number,
  influenceRadius: number,
): number {
  // Large oval spot
  const scaledX = x / 0.7 // Make it oval
  const spotDistance = Math.sqrt(scaledX * scaledX + y * y)
  return influence * (1 - Math.min(1, spotDistance / influenceRadius))
}

function generateTurbulentTerrain(x: number, y: number, influence: number): number {
  // Chaotic turbulent pattern
  const height = influence * noise(x * 10, y * 10, 0)
  return height + influence * 0.5 * noise(x * 20, y * 20, 0)
}

function generateCycloneTerrain(
  x: number,
  y: number,
  distance: number,
  influence: number,
  influenceRadius: number,
): number {
  // Cyclonic spiral
  const cycloneAngle = Math.atan2(y, x)
  const spiralFactor = distance * 10 + cycloneAngle * 3
  return influence * Math.sin(spiralFactor) * Math.exp(-distance / influenceRadius)
}

function generateAnticycloneTerrain(
  x: number,
  y: number,
  distance: number,
  influence: number,
  influenceRadius: number,
): number {
  // Anticyclonic spiral (opposite direction)
  const anticycloneAngle = Math.atan2(y, x)
  const antiSpiralFactor = distance * 10 - anticycloneAngle * 3
  return influence * Math.sin(antiSpiralFactor) * Math.exp(-distance / influenceRadius)
}

function generateZonalFlowTerrain(x: number, y: number, influence: number): number {
  // Zonal flow with multiple bands
  const height = influence * Math.sin(y * 20) * 0.5
  return height + influence * Math.sin(y * 10 + x * 2) * 0.3
}

function generateJetStreamTerrain(x: number, y: number, influence: number, influenceRadius: number): number {
  // Fast-moving narrow current
  const streamWidth = influenceRadius * 0.2
  const streamCenter = Math.sin(x * 2) * 0.3 // Meandering path
  const distFromStream = Math.abs(y - streamCenter)

  if (distFromStream < streamWidth) {
    // Within the jet stream
    const streamIntensity = 1 - distFromStream / streamWidth
    return influence * streamIntensity * (0.7 + 0.3 * Math.sin(x * 15))
  }

  return 0
}

function generateCloudLayerTerrain(x: number, y: number, distance: number, influence: number): number {
  // Layered cloud structure
  const baseLayer = influence * 0.3 * (0.8 + 0.2 * Math.sin(x * 3 + y * 3))

  // Add puffy cloud formations
  const cloudPuffs = noise(x * 12, y * 12, 0)
  const puffDetail = cloudPuffs > 0.6 ? (cloudPuffs - 0.6) * influence * 0.8 : 0

  return baseLayer + puffDetail
}

function generateAtmosphericHazeTerrain(x: number, y: number, distance: number, influence: number): number {
  // Diffuse atmospheric haze
  const baseHaze = influence * 0.2

  // Add subtle variations
  const hazeVariation = noise(x * 5, y * 5, 0) * influence * 0.1

  // Add some wave patterns
  const hazeWaves = influence * 0.1 * Math.sin(x * 3 + y * 2)

  return baseHaze + hazeVariation + hazeWaves
}