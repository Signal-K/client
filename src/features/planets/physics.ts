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