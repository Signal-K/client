"use client"

import { getSurfaceDeposits } from "./biome-data"
import type { CloudCategory } from "./cloud-types"
import type { Landmark } from "./landmark-types"
import { generateLandmarks } from "./landmark-types"

export interface PlanetStats {
  mass: number // Earth masses
  radius: number // Earth radii
  density: number // g/cm³
  type: "terrestrial" | "gaseous" | undefined;
  temperature: number // Kelvin
  orbitalPeriod: number // Earth days
  atmosphereStrength: number // 0 to 1
  cloudCount: number // 0 to 100
  waterHeight: number // 0 to 1
  surfaceRoughness: number // 0 to 2
  biomeFactor: number // 0.5 to 2.0
  cloudContribution: number // 0.8 to 1.2
  terrainVariation: "flat" | "moderate" | "chaotic"
  terrainErosion: number // 0 to 1
  plateTectonics: number // 0 to 1
  // soilType?: "rocky" | "sandy" | "volcanic" | "organic" | "dusty" | "frozen" | "muddy" | undefined
  biomassLevel: number // 0 to 1
  waterLevel: number // 0 to 1
  salinity: number // 0 to 1
  subsurfaceWater: number // 0 to 1
  atmosphericDensity: number // 0 to 1
  weatherVariability: number // 0 to 1
  stormFrequency: number // 0 to 1
  volcanicActivity: number // 0 to 1
  biome: string
  // cloudTypes: CloudCategory[]
  // cloudDensity: number
  surfaceDeposits?: string[] // New field for surface deposits
  precipitationCompound?: "none" | "water" | "co2" | "snow" | "methane" // New field for precipitation compound
  landmarks?: Landmark[] // New field for landmarks
};

export interface LiquidInfo {
  type: "water" | "methane" | "nitrogen" | "none"
  color: string
  temperatureRange: string
}

export function calculateDensity(mass: number, radius: number): number {
  const earthDensity = 5.51 // g/cm³
  return (mass / Math.pow(radius, 3)) * earthDensity
}

export function determinePlanetType(mass: number, density: number): "terrestrial" | "gaseous" {
  return mass > 7.5 || density < 1 ? "gaseous" : "terrestrial"
}

export function calculatePlanetStats(
  mass: number,
  radius: number,
  temperature = 288,
  orbitalPeriod = 365,
  typeOverride: "terrestrial" | "gaseous" | null = null,
  atmosphereStrength = 0.5,
  cloudCount = 50,
  waterHeight = 0.5,
  surfaceRoughness = 1.0,
  density?: number,
  biomeFactor = 1.0,
  cloudContribution = 1.0,
  terrainVariation: "flat" | "moderate" | "chaotic" = "moderate",
  terrainErosion = 0.5,
  plateTectonics = 0.5,
  // soilType: "rocky" | "sandy" | "volcanic" | "organic" | "dusty" | "frozen" | "muddy" = "rocky",
  biomassLevel = 0.0,
  waterLevel = 0.3,
  salinity = 0.5,
  subsurfaceWater = 0.2,
  atmosphericDensity = 0.5,
  weatherVariability = 0.5,
  stormFrequency = 0.2,
  volcanicActivity = 0.2,
  biome = "Rocky Highlands",
  // cloudTypes: CloudCategory[] = ["Cumulus" as CloudCategory],
  // cloudDensity = 0.5,
  // precipitationCompound: "none" | "water" | "co2" | "snow" | "methane" = "water",
  landmarks?: Landmark[],
  terrainData?: Array<{ x: number; y: number; elevation: number }>,
): PlanetStats {
  const earthDensity = 5.51 // g/cm³
  const calculatedDensity = density || (mass / Math.pow(radius, 3)) * earthDensity

  let type: "terrestrial" | "gaseous" | undefined
  if (typeOverride) {
    type = typeOverride
  } else {
    type = mass > 7.5 || radius > 2.0 ? "gaseous" : "terrestrial"
  }

  // Get surface deposits based on biome
  const surfaceDeposits = getSurfaceDeposits(biome)

  // Determine default precipitation compound based on temperature if none is specified
  // let effectivePrecipitationCompound = precipitationCompound
  // if (precipitationCompound === "water" && temperature < 273) {
  //   effectivePrecipitationCompound = "snow"
  // } else if (precipitationCompound === "water" && temperature > 373) {
  //   effectivePrecipitationCompound = "none" // Too hot for water precipitation
  // } else if (precipitationCompound === "methane" && temperature > 112) {
  //   effectivePrecipitationCompound = "none" // Too hot for methane precipitation
  // } else if (precipitationCompound === "co2" && temperature > 195) {
  //   effectivePrecipitationCompound = "none" // Too hot for CO2 precipitation
  // }

  // Generate landmarks if not provided and terrain data is available
  let effectiveLandmarks = landmarks
  if (!effectiveLandmarks && terrainData) {
    effectiveLandmarks = generateLandmarks(
      {
        type: type as "terrestrial" | "gaseous",
        surfaceRoughness,
        waterLevel,
        temperature,
        volcanicActivity,
      },
      terrainData,
      15, // Generate 15 landmarks by default
    )
  }

  return {
    mass,
    radius,
    density: calculatedDensity,
    type,
    temperature,
    orbitalPeriod,
    atmosphereStrength,
    cloudCount,
    waterHeight,
    surfaceRoughness,
    biomeFactor,
    cloudContribution,
    terrainVariation,
    terrainErosion,
    plateTectonics,
    // soilType,
    biomassLevel,
    waterLevel,
    salinity,
    subsurfaceWater,
    atmosphericDensity,
    weatherVariability,
    stormFrequency,
    volcanicActivity,
    biome,
    // cloudTypes: cloudTypes as CloudCategory[],
    // cloudDensity,
    surfaceDeposits,
    // precipitationCompound: effectivePrecipitationCompound,
    landmarks: effectiveLandmarks,
  }
}

export function determineLiquidType(temperature: number): LiquidInfo {
  if (temperature >= 273 && temperature <= 373) {
    return {
      type: "water",
      color: "#1E4D6B",
      temperatureRange: "273K - 373K",
    }
  } else if (temperature >= 91 && temperature <= 112) {
    return {
      type: "methane",
      color: "#FFD700",
      temperatureRange: "91K - 112K",
    }
  } else if (temperature >= 195 && temperature <= 240) {
    return {
      type: "nitrogen",
      color: "#90EE90",
      temperatureRange: "195K - 240K",
    }
  }
  return {
    type: "none",
    color: "#8B4513",
    temperatureRange: "N/A",
  }
}

export function calculateTerrainHeight(stats: PlanetStats): number {
  // Base terrain height depends on planet type and mass
  let baseHeight = stats.type === "terrestrial" ? 5.0 : 2.0

  // Adjust based on mass - larger planets have more dramatic terrain
  baseHeight *= Math.sqrt(stats.mass)

  // Adjust based on surface roughness
  baseHeight *= stats.surfaceRoughness || 1.0

  // Adjust based on terrain variation
  if (stats.terrainVariation === "flat") {
    baseHeight *= 0.5
  } else if (stats.terrainVariation === "chaotic") {
    baseHeight *= 1.5
  }

  // Adjust based on plate tectonics - more tectonic activity means more mountains
  if (stats.plateTectonics) {
    baseHeight *= 1 + stats.plateTectonics * 0.5
  }

  // Adjust based on volcanic activity
  if (stats.volcanicActivity) {
    baseHeight *= 1 + stats.volcanicActivity * 0.3
  }

  // Erosion reduces terrain height
  if (stats.terrainErosion) {
    baseHeight *= 1 - stats.terrainErosion * 0.3
  }

  return baseHeight
};