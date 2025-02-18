export interface PlanetStats {
  mass: number // Earth masses
  radius: number // Earth radii
  density: number // g/cm³
  type: "terrestrial" | "gaseous"
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
  soilType: "rocky" | "sandy" | "volcanic" | "organic" | "dusty" | "frozen" | "muddy"
  biomassLevel: number // 0 to 1
  waterLevel: number // 0 to 1
  salinity: number // 0 to 1
  subsurfaceWater: number // 0 to 1
  atmosphericDensity: number // 0 to 1
  weatherVariability: number // 0 to 1
  stormFrequency: number // 0 to 1
  volcanicActivity: number // 0 to 1
  biome: string
  cloudTypes: string[]
  cloudDensity: number
}

export interface LiquidInfo {
  type: "water" | "methane" | "nitrogen" | "none"
  color: string
  temperatureRange: string
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
  soilType: "rocky" | "sandy" | "volcanic" | "organic" | "dusty" | "frozen" | "muddy" = "rocky",
  biomassLevel = 0.0,
  waterLevel = 0.3,
  salinity = 0.5,
  subsurfaceWater = 0.2,
  atmosphericDensity = 0.5,
  weatherVariability = 0.5,
  stormFrequency = 0.2,
  volcanicActivity = 0.2,
  biome = "Rocky Highlands",
  cloudTypes: string[] = ["Cumulus"],
  cloudDensity = 0.5,
): PlanetStats {
  const earthDensity = 5.51 // g/cm³
  const calculatedDensity = density || (mass / Math.pow(radius, 3)) * earthDensity

  let type: "terrestrial" | "gaseous"
  if (typeOverride) {
    type = typeOverride
  } else {
    type = mass > 7.5 || radius > 2.0 ? "gaseous" : "terrestrial"
  }

  // Adjust parameters based on biome
  const adjustedStats = adjustTerrainForBiome(
    {
      surfaceRoughness,
      terrainErosion,
      plateTectonics,
      soilType,
      biomassLevel,
      waterLevel,
      salinity,
      volcanicActivity,
      temperature,
      atmosphericDensity,
      cloudTypes,
      cloudDensity,
    },
    biome,
  )

  // Apply hydrology adjustments
  adjustWaterForBiome(biome, adjustedStats.cloudDensity)

  // Apply atmospheric adjustments
  adjustAtmosphereForClouds(adjustedStats.cloudTypes, adjustedStats.cloudDensity)

  return {
    mass,
    radius,
    density: calculatedDensity,
    type,
    temperature: adjustedStats.temperature,
    orbitalPeriod,
    atmosphereStrength,
    cloudCount,
    waterHeight,
    surfaceRoughness: adjustedStats.surfaceRoughness,
    biomeFactor,
    cloudContribution,
    terrainVariation,
    terrainErosion: adjustedStats.terrainErosion,
    plateTectonics: adjustedStats.plateTectonics,
    soilType: adjustedStats.soilType,
    biomassLevel: adjustedStats.biomassLevel,
    waterLevel: adjustedStats.waterLevel,
    salinity: adjustedStats.salinity,
    subsurfaceWater,
    atmosphericDensity: adjustedStats.atmosphericDensity,
    weatherVariability,
    stormFrequency,
    volcanicActivity: adjustedStats.volcanicActivity,
    biome,
    cloudTypes: adjustedStats.cloudTypes,
    cloudDensity: adjustedStats.cloudDensity,
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
  const S_mod = stats.type === "terrestrial" ? 1.0 : 0.5
  const T_var = stats.terrainVariation === "flat" ? 0.9 : stats.terrainVariation === "chaotic" ? 1.2 : 1.0
  return (
    stats.biomeFactor * stats.cloudContribution * S_mod * T_var * stats.surfaceRoughness * (1 - stats.terrainErosion)
  );
};

interface BiomeAdjustments {
  surfaceRoughness: number
  terrainErosion: number
  plateTectonics: number
  soilType: "rocky" | "sandy" | "volcanic" | "organic" | "dusty" | "frozen" | "muddy"
  biomassLevel: number
  waterLevel: number
  salinity: number
  volcanicActivity: number
  temperature: number
  atmosphericDensity: number
  cloudTypes: string[]
  cloudDensity: number
};

function adjustTerrainForBiome(currentStats: BiomeAdjustments, biome: string): BiomeAdjustments {
  const stats = { ...currentStats }
  const adjust = (value: number, adjustment: number) => Math.max(0, Math.min(1, value + adjustment))

  switch (biome) {
    case "Rocky Highlands":
      stats.surfaceRoughness = adjust(stats.surfaceRoughness, 0.5)
      stats.terrainErosion = adjust(stats.terrainErosion, -0.3)
      stats.plateTectonics = adjust(stats.plateTectonics, 0.3)
      stats.soilType = "rocky"
      break

    case "Basalt Plains":
      stats.surfaceRoughness = adjust(stats.surfaceRoughness, 0.2)
      stats.terrainErosion = adjust(stats.terrainErosion, -0.2)
      stats.plateTectonics = adjust(stats.plateTectonics, 0.1)
      stats.soilType = "volcanic"
      stats.volcanicActivity = adjust(stats.volcanicActivity, 0.5)
      break

    case "Sediment Flats":
      stats.surfaceRoughness = adjust(stats.surfaceRoughness, -0.3)
      stats.terrainErosion = adjust(stats.terrainErosion, 0.4)
      stats.plateTectonics = adjust(stats.plateTectonics, -0.3)
      stats.soilType = "sandy"
      break

    case "Cratered Terrain":
      stats.surfaceRoughness = adjust(stats.surfaceRoughness, 0.8)
      stats.terrainErosion = adjust(stats.terrainErosion, -0.4)
      stats.plateTectonics = adjust(stats.plateTectonics, -0.2)
      stats.soilType = "dusty"
      break

    case "Tundra":
      stats.surfaceRoughness = adjust(stats.surfaceRoughness, -0.2)
      stats.terrainErosion = adjust(stats.terrainErosion, 0)
      stats.plateTectonics = adjust(stats.plateTectonics, -0.1)
      stats.soilType = "frozen"
      stats.temperature -= 20
      break

    case "Flood Basin":
      stats.waterLevel = Math.max(stats.waterLevel, 0.5)
      stats.terrainErosion = adjust(stats.terrainErosion, 0.3)
      stats.soilType = "muddy"
      break

    case "Coral Reefs":
      stats.waterLevel = Math.max(stats.waterLevel, 0.7)
      stats.terrainErosion = adjust(stats.terrainErosion, 0.1)
      stats.salinity = adjust(stats.salinity, 0.3)
      stats.biomassLevel = Math.max(stats.biomassLevel, 0.5)
      break

    case "Dune Fields":
      stats.surfaceRoughness = adjust(stats.surfaceRoughness, -0.4)
      stats.terrainErosion = adjust(stats.terrainErosion, 0.5)
      stats.plateTectonics = adjust(stats.plateTectonics, -0.4)
      stats.soilType = "sandy"
      stats.atmosphericDensity = Math.max(stats.atmosphericDensity, 0.3)
      break
  }

  return stats
}

export function getTerrainColor(height: number, biome: string): string {
  if (biome === "Basalt Plains") {
    return height > 0.5 ? "#4B4B4B" : "#2A2A2A" // Dark volcanic tones
  } else if (biome === "Dune Fields") {
    return height > 0.6 ? "#E3C169" : "#C9A24A" // Sandy yellow
  } else if (biome === "Tundra") {
    return height > 0.3 ? "#C1D9E1" : "#8FA9B4" // Cold blue/gray
  } else if (biome === "Flood Basin") {
    return height > 0.7 ? "#6B4226" : "#4A2918" // Muddy browns
  } else if (biome === "Coral Reefs") {
    return height > 0.6 ? "#00BFFF" : "#008B8B" // Vibrant ocean blues
  }
  return "#808080" // Default rocky gray
}

let waterLevel = 0.3
let salinity = 0.5
let subsurfaceWater = 0.2

function adjustWaterForBiome(biome: string, cloudDensity: number): void {
  switch (biome) {
    case "Ocean World":
      waterLevel = Math.max(0.8, waterLevel)
      salinity = 0.6
      break
    case "Briny Marsh":
      waterLevel = Math.max(0.4, waterLevel)
      salinity = 1.0
      subsurfaceWater += 0.2
      break
    case "Permafrost Zone":
      waterLevel = Math.min(0.2, waterLevel)
      subsurfaceWater = 0.8
      break
  }

  // If there are high-density clouds, increase the water level
  if (cloudDensity > 0.7) {
    waterLevel += 0.05
  }
}

let atmosphereStrength = 0.5
let weatherVariability = 0.5
let stormFrequency = 0.2
let atmosphericDensity = 0.5

function adjustAtmosphereForClouds(cloudTypes: string[], cloudDensity: number): void {
  if (cloudTypes.includes("Cumulus")) {
    weatherVariability += 0.1
  }
  if (cloudTypes.includes("Stratus")) {
    atmosphericDensity += 0.05
  }
  if (cloudTypes.includes("Cirrus")) {
    stormFrequency -= 0.05
  }
  if (cloudTypes.includes("Cumulonimbus")) {
    stormFrequency += 0.3
    weatherVariability += 0.2
  }

  atmosphereStrength = Math.min(1, atmosphereStrength + cloudDensity * 0.1)
};