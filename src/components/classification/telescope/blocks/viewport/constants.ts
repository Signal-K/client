import type { DatabaseAnomaly } from "../types"
import { seededRandom, generateSectorName } from "@/src/components/classification/telescope/utils/sector-utils"

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
    colors: ["#ff6b6b", "#ff8888", "#ff6b6b", "#ff8888", "#ff6b6b", "#ff8888", "#ff6b6b", "#ff8888"],
    shapes: ["oval", "circle", "star"] as const,
  },
  variable_star: {
    project: "superwasp-variable",
    colors: ["#ff9966", "#ffaa77", "#ff9966", "#ffaa77", "#ff9966", "#ffaa77", "#ff9966", "#ffaa77"],
    shapes: ["star", "circle", "oval"] as const,
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
    case "diskDetective":
      return "accretion_disc"
    case "asteroid":
    case "active-asteroids":
    case "telescope-minorPlanet":
    case "minor-planet":
      return "asteroid"
    case "superwasp-variable":
    case "telescope-superwasp-variable":
    case "variable-star":
    case "variable_star":
      return "variable_star"
    default:
      return "exoplanet"
  }
}

export function generateAnomalyProperties(dbAnomaly: DatabaseAnomaly) {
  const seed = dbAnomaly.id
  const type = normalizeAnomalyType(dbAnomaly.anomalySet)
  const config = ANOMALY_TYPES[type]

  // Debug logging for ALL anomalies to see what's happening
  console.log(`🔍 DEBUG: Anomaly ${seed}:`, {
    anomalySet: dbAnomaly.anomalySet,
    normalizedType: type,
    project: config.project,
    content: dbAnomaly.content
  });

  // Generate sector coordinates that match the current sector system
  const sectorX = Math.floor(seededRandom(seed, 9) * 10) - 5
  const sectorY = Math.floor(seededRandom(seed, 10) * 10) - 5

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
    sector: generateSectorName(sectorX, sectorY),
    discoveryDate: new Date().toLocaleDateString(),
    dbData: dbAnomaly,
  }
};