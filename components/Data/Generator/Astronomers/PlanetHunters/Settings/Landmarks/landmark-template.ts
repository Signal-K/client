"use client"
import { noise } from "@/lib/noise"

/**
 * LANDMARK TYPE TEMPLATE
 *
 * This file serves as a template for creating new landmark types.
 * Follow these steps to add a new landmark type:
 *
 * 1. Create a new file in the appropriate directory:
 *    - For terrestrial landmarks: components/settings/landmarks/landmark-types/terrestrial-custom.ts
 *    - For gaseous landmarks: components/settings/landmarks/landmark-types/gaseous-custom.ts
 *
 * 2. Copy this template and modify it for your new landmark type
 *
 * 3. Add your new landmark type to the appropriate list:
 *    - For terrestrial: Add to terrestrialTypes in terrestrial.ts
 *    - For gaseous: Add to gaseousTypes in gaseous.ts
 *
 * 4. Add a display name for your type in getInfluenceTypeName() in landmark-types/index.ts
 *
 * 5. Import and use your new terrain generation function in the appropriate file
 */

// Example of a new terrestrial landmark type: "ice_cap"

// 1. Add to terrestrialTypes array in terrestrial.ts
// export const terrestrialTypes = [...existing types..., "ice_cap"]

// 2. Add display name in getInfluenceTypeName() in index.ts
// ice_cap: "Polar Ice Cap",

// 3. Create the terrain generation function
export function generateIceCapTerrain(
  distance: number,
  x: number,
  y: number,
  influence: number,
  influenceRadius: number,
): number {
  // Dome-shaped ice cap
  const baseHeight = influence * Math.pow(Math.cos(Math.min(Math.PI / 2, distance / influenceRadius)), 2)

  // Add cracks and texture
  const crackNoise = noise(x * 25, y * 25, 0)
  const crackDetail = crackNoise > 0.8 ? (crackNoise - 0.8) * influence * 0.5 : 0

  // Add ridges
  const ridgePattern = Math.sin(distance * 20) * 0.5 + 0.5
  const ridgeDetail = ridgePattern > 0.7 ? (ridgePattern - 0.7) * influence * 0.2 : 0

  return baseHeight - crackDetail + ridgeDetail
}

// 4. Set the color for this terrain type in the main terrain generation function
// color = new THREE.Color(0xeceff1) // White-blue for ice

// 5. Add special material properties if needed
// material.roughness = 0.2
// material.metalness = 0.3

/**
 * EXAMPLE: Adding a new gaseous landmark type: "aurora"
 */

// 1. Add to gaseousTypes array in gaseous.ts
// export const gaseousTypes = [...existing types..., "aurora"]

// 2. Add display name in getInfluenceTypeName() in index.ts
// aurora: "Auroral Display",

// 3. Create the terrain generation function
export function generateAuroraTerrain(x: number, y: number, distance: number, influence: number): number {
  // Curtain-like aurora pattern
  const baseHeight = influence * 0.3

  // Add wave patterns
  const wavePattern = Math.sin(x * 10 + y * 5) * Math.sin(y * 8)

  // Add some randomness
  const randomDetail = noise(x * 15, y * 15, 0) * 0.5

  return baseHeight + influence * wavePattern * randomDetail
}

// 4. Set the color for this terrain type in the main terrain generation function
// color = new THREE.Color(0x64ffda) // Teal for aurora

// 5. Add special material properties if needed
// material.emissive = new THREE.Color(0x64ffda)
// material.emissiveIntensity = 0.5