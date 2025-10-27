export interface PlanetConfig {
  type: "terrestrial" | "gaseous"
  seed: number
  radius: number
  temperature: number // Now in Kelvin
  biomass: number
  mass: number
  terrainRoughness: number
  liquidHeight: number
  volcanicActivity: number
  continentSize: number
  continentCount: number
  noiseScale: number
  debugMode?: boolean
  visibleTerrains: {
    ocean: boolean
    beach: boolean
    lowland: boolean
    midland: boolean
    highland: boolean
    mountain: boolean
    snow: boolean
  }
  colors: {
    atmosphere: string
    ocean: string
    oceanPattern: string
    beach: string
    lowland: string
    midland: string
    highland: string
    mountain: string
    snow: string
  }
}

export const defaultPlanetConfig: PlanetConfig = {
  type: "terrestrial",
  seed: Math.floor(Math.random() * 10000),
  radius: 1.0,
  temperature: 288, // Earth average in Kelvin (15°C)
  biomass: 0.7,
  mass: 1.0,
  terrainRoughness: 0.6,
  liquidHeight: 0.55,
  volcanicActivity: 0.2,
  continentSize: 0.5,
  continentCount: 5,
  noiseScale: 1.0,
  debugMode: false,
  visibleTerrains: {
    ocean: true,
    beach: true,
    lowland: true,
    midland: true,
    highland: true,
    mountain: true,
    snow: true,
  },
  colors: {
    atmosphere: "#87CEEB",
    ocean: "#1E90FF",
    oceanPattern: "#1E7FFF",
    beach: "#F0E68C",
    lowland: "#32CD32",
    midland: "#228B22",
    highland: "#8B4513",
    mountain: "#A0A0A0",
    snow: "#FFFFFF",
  },
}

// Function to determine liquid type based on temperature
export function getLiquidType(temperature: number): {
  name: string
  color: string
  patternColor: string
} {
  // Temperature ranges in Kelvin
  if (temperature < 90) {
    // Liquid nitrogen (63K to 77K)
    return {
      name: "Liquid Nitrogen",
      color: "#D6E7FF",
      patternColor: "#C0D6FF",
    }
  } else if (temperature < 120) {
    // Liquid methane (90K to 112K)
    return {
      name: "Liquid Methane",
      color: "#A2CDB0",
      patternColor: "#8EBDA0",
    }
  } else if (temperature < 373) {
    // Water (273K to 373K)
    return {
      name: "Water",
      color: "#1E90FF",
      patternColor: "#1E7FFF",
    }
  } else if (temperature < 600) {
    // Sulfuric acid (283K to 610K)
    return {
      name: "Sulfuric Acid",
      color: "#D6C562",
      patternColor: "#C4B250",
    }
  } else {
    // Molten silicates/lava (>1000K)
    return {
      name: "Molten Rock",
      color: "#FF4500",
      patternColor: "#FF2400",
    }
  }
}

// getTemperatureAdjustedColors removed (unused)