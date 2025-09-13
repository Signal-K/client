import type { Anomaly, ViewMode } from "@/types/Structures/telescope"
import { generateSectorName, generateStars, filterAnomaliesBySector, seededRandom } from "@/src/components/classification/telescope/utils/sector-utils"

export interface DatabaseAnomaly {
  id: number
  content: string | null
  anomalytype: string | null
  avatar_url: string | null
  created_at: string
  configuration: any
  parentAnomaly: number | null
  anomalyConfiguration?: string | null;
  anomalySet: string | null
};

export interface DatabaseClassification {
  id: number
  created_at: string
  content: string | null
  author: string | null
  anomaly: number | null
  media: any
  classificationtype: string | null
  classificationConfiguration: any
};

// Pastel color palette
export const PASTEL_COLORS = {
  primary: "#a8d8ea", // soft blue
  secondary: "#ffb3d9", // soft pink
  accent: "#c7cedb", // soft purple
  success: "#b8e6b8", // soft green
  warning: "#ffd93d", // soft yellow
  info: "#87ceeb", // soft sky blue
  background: "#1a1a2e", // dark navy
  surface: "#16213e", // darker blue
  text: "#e8f4f8", // very light blue
  textSecondary: "#b8c5d1", // muted blue-gray
}

// Anomaly type mapping configuration with pastel colors
export const ANOMALY_TYPES = {
  exoplanet: {
    project: "planet-hunters",
    colors: ["#a8d8ea", "#87ceeb", "#b8e6b8", "#c7cedb", "#a8d8ea", "#87ceeb", "#b8e6b8", "#c7cedb"],
    shapes: ["circle", "star", "hexagon"] as const,
  },
  sunspot: {
    project: "sunspots",
    colors: ["#ffd93d", "#ffb3d9", "#ffd93d", "#ffb3d9", "#ffd93d", "#ffb3d9", "#ffd93d", "#ffb3d9"],
    shapes: ["circle", "oval", "star"] as const,
  },
  asteroid: {
    project: "daily-minor-planet",
    colors: ["#c7cedb", "#ffb3d9", "#c7cedb", "#ffb3d9", "#c7cedb", "#ffb3d9", "#c7cedb", "#ffb3d9"],
    shapes: ["diamond", "triangle", "hexagon"] as const,
  },
  accretion_disc: {
    project: "disk-detective",
    colors: ["#b8e6b8", "#87ceeb", "#b8e6b8", "#87ceeb", "#b8e6b8", "#87ceeb", "#b8e6b8", "#87ceeb"],
    shapes: ["oval", "circle", "hexagon"] as const,
  },
} as const

export type AnomalyType = keyof typeof ANOMALY_TYPES

export function normalizeAnomalyType(type: string | null): AnomalyType {
  switch (type) {
    case "planet":
    case "telescope-tess":
    case "exoplanet":
      return "exoplanet"
    case "sunspot":
      return "sunspot"
    case "telescope-awa":
    case "accretion_disc":
    case "disk":
      return "accretion_disc"
    case "asteroid":
    case "active-asteroids":
    case "telescope-minorPlanet":
    case "minor-planet":
      return "asteroid"
    default:
      return "exoplanet"
  }
}

export function generateAnomalyProperties(dbAnomaly: DatabaseAnomaly): Anomaly & { dbData: DatabaseAnomaly } {
  const seed = dbAnomaly.id
  const type = normalizeAnomalyType(dbAnomaly.anomalySet)
  const config = ANOMALY_TYPES[type]

  return {
    id: `db-${dbAnomaly.id}`,
    name: dbAnomaly.content || `${type.toUpperCase()}-${String(dbAnomaly.id).padStart(3, "0")}`,
    type,
    project: config.project,
    x: seededRandom(seed, 1) * 80 + 10,
    y: seededRandom(seed, 2) * 80 + 10,
    brightness: seededRandom(seed, 3) * 0.7 + 0.5,
    size: seededRandom(seed, 4) * 0.8 + 0.6,
    pulseSpeed: seededRandom(seed, 5) * 2 + 1,
    glowIntensity: seededRandom(seed, 6) * 0.5 + 0.3,
    color: config.colors[Math.floor(seededRandom(seed, 7) * config.colors.length)],
    shape: config.shapes[Math.floor(seededRandom(seed, 8) * config.shapes.length)],
    sector: generateSectorName(Math.floor(seededRandom(seed, 9) * 10) - 5, Math.floor(seededRandom(seed, 10) * 10) - 5),
    discoveryDate: new Date().toLocaleDateString(),
    dbData: dbAnomaly,
  }
};