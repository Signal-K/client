import type { DatabaseAnomaly } from "../types"
import { seededRandom } from "@/utils/Structures/Telescope/sector-utils"

// Anomaly type mapping configuration
export const ANOMALY_TYPES = {
  exoplanet: {
    project: "planet-hunters",
    colors: ["#78cce2", "#4e7988", "#005066", "#78cce2", "#4e7988", "#005066", "#78cce2", "#4e7988"],
    shapes: ["circle", "star", "hexagon"] as const,
  },
  sunspot: {
    project: "sunspots",
    colors: ["#e4eff0", "#78cce2", "#e4eff0", "#78cce2", "#e4eff0", "#78cce2", "#e4eff0", "#78cce2"],
    shapes: ["circle", "oval", "star"] as const,
  },
  asteroid: {
    project: "daily-minor-planet",
    colors: ["#4e7988", "#005066", "#4e7988", "#005066", "#4e7988", "#005066", "#4e7988", "#005066"],
    shapes: ["diamond", "triangle", "hexagon"] as const,
  },
  accretion_disc: {
    project: "disk-detective",
    colors: ["#78cce2", "#4e7988", "#78cce2", "#4e7988", "#78cce2", "#4e7988", "#78cce2", "#4e7988"],
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

export function generateAnomalyProperties(dbAnomaly: DatabaseAnomaly) {
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
    sector: `SECTOR-${Math.floor(seededRandom(seed, 9) * 10) - 5}-${Math.floor(seededRandom(seed, 10) * 10) - 5}`,
    discoveryDate: new Date().toLocaleDateString(),
    dbData: dbAnomaly,
  }
};