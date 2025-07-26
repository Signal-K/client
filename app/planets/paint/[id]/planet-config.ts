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
  // Base colors for earth-like conditions (around 288K)
  let beach = "#F0E68C"
  let lowland = "#32CD32"
  let midland = "#228B22"
  let highland = "#8B4513"
  let mountain = "#A0A0A0"
  let snow = "#FFFFFF"

  // Very cold planets (< 200K) - frozen, icy worlds  
  if (temperature < 200) {
    beach = "#E0E0FF" // Light blue ice
    lowland = biomass > 0.1 ? "#B0C4DE" : "#DCDCDC" // Frozen vegetation or ice
    midland = "#C0C0C0" // Light gray ice
    highland = "#A9A9A9" // Dark gray rock
    mountain = "#696969" // Dark stone
    snow = "#F0F8FF" // Blue-white snow
  }
  // Cold planets (200-273K) - tundra-like
  else if (temperature < 273) {
    beach = "#D2B48C" // Light brown
    lowland = biomass > 0.3 ? "#9ACD32" : "#F5F5DC" // Sparse vegetation or permafrost
    midland = biomass > 0.2 ? "#6B8E23" : "#DCDCDC"
    highland = "#8B7355" // Brown rock
    mountain = "#A0A0A0" // Gray stone
    snow = "#FFFAFA" // Snow white
  }
  // Temperate planets (273-350K) - earth-like
  else if (temperature < 350) {
    // Use base colors adjusted by biomass
    if (biomass < 0.1) {
      lowland = "#D2B48C" // Desert tan
      midland = "#CD853F" // Peru brown
    } else if (biomass > 0.8) {
      lowland = "#228B22" // Forest green
      midland = "#006400" // Dark green
    }
  }
  // Hot planets (350-500K) - arid desert worlds
  else if (temperature < 500) {
    beach = "#DEB887" // Burlywood
    lowland = biomass > 0.2 ? "#9ACD32" : "#D2B48C" // Sparse vegetation or sand
    midland = biomass > 0.1 ? "#8FBC8F" : "#CD853F" // Dry vegetation or rock
    highland = "#A0522D" // Sienna
    mountain = "#696969" // Dark gray
    snow = "#F5DEB3" // Wheat (no real snow)
  }
  // Very hot planets (500-700K) - volcanic worlds
  else if (temperature < 700) {
    beach = "#CD853F" // Peru brown
    lowland = "#A0522D" // Sienna  
    midland = "#8B4513" // Saddle brown
    highland = "#800000" // Maroon
    mountain = "#2F4F4F" // Dark slate gray
    snow = "#D3D3D3" // Light gray (ash)
  }
  // Extremely hot planets (>700K) - hellish worlds like Venus
  else {
    beach = "#FF6347" // Tomato red
    lowland = "#FF4500" // Orange red
    midland = "#DC143C" // Crimson
    highland = "#A03010" // Very dark red
    mountain = "#802000" // Almost black-red
    snow = "#D0D0D0" // Light gray (ash)
  }

  return { beach, lowland, midland, highland, mountain, snow }
}

export const planets = {
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