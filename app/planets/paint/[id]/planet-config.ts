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

// Simple planet presets using the full PlanetConfig
export const simplePlanetPresets: Record<string, PlanetConfig> = {
  earth: {
    type: "terrestrial",
    seed: 1234,
    radius: 1.0,
    temperature: 288,
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
  },
  mars: {
    type: "terrestrial",
    seed: 5678,
    radius: 0.5,
    temperature: 210, // Mars average
    biomass: 0.0,
    mass: 0.1,
    terrainRoughness: 0.8,
    liquidHeight: 0.3,
    volcanicActivity: 0.1,
    continentSize: 0.8,
    continentCount: 2,
    noiseScale: 1.2,
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
      atmosphere: "#CD853F",
      ocean: "#8B4513",
      oceanPattern: "#A0522D",
      beach: "#CD853F",
      lowland: "#A0522D",
      midland: "#8B4513",
      highland: "#8B0000",
      mountain: "#696969",
      snow: "#F5F5DC",
    },
  },
  jupiter: {
    type: "gaseous",
    seed: 9012,
    radius: 2.5,
    temperature: 165, // Jupiter average
    biomass: 0.0,
    mass: 8.0,
    terrainRoughness: 0.3,
    liquidHeight: 0.0,
    volcanicActivity: 0.0,
    continentSize: 0.0,
    continentCount: 0,
    noiseScale: 0.5,
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
      atmosphere: "#DAA520",
      ocean: "#B8860B",
      oceanPattern: "#8B7355",
      beach: "#DAA520",
      lowland: "#B8860B",
      midland: "#8B7355",
      highland: "#8B4513",
      mountain: "#654321",
      snow: "#F5DEB3",
    },
  },
  neptune: {
    type: "gaseous",
    seed: 3456,
    radius: 2.0,
    temperature: 72, // Neptune average
    biomass: 0.0,
    mass: 5.0,
    terrainRoughness: 0.2,
    liquidHeight: 0.0,
    volcanicActivity: 0.0,
    continentSize: 0.0,
    continentCount: 0,
    noiseScale: 0.3,
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
      atmosphere: "#4169E1",
      ocean: "#0000CD",
      oceanPattern: "#191970",
      beach: "#4169E1",
      lowland: "#0000CD",
      midland: "#191970",
      highland: "#000080",
      mountain: "#483D8B",
      snow: "#E6E6FA",
    },
  },
  venus: {
    type: "terrestrial",
    seed: 7890,
    radius: 0.9,
    temperature: 737, // Venus average
    biomass: 0.0,
    mass: 0.8,
    terrainRoughness: 0.4,
    liquidHeight: 0.0,
    volcanicActivity: 0.8,
    continentSize: 0.6,
    continentCount: 3,
    noiseScale: 0.8,
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
      atmosphere: "#FFA500",
      ocean: "#FF4500",
      oceanPattern: "#FF6347",
      beach: "#FFA500",
      lowland: "#FF8C00",
      midland: "#FF4500",
      highland: "#8B0000",
      mountain: "#2F4F4F",
      snow: "#D3D3D3",
    },
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

// Function to adjust terrain colors based on temperature
export function getTemperatureAdjustedColors(
  temperature: number,
  biomass: number,
): {
  beach: string
  lowland: string
  midland: string
  highland: string
  mountain: string
  snow: string
} {
  // Base colors
  let beach = "#F0E68C" // Default sandy beach
  let lowland = "#32CD32" // Default green lowland
  let midland = "#228B22" // Default forest green
  let highland = "#8B4513" // Default brown
  let mountain = "#A0A0A0" // Default gray
  let snow = "#FFFFFF" // Default white

  // Cold planet (< 240K)
  if (temperature < 240) {
    beach = "#E0E0E0" // Icy shore
    lowland = "#E8E8F0" // Light ice
    midland = "#C8D8E0" // Bluish ice
    highland = "#A8B8C0" // Darker ice
    mountain = "#889098" // Dark gray
    snow = "#FFFFFF" // Pure white
  }
  // Cool planet (240K to 280K)
  else if (temperature < 280) {
    beach = "#D8D8C0" // Cool sand
    lowland = "#C0D8C0" // Tundra
    midland = "#A0C0A0" // Sparse vegetation
    highland = "#909080" // Rocky tundra
    mountain = "#808080" // Gray rock
    snow = "#FFFFFF" // White snow
  }
  // Temperate planet (280K to 310K)
  else if (temperature < 310) {
    // Adjust based on biomass
    const bioFactor = Math.min(biomass * 1.5, 1.0)

    beach = "#F0E68C" // Sandy beach
    lowland = bioFactor > 0.3 ? "#32CD32" : "#C2CC70" // Green if biomass, otherwise yellowish
    midland = bioFactor > 0.3 ? "#228B22" : "#A0A060" // Forest if biomass, otherwise scrubland
    highland = "#8B4513" // Brown
    mountain = "#A0A0A0" // Gray
    snow = "#FFFFFF" // White
  }
  // Hot planet (310K to 400K)
  else if (temperature < 400) {
    beach = "#F8E0A0" // Light sand
    lowland = biomass > 0.4 ? "#74A662" : "#D8C878" // Either vegetation or desert
    midland = biomass > 0.4 ? "#567D46" : "#C0A060" // Either vegetation or desert
    highland = "#B89060" // Light brown
    mountain = "#A89080" // Reddish rock
    snow = temperature > 350 ? "#F0F0F0" : "#FFFFFF" // Slightly off-white at higher temps
  }
  // Very hot planet (400K to 600K)
  else if (temperature < 600) {
    beach = "#F8D080" // Orange sand
    lowland = "#E0B060" // Desert
    midland = "#C09050" // Dark desert
    highland = "#A07040" // Reddish brown
    mountain = "#805030" // Dark red rock
    snow = "#E8E8E8" // Off-white (salt flats)
  }
  // Extremely hot planet (>600K)
  else {
    beach = "#FF9060" // Orange-red
    lowland = "#E07040" // Reddish
    midland = "#C05020" // Dark red
    highland = "#A03010" // Very dark red
    mountain = "#802000" // Almost black-red
    snow = "#D0D0D0" // Light gray (ash)
  }

  return { beach, lowland, midland, highland, mountain, snow }
}

// Auto-determine planet type based on mass and radius
export function getAutoType(mass: number, radius: number): "terrestrial" | "gaseous" {
  return mass > 7.5 || radius > 2.5 ? "gaseous" : "terrestrial"
}

// Get simplified colors for simple planet interface (maps to primary terrain colors)
export function getSimplifiedColors(config: PlanetConfig): {
  primary: string
  secondary: string
  accent: string
} {
  if (config.type === "gaseous") {
    return {
      primary: config.colors.atmosphere,
      secondary: config.colors.ocean,
      accent: config.colors.oceanPattern,
    }
  } else {
    return {
      primary: config.colors.ocean, // Water/ocean
      secondary: config.colors.lowland, // Land
      accent: config.colors.highland, // Mountains
    }
  }
}

// Update full config from simplified colors
export function updateFromSimplifiedColors(
  config: PlanetConfig,
  colors: { primary: string; secondary: string; accent: string },
): Partial<PlanetConfig> {
  if (config.type === "gaseous") {
    return {
      colors: {
        ...config.colors,
        atmosphere: colors.primary,
        ocean: colors.secondary,
        oceanPattern: colors.accent,
        beach: colors.primary,
        lowland: colors.secondary,
        midland: colors.accent,
        highland: colors.primary,
        mountain: colors.secondary,
        snow: colors.accent,
      },
    }
  } else {
    return {
      colors: {
        ...config.colors,
        ocean: colors.primary,
        oceanPattern: colors.primary,
        lowland: colors.secondary,
        midland: colors.secondary,
        highland: colors.accent,
        mountain: colors.accent,
      },
    }
  }
}

// Create a simplified config interface for the simple planet viewer
export function createSimplifiedConfig(config: PlanetConfig) {
  return {
    type: config.type,
    radius: config.radius,
    mass: config.mass,
    density: config.mass / ((config.radius ** 3 * Math.PI * 4) / 3),
    seed: config.seed,
    colors: getSimplifiedColors(config),
    // Include full config for the mesh to use
    fullConfig: config,
  }
};