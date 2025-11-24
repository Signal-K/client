// Mineral deposit types and states
export type MineralType = 
  | "water-ice" 
  | "co2-ice" 
  | "metallic-hydrogen" 
  | "metallic-helium" 
  | "methane" 
  | "ammonia"
  | "soil"
  | "dust"
  | "water-vapour"
  | "iron-ore"
  | "copper-ore"
  | "gold-ore"
  | "silicate"
  | "carbon";

export type MineralState = "solid" | "liquid" | "gas" | "plasma";

// Deposit position on planet surface
export interface DepositPosition {
  latitude: number; // -90 to 90
  longitude: number; // -180 to 180
}

// Child classification marker (clouds, waypoints, etc.)
export interface ChildClassification {
  id: number;
  type: string; // classificationtype
  position: DepositPosition;
  content?: string;
  media?: any[];
}

// Individual mineral deposit on planet surface
export interface MineralDeposit {
  id?: number; // Database ID if saved
  type: MineralType;
  state: MineralState;
  position: DepositPosition;
  size: number; // 0.01-0.1 (relative to planet size)
  amount?: number;
  purity?: number;
  classificationId?: number; // Link to classification
  color?: string; // Override color
  discoveredBy?: string; // User ID
}

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
  deposits?: MineralDeposit[] // Mineral deposits on surface
  childClassifications?: ChildClassification[] // Child classifications (clouds, waypoints, etc.)
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
  deposits: [],
  childClassifications: [],
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

// Get visual properties for mineral deposits
export function getDepositVisuals(
  type: MineralType,
  state: MineralState,
  temperature: number
): { color: string; emissive: string; intensity: number } {
  const visuals: Record<MineralType, Record<MineralState, { color: string; emissive: string; intensity: number }>> = {
    "water-ice": {
      solid: { color: "#B4E7FF", emissive: "#88CCFF", intensity: 0.3 },
      liquid: { color: "#1E90FF", emissive: "#1E90FF", intensity: 0.1 },
      gas: { color: "#CCDDFF", emissive: "#FFFFFF", intensity: 0.2 },
      plasma: { color: "#FF0000", emissive: "#FF0000", intensity: 0.8 },
    },
    "co2-ice": {
      solid: { color: "#E8F4F8", emissive: "#FFFFFF", intensity: 0.4 },
      liquid: { color: "#CCDDEE", emissive: "#AABBCC", intensity: 0.2 },
      gas: { color: "#F0F0F0", emissive: "#FFFFFF", intensity: 0.1 },
      plasma: { color: "#FF4444", emissive: "#FF0000", intensity: 0.7 },
    },
    "metallic-hydrogen": {
      solid: { color: "#C0C0C0", emissive: "#E0E0E0", intensity: 0.5 },
      liquid: { color: "#A0A0D0", emissive: "#C0C0FF", intensity: 0.6 },
      gas: { color: "#D0D0FF", emissive: "#E0E0FF", intensity: 0.3 },
      plasma: { color: "#FF00FF", emissive: "#FF00FF", intensity: 0.9 },
    },
    "metallic-helium": {
      solid: { color: "#FFE4B5", emissive: "#FFD700", intensity: 0.4 },
      liquid: { color: "#FFA500", emissive: "#FFD700", intensity: 0.5 },
      gas: { color: "#FFCC99", emissive: "#FFE4B5", intensity: 0.2 },
      plasma: { color: "#FF6600", emissive: "#FF6600", intensity: 0.8 },
    },
    methane: {
      solid: { color: "#9FE2BF", emissive: "#7FC7AF", intensity: 0.3 },
      liquid: { color: "#6FCDAF", emissive: "#5FAD8F", intensity: 0.4 },
      gas: { color: "#AFFFFF", emissive: "#8FEFEF", intensity: 0.2 },
      plasma: { color: "#00FF88", emissive: "#00FF88", intensity: 0.7 },
    },
    ammonia: {
      solid: { color: "#E6E6FA", emissive: "#D8BFD8", intensity: 0.3 },
      liquid: { color: "#DDA0DD", emissive: "#DA70D6", intensity: 0.4 },
      gas: { color: "#F0E6FF", emissive: "#E6D6FF", intensity: 0.2 },
      plasma: { color: "#FF00FF", emissive: "#FF00FF", intensity: 0.8 },
    },
    soil: {
      solid: { color: "#8B4513", emissive: "#654321", intensity: 0.1 },
      liquid: { color: "#A0522D", emissive: "#8B4513", intensity: 0.2 },
      gas: { color: "#D2691E", emissive: "#CD853F", intensity: 0.1 },
      plasma: { color: "#FF4500", emissive: "#FF4500", intensity: 0.6 },
    },
    dust: {
      solid: { color: "#D2B48C", emissive: "#C19A6B", intensity: 0.1 },
      liquid: { color: "#DEB887", emissive: "#D2B48C", intensity: 0.1 },
      gas: { color: "#F5DEB3", emissive: "#FFE4B5", intensity: 0.1 },
      plasma: { color: "#FF6347", emissive: "#FF6347", intensity: 0.5 },
    },
    "water-vapour": {
      solid: { color: "#E0F8FF", emissive: "#FFFFFF", intensity: 0.2 },
      liquid: { color: "#ADD8E6", emissive: "#87CEEB", intensity: 0.2 },
      gas: { color: "#F0F8FF", emissive: "#FFFFFF", intensity: 0.15 },
      plasma: { color: "#FF6B6B", emissive: "#FF0000", intensity: 0.7 },
    },
    "iron-ore": {
      solid: { color: "#8B4726", emissive: "#A0522D", intensity: 0.2 },
      liquid: { color: "#FF4500", emissive: "#FF6347", intensity: 0.6 },
      gas: { color: "#FFA07A", emissive: "#FF7F50", intensity: 0.3 },
      plasma: { color: "#FF0000", emissive: "#FF0000", intensity: 0.9 },
    },
    "copper-ore": {
      solid: { color: "#B87333", emissive: "#CD7F32", intensity: 0.3 },
      liquid: { color: "#FF6347", emissive: "#FF4500", intensity: 0.5 },
      gas: { color: "#FFA07A", emissive: "#FF8C69", intensity: 0.3 },
      plasma: { color: "#FF4500", emissive: "#FF4500", intensity: 0.8 },
    },
    "gold-ore": {
      solid: { color: "#FFD700", emissive: "#FFA500", intensity: 0.5 },
      liquid: { color: "#FF8C00", emissive: "#FF6347", intensity: 0.7 },
      gas: { color: "#FFFF00", emissive: "#FFD700", intensity: 0.4 },
      plasma: { color: "#FF00FF", emissive: "#FF00FF", intensity: 0.9 },
    },
    silicate: {
      solid: { color: "#696969", emissive: "#808080", intensity: 0.1 },
      liquid: { color: "#FF4500", emissive: "#FF6347", intensity: 0.5 },
      gas: { color: "#A9A9A9", emissive: "#C0C0C0", intensity: 0.2 },
      plasma: { color: "#FFA500", emissive: "#FFA500", intensity: 0.7 },
    },
    carbon: {
      solid: { color: "#2F4F4F", emissive: "#000000", intensity: 0.05 },
      liquid: { color: "#FF4500", emissive: "#FF6347", intensity: 0.6 },
      gas: { color: "#696969", emissive: "#808080", intensity: 0.1 },
      plasma: { color: "#FF00FF", emissive: "#FF00FF", intensity: 0.8 },
    },
  };

  return visuals[type]?.[state] || { color: "#808080", emissive: "#404040", intensity: 0.2 };
}

// Determine mineral state based on temperature
export function getMineralState(type: MineralType, temperature: number): MineralState {
  const stateRanges: Record<MineralType, { solid: number; liquid: number; gas: number }> = {
    "water-ice": { solid: 273, liquid: 373, gas: 1000 },
    "co2-ice": { solid: 195, liquid: 216, gas: 600 },
    "metallic-hydrogen": { solid: 14, liquid: 33, gas: 5000 },
    "metallic-helium": { solid: 1, liquid: 4, gas: 5000 },
    methane: { solid: 91, liquid: 112, gas: 600 },
    ammonia: { solid: 195, liquid: 240, gas: 800 },
    soil: { solid: 1800, liquid: 2200, gas: 3000 },
    dust: { solid: 1600, liquid: 2000, gas: 2800 },
    "water-vapour": { solid: 273, liquid: 373, gas: 1000 },
    "iron-ore": { solid: 1811, liquid: 3134, gas: 5000 },
    "copper-ore": { solid: 1358, liquid: 2835, gas: 4500 },
    "gold-ore": { solid: 1337, liquid: 3243, gas: 5000 },
    silicate: { solid: 1473, liquid: 2373, gas: 3500 },
    carbon: { solid: 3823, liquid: 4098, gas: 5000 },
  };

  const ranges = stateRanges[type];
  if (!ranges) return "solid";

  if (temperature < ranges.solid) return "solid";
  if (temperature < ranges.liquid) return "liquid";
  if (temperature < ranges.gas) return "gas";
  return "plasma";
}

// getTemperatureAdjustedColors removed (unused)