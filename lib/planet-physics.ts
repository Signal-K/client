export interface PlanetStats {
  mass: number
  radius: number
  density?: number
  temperature: number
  surfaceRoughness?: number
  terrainErosion?: number
  waterLevel?: number
  biomassLevel?: number
  plateTectonics?: number
  soilType?: "rocky" | "sandy" | "volcanic" | "organic" | "dusty" | "frozen" | "muddy"
  soilTexture?: "smooth" | "rough" | "cracked" | "layered" | "porous" | "grainy" | "crystalline"
  atmosphereStrength?: number
  liquidType?: "water" | "methane" | "nitrogen" | "ammonia" | "ethane"
  salinity?: number
  precipitationCompound?: "none" | "water" | "co2" | "methane" | "snow"
  biome?: string
  mountainHeight?: number
  hasRings?: boolean
  cloudCount?: number
  volcanicActivity?: number
  waterHeight?: number
  liquidEnabled?: boolean
  customColors?: {
    oceanFloor?: string
    beach?: string
    regular?: string
    mountain?: string
  }
}

export const defaultPlanetStats: PlanetStats = {
  mass: 1,
  radius: 1,
  density: 5.51,
  temperature: 288,
  surfaceRoughness: 0.5,
  terrainErosion: 0.3,
  waterLevel: 0.65,
  biomassLevel: 0.2,
  plateTectonics: 0.8,
  soilType: "rocky",
  soilTexture: "rough",
  atmosphereStrength: 0.8,
  liquidType: "water",
  salinity: 0.35,
  precipitationCompound: "water",
  biome: "Rocky Highlands",
  mountainHeight: 0.6,
  hasRings: false,
  cloudCount: 30,
  volcanicActivity: 0.3,
  waterHeight: 0.65,
  liquidEnabled: true,
}

export function calculateDensity(mass: number, radius: number): number {
  return (mass / Math.pow(radius, 3)) * 5.51
}

export function determinePlanetType(mass: number, radius: number): "terrestrial" | "gaseous" {
  return mass > 7 || radius > 2.5 ? "gaseous" : "terrestrial"
}

export function determineLiquidType(temperature: number): {
  type: "water" | "methane" | "nitrogen" | "ammonia" | "ethane" | "none"
  color: string
} {
  if (temperature >= 273 && temperature <= 373) return { type: "water", color: "#1E4D6B" }
  if (temperature >= 91 && temperature <= 112) return { type: "methane", color: "#7FB3D5" }
  if (temperature >= 63 && temperature <= 77) return { type: "nitrogen", color: "#90EE90" }
  if (temperature >= 195 && temperature <= 240) return { type: "ammonia", color: "#D8BFD8" }
  if (temperature >= 90 && temperature <= 184) return { type: "ethane", color: "#FFD700" }
  return { type: "none", color: "#8B4513" }
}

export function isLiquidAvailable(temperature: number, liquidType: string): boolean {
  const ranges = {
    water: [273, 373],
    methane: [91, 112],
    nitrogen: [63, 77],
    ammonia: [195, 240],
    ethane: [90, 184],
  }
  const range = ranges[liquidType as keyof typeof ranges]
  return range ? temperature >= range[0] && temperature <= range[1] : false
}

export enum TerrainType {
  OceanFloor = 0,
  Beach = 1,
  Regular = 2,
  Mountain = 3,
}

export function getSoilTextureParams(texture: string): {
  scale: number
  depth: number
  irregularity: number
  pattern: "noise" | "cracks" | "layers" | "crystals" | "pores" | "grains"
} {
  const params: Record<string, { scale: number; depth: number; irregularity: number; pattern: "noise" | "cracks" | "layers" | "crystals" | "pores" | "grains" }> = {
    smooth: { scale: 5, depth: 0.01, irregularity: 0.1, pattern: "noise" },
    rough: { scale: 15, depth: 0.05, irregularity: 0.7, pattern: "noise" },
    cracked: { scale: 20, depth: 0.08, irregularity: 0.6, pattern: "cracks" },
    layered: { scale: 12, depth: 0.04, irregularity: 0.3, pattern: "layers" },
    porous: { scale: 25, depth: 0.06, irregularity: 0.5, pattern: "pores" },
    grainy: { scale: 30, depth: 0.03, irregularity: 0.8, pattern: "grains" },
    crystalline: { scale: 18, depth: 0.07, irregularity: 0.4, pattern: "crystals" },
  }
  return params[texture as keyof typeof params] || params.rough
}

export function determineTerrainType(height: number, waterLevel: number): TerrainType {
  const normalizedHeight = (height + 0.15) / 0.3
  if (normalizedHeight < waterLevel - 0.2) return TerrainType.OceanFloor
  if (normalizedHeight < waterLevel) return TerrainType.Beach
  if (normalizedHeight < waterLevel + 0.4) return TerrainType.Regular
  return TerrainType.Mountain
}

export function mergeWithDefaults(partialStats: Partial<PlanetStats>): PlanetStats {
  const mergedStats = { ...defaultPlanetStats, ...partialStats }
  if (partialStats.mass !== undefined || partialStats.radius !== undefined) {
    mergedStats.density = calculateDensity(mergedStats.mass, mergedStats.radius)
  }
  return mergedStats
};