export type LandmarkType =
  | "mountain"
  | "lake"
  | "ocean"
  | "crater"
  | "volcano"
  | "canyon"
  | "plain"
  | "forest"
  | "desert"
  | "glacier"
  | "island";

export interface Landmark {
  id: string
  name: string
  type: LandmarkType
  biome?: string;
  position: {
    x: number // 0-1 normalized position on map
    y: number // 0-1 normalized position on map
  }
  size: number // 0-1 normalized size
  elevation: number // Elevation value at this point
  description?: string
  color?: string // Optional custom color
};

export const LANDMARK_COLORS: Record<LandmarkType, string> = {
  mountain: "#8B4513", // Brown
  lake: "#1E90FF", // Blue
  ocean: "#00008B", // Dark blue
  crater: "#696969", // Gray
  volcano: "#FF4500", // Red-orange
  canyon: "#A0522D", // Sienna
  plain: "#9ACD32", // Yellow-green
  forest: "#228B22", // Forest green
  desert: "#F4A460", // Sandy brown
  glacier: "#E0FFFF", // Light cyan
  island: "#DEB887", // Burlywood
};

export const LANDMARK_ICONS: Record<LandmarkType, string> = {
  mountain: "▲",
  lake: "◎",
  ocean: "≈",
  crater: "◯",
  volcano: "△",
  canyon: "≡",
  plain: "─",
  forest: "♣",
  desert: "∴",
  glacier: "❄",
  island: "⬤",
};

export const LANDMARK_DESCRIPTIONS: Record<LandmarkType, string> = {
  mountain: "An elevated landform rising prominently above the surrounding terrain",
  lake: "A body of relatively still water surrounded by land",
  ocean: "A vast body of saltwater that covers a significant portion of the planet",
  crater: "A bowl-shaped depression formed by the impact of a meteorite",
  volcano: "A rupture in the planetary crust that allows magma to escape",
  canyon: "A deep gorge typically with a river flowing through it",
  plain: "A flat, sweeping landmass with minimal elevation changes",
  forest: "A dense area covered with trees and undergrowth",
  desert: "An arid land with little precipitation and sparse vegetation",
  glacier: "A persistent body of dense ice constantly moving under its own weight",
  island: "A piece of land surrounded by water",
}

// Generate a random name for a landmark based on its type
export function generateLandmarkName(type: LandmarkType): string {
  const prefixes: Record<LandmarkType, string[]> = {
    mountain: ["Mount", "Peak", "Ridge", "Highland", "Summit"],
    lake: ["Lake", "Lagoon", "Mere", "Basin", "Pond"],
    ocean: ["Ocean", "Sea", "Abyss", "Deep", "Waters"],
    crater: ["Crater", "Basin", "Impact", "Hollow", "Pit"],
    volcano: ["Mount", "Volcano", "Caldera", "Vent", "Peak"],
    canyon: ["Canyon", "Gorge", "Ravine", "Chasm", "Valley"],
    plain: ["Plain", "Flatland", "Steppe", "Prairie", "Field"],
    forest: ["Forest", "Woods", "Grove", "Woodland", "Jungle"],
    desert: ["Desert", "Waste", "Dunes", "Sands", "Badlands"],
    glacier: ["Glacier", "Ice Field", "Frost", "Snowfield", "Icecap"],
    island: ["Island", "Isle", "Atoll", "Archipelago", "Key"],
  }

  const suffixes = [
    "Alpha",
    "Beta",
    "Gamma",
    "Delta",
    "Epsilon",
    "Prime",
    "Major",
    "Minor",
    "Maximus",
    "Minimus",
    "Nova",
    "Antiqua",
    "Magna",
    "Parva",
    "Ultima",
    "Borealis",
    "Australis",
    "Orientalis",
    "Occidentalis",
    "Ruber",
    "Viridis",
    "Caeruleus",
    "Albus",
    "Niger",
  ]

  const prefix = prefixes[type][Math.floor(Math.random() * prefixes[type].length)]
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)]

  return `${prefix} ${suffix}`
}

// Function to determine if a landmark can exist at a given elevation and planet type
export function canLandmarkExistAt(
  type: LandmarkType,
  elevation: number,
  planetType: "terrestrial" | "gaseous",
  waterLevel: number,
  temperature: number,
): boolean {
  if (planetType === "gaseous") {
    // Only certain landmark types can exist on gaseous planets
    return ["crater", "volcano", "canyon"].includes(type)
  }

  switch (type) {
    case "mountain":
      return elevation > 0.5 // Mountains need high elevation
    case "lake":
      return elevation < waterLevel && elevation > -0.3 // Lakes need to be below water level but not too deep
    case "ocean":
      return elevation < -0.3 // Oceans are in deep areas
    case "crater":
      return elevation > -0.2 // Craters typically on land or shallow water
    case "volcano":
      return elevation > 0.3 // Volcanoes need some elevation
    case "canyon":
      return elevation > 0.1 // Canyons need to be on land
    case "plain":
      return elevation > waterLevel && elevation < 0.4 // Plains are flat areas above water
    case "forest":
      return elevation > waterLevel && elevation < 0.6 && temperature > 273 && temperature < 313 // Forests need moderate elevation and temperature
    case "desert":
      return elevation > waterLevel && elevation < 0.5 && temperature > 300 // Deserts need heat
    case "glacier":
      return elevation > waterLevel && temperature < 273 // Glaciers need cold
    case "island":
      return elevation > waterLevel && elevation < 0.4 && hasWaterNearby(elevation, waterLevel) // Islands need to be above water but not too high
    default:
      return true
  }
}

// Helper function to determine if there's water nearby (for islands)
function hasWaterNearby(elevation: number, waterLevel: number): boolean {
  // This is a simplified check - in a real implementation, we'd check surrounding points
  return elevation - waterLevel < 0.2 // Close to water level
}

// Generate landmarks based on planet properties
export function generateLandmarks(
  planetStats: {
    type: "terrestrial" | "gaseous"
    surfaceRoughness: number
    waterLevel: number
    temperature: number
    volcanicActivity: number
  },
  terrainData: Array<{ x: number; y: number; elevation: number }>,
  count = 10,
): Landmark[] {
  const landmarks: Landmark[] = []
  const { type, surfaceRoughness, waterLevel, temperature, volcanicActivity } = planetStats

  // Adjust counts based on planet properties
  const mountainCount = Math.floor(count * 0.3 * surfaceRoughness)
  const lakeCount = Math.floor(count * 0.2 * waterLevel)
  const oceanCount = Math.floor(count * 0.1)
  const craterCount = Math.floor(count * 0.1)
  const volcanoCount = Math.floor(count * 0.1 * volcanicActivity)
  const canyonCount = Math.floor(count * 0.1 * surfaceRoughness)
  const plainCount = Math.floor(count * 0.1)
  const forestCount = temperature > 273 && temperature < 313 ? Math.floor(count * 0.1) : 0
  const desertCount = temperature > 300 ? Math.floor(count * 0.1) : 0
  const glacierCount = temperature < 273 ? Math.floor(count * 0.1) : 0
  const islandCount = waterLevel > 0.3 ? Math.floor(count * 0.1) : 0

  // Helper function to add landmarks of a specific type
  const addLandmarks = (type: LandmarkType, count: number) => {
    for (let i = 0; i < count; i++) {
      // Try to find a suitable location
      for (let attempts = 0; attempts < 10; attempts++) {
        // Pick a random point from terrain data
        const pointIndex = Math.floor(Math.random() * terrainData.length)
        const point = terrainData[pointIndex]

        if (canLandmarkExistAt(type, point.elevation, planetStats.type, waterLevel, temperature)) {
          const name = generateLandmarkName(type)
          landmarks.push({
            id: `${type}-${landmarks.length}`,
            name,
            type,
            position: {
              x: point.x / 100, // Assuming terrainData is 100x100
              y: point.y / 100,
            },
            size: 0.1 + Math.random() * 0.3, // Random size between 0.1 and 0.4
            elevation: point.elevation,
            description: LANDMARK_DESCRIPTIONS[type],
            color: LANDMARK_COLORS[type],
          })
          break
        };
      };
    };
  };

  // Add landmarks of each type
  addLandmarks("mountain", mountainCount)
  addLandmarks("lake", lakeCount)
  addLandmarks("ocean", oceanCount)
  addLandmarks("crater", craterCount)
  addLandmarks("volcano", volcanoCount)
  addLandmarks("canyon", canyonCount)
  addLandmarks("plain", plainCount)
  addLandmarks("forest", forestCount)
  addLandmarks("desert", desertCount)
  addLandmarks("glacier", glacierCount)
  addLandmarks("island", islandCount)

  return landmarks
};