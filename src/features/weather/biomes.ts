export interface BiomeRanges {
  temperature: [number, number]
  atmosphereStrength: [number, number]
  cloudCount: [number, number]
  waterHeight: [number, number]
  surfaceRoughness: [number, number]
  plateTectonics: [number, number]
  biomassLevel: [number, number]
  waterLevel: [number, number]
  salinity: [number, number]
  volcanicActivity: [number, number]
  surfaceDeposits: string[]
};

export interface BiomeData {
  [key: string]: BiomeRanges
};

export const biomeData: BiomeData = {
  "Rocky Highlands": {
    temperature: [240, 320],
    atmosphereStrength: [0.3, 0.7],
    cloudCount: [10, 60],
    waterHeight: [0.0, 0.2],
    surfaceRoughness: [0.5, 1.0],
    plateTectonics: [0.4, 0.9],
    biomassLevel: [0.01, 0.2],
    waterLevel: [0.1, 0.3],
    salinity: [0.1, 0.5],
    volcanicActivity: [0.2, 0.8],
    surfaceDeposits: ["Bedrock", "Big Rocks", "Surface Cracks"],
  },
  "Barren Wasteland": {
    temperature: [180, 260],
    atmosphereStrength: [0.1, 0.5],
    cloudCount: [0, 10],
    waterHeight: [0.0, 0.05],
    surfaceRoughness: [0.2, 0.8],
    plateTectonics: [0.1, 0.5],
    biomassLevel: [0.0, 0.05],
    waterLevel: [0.0, 0.1],
    salinity: [0.0, 0.3],
    volcanicActivity: [0.0, 0.3],
    surfaceDeposits: ["Dust Deposits", "Surface Cracks"],
  },
  "Barren (Pending)": {
    temperature: [180, 260],
    atmosphereStrength: [0.1, 0.5],
    cloudCount: [0, 10],
    waterHeight: [0.0, 0.05],
    surfaceRoughness: [0.2, 0.8],
    plateTectonics: [0.1, 0.5],
    biomassLevel: [0.0, 0.05],
    waterLevel: [0.0, 0.1],
    salinity: [0.0, 0.3],
    volcanicActivity: [0.0, 0.3],
    surfaceDeposits: ["Dust Deposits", "Surface Cracks"],
  },
  "Arid Dunes": {
    temperature: [250, 330],
    atmosphereStrength: [0.2, 0.6],
    cloudCount: [5, 40],
    waterHeight: [0.0, 0.2],
    surfaceRoughness: [0.3, 0.9],
    plateTectonics: [0.1, 0.4],
    biomassLevel: [0.0, 0.1],
    waterLevel: [0.0, 0.2],
    salinity: [0.0, 0.4],
    volcanicActivity: [0.1, 0.6],
    surfaceDeposits: ["Sand", "Unconsolidated Soil"],
  },
  "Frigid Expanse": {
    temperature: [120, 240],
    atmosphereStrength: [0.4, 0.9],
    cloudCount: [20, 100],
    waterHeight: [0.1, 0.5],
    surfaceRoughness: [0.2, 0.6],
    plateTectonics: [0.1, 0.3],
    biomassLevel: [0.0, 0.3],
    waterLevel: [0.2, 0.8],
    salinity: [0.2, 0.8],
    volcanicActivity: [0.0, 0.2],
    surfaceDeposits: ["Ice Sheets", "Frozen Lakes"],
  },
  "Volcanic Terrain": {
    temperature: [300, 1200],
    atmosphereStrength: [0.5, 1.2],
    cloudCount: [15, 70],
    waterHeight: [0.0, 0.1],
    surfaceRoughness: [0.7, 1.2],
    plateTectonics: [0.5, 1.0],
    biomassLevel: [0.02, 0.1],
    waterLevel: [0.0, 0.2],
    salinity: [0.0, 0.2],
    volcanicActivity: [0.5, 1.2],
    surfaceDeposits: ["Volcanic Ash", "Lava Fields"],
  },
  "Basalt Plains": {
    temperature: [220, 350],
    atmosphereStrength: [0.3, 0.8],
    cloudCount: [10, 50],
    waterHeight: [0.0, 0.3],
    surfaceRoughness: [0.3, 0.7],
    plateTectonics: [0.3, 0.7],
    biomassLevel: [0.0, 0.15],
    waterLevel: [0.0, 0.3],
    salinity: [0.1, 0.4],
    volcanicActivity: [0.2, 0.6],
    surfaceDeposits: ["Basaltic Rock", "Mineral Deposits"],
  },
  "Sediment Flats": {
    temperature: [260, 310],
    atmosphereStrength: [0.4, 0.7],
    cloudCount: [20, 60],
    waterHeight: [0.1, 0.4],
    surfaceRoughness: [0.1, 0.4],
    plateTectonics: [0.1, 0.4],
    biomassLevel: [0.05, 0.3],
    waterLevel: [0.2, 0.5],
    salinity: [0.2, 0.6],
    volcanicActivity: [0.0, 0.3],
    surfaceDeposits: ["Clay", "Fine Sand", "Sulfate-Rich Soil"],
  },
  "Cratered Terrain": {
    temperature: [200, 300],
    atmosphereStrength: [0.1, 0.6],
    cloudCount: [5, 40],
    waterHeight: [0.0, 0.2],
    surfaceRoughness: [0.4, 0.9],
    plateTectonics: [0.0, 0.3],
    biomassLevel: [0.0, 0.1],
    waterLevel: [0.0, 0.2],
    salinity: [0.0, 0.3],
    volcanicActivity: [0.0, 0.4],
    surfaceDeposits: ["Regolith", "Dust Deposits"],
  },
  "Tundra Basin": {
    temperature: [180, 270],
    atmosphereStrength: [0.4, 0.8],
    cloudCount: [30, 80],
    waterHeight: [0.2, 0.5],
    surfaceRoughness: [0.2, 0.5],
    plateTectonics: [0.1, 0.4],
    biomassLevel: [0.1, 0.4],
    waterLevel: [0.3, 0.6],
    salinity: [0.1, 0.4],
    volcanicActivity: [0.0, 0.2],
    surfaceDeposits: ["Permafrost", "Pebbles", "Rocky Terrain"],
  },
  "Temperate Highlands": {
    temperature: [270, 310],
    atmosphereStrength: [0.5, 0.9],
    cloudCount: [40, 90],
    waterHeight: [0.3, 0.6],
    surfaceRoughness: [0.4, 0.8],
    plateTectonics: [0.3, 0.7],
    biomassLevel: [0.3, 0.8],
    waterLevel: [0.3, 0.7],
    salinity: [0.2, 0.5],
    volcanicActivity: [0.1, 0.4],
    surfaceDeposits: ["Mineral-Rich Soil", "Loam"],
  },
  "Oceanic World": {
    temperature: [260, 320],
    atmosphereStrength: [0.6, 1.0],
    cloudCount: [60, 100],
    waterHeight: [0.9, 1.0], // Increased minimum water height
    surfaceRoughness: [0.1, 0.3], // Reduced surface roughness
    plateTectonics: [0.2, 0.6],
    biomassLevel: [0.4, 0.9],
    waterLevel: [0.9, 1.0], // Increased minimum water level
    salinity: [0.5, 0.9],
    volcanicActivity: [0.1, 0.5],
    surfaceDeposits: ["Deep Water", "Sedimentary Layers"],
  },
  "Tropical Jungle": {
    temperature: [290, 330],
    atmosphereStrength: [0.7, 1.0],
    cloudCount: [70, 100],
    waterHeight: [0.4, 0.7],
    surfaceRoughness: [0.3, 0.7],
    plateTectonics: [0.2, 0.5],
    biomassLevel: [0.7, 1.0],
    waterLevel: [0.5, 0.8],
    salinity: [0.2, 0.4],
    volcanicActivity: [0.1, 0.3],
    surfaceDeposits: ["Dense Vegetation", "Wet Soil"],
  },
  "Flood Basin": {
    temperature: [270, 320],
    atmosphereStrength: [0.5, 0.9],
    cloudCount: [50, 90],
    waterHeight: [0.5, 0.8],
    surfaceRoughness: [0.1, 0.3],
    plateTectonics: [0.1, 0.3],
    biomassLevel: [0.3, 0.7],
    waterLevel: [0.6, 0.9],
    salinity: [0.3, 0.6],
    volcanicActivity: [0.0, 0.2],
    surfaceDeposits: ["Silt", "Muddy Terrain"],
  },
  "Coral Reefs": {
    temperature: [280, 310],
    atmosphereStrength: [0.6, 0.9],
    cloudCount: [40, 80],
    waterHeight: [0.6, 0.9],
    surfaceRoughness: [0.2, 0.5],
    plateTectonics: [0.1, 0.4],
    biomassLevel: [0.6, 0.9],
    waterLevel: [0.7, 0.9],
    salinity: [0.6, 0.9],
    volcanicActivity: [0.0, 0.2],
    surfaceDeposits: ["Limestone", "Organic Deposits"],
  },
  "Dune Fields": {
    temperature: [270, 350],
    atmosphereStrength: [0.2, 0.6],
    cloudCount: [10, 50],
    waterHeight: [0.0, 0.1],
    surfaceRoughness: [0.3, 0.7],
    plateTectonics: [0.0, 0.3],
    biomassLevel: [0.0, 0.1],
    waterLevel: [0.0, 0.1],
    salinity: [0.0, 0.3],
    volcanicActivity: [0.0, 0.3],
    surfaceDeposits: ["Fine Sand", "Wind-Driven Erosion"],
  },
};

export function getSurfaceDeposits(biome: string): string[] {
  return biomeData[biome]?.surfaceDeposits || ["Unknown"]
}

export function getParameterRange(biome: string, parameter: keyof BiomeRanges): [number, number] {
  if (!biomeData[biome] || !biomeData[biome][parameter]) {
    // Default ranges if biome or parameter not found
    const defaultRanges: { [key: string]: [number, number] } = {
      temperature: [50, 400],
      atmosphereStrength: [0, 1],
      cloudCount: [0, 100],
      waterHeight: [0, 1],
      surfaceRoughness: [0, 2],
      plateTectonics: [0, 1],
      biomassLevel: [0, 1],
      waterLevel: [0, 1],
      salinity: [0, 1],
      volcanicActivity: [0, 1],
    }

    return defaultRanges[parameter as string] || [0, 1]
  }

  return biomeData[biome][parameter] as [number, number]
}

// Function to clamp a value within a range
export function clampToRange(value: number, range: [number, number]): number {
  return Math.min(Math.max(value, range[0]), range[1])
}

// Function to adjust all parameters to fit within biome ranges
export function adjustParametersForBiome(biome: string, currentParams: any): any {
  const adjustedParams = { ...currentParams }

  // List of parameters to adjust
  const parametersToAdjust: (keyof BiomeRanges)[] = [
    "temperature",
    "atmosphereStrength",
    "cloudCount",
    "waterHeight",
    "surfaceRoughness",
    "plateTectonics",
    "biomassLevel",
    "waterLevel",
    "salinity",
    "volcanicActivity",
  ]

  // Adjust each parameter to fit within the biome's range
  parametersToAdjust.forEach((param) => {
    if (adjustedParams[param] !== undefined) {
      const range = getParameterRange(biome, param)
      adjustedParams[param] = clampToRange(adjustedParams[param], range)
    };
  });

  return adjustedParams
};