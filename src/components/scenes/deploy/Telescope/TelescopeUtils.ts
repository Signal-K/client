import type { Anomaly, Star } from "@/types/Structures/telescope"

export interface DatabaseAnomaly {
  id: number
  content: string | null
  anomalytype: string | null
  avatar_url: string | null
  created_at: string
  configuration: any
  type?: string
  parentAnomaly: number | null
  anomalySet: string | null
}

type LocalAnomaly = Anomaly & { dbData: DatabaseAnomaly }

export function seededRandom1(seed: number, salt: number = 0) {
  const x = Math.sin(seed + salt) * 10000
  return x - Math.floor(x)
}

export function generateAnomalyFromDBFactory(deploymentType: "stellar" | "planetary" | null) {
  return (dbAnomaly: DatabaseAnomaly, sectorX: number, sectorY: number): LocalAnomaly => {
    const seed = dbAnomaly.id + sectorX * 1000 + sectorY

    // Determine type based on anomaly set
    let type: "planet" | "asteroid" | "sunspot" = "planet"
    let color = "#78cce2"
    let shape: "circle" | "triangle" | "star" = "circle"
    let project = "planet-hunters"

    if (dbAnomaly.anomalySet === "telescope-minorPlanet") {
      type = "asteroid"
      color = "#f2c572"
      shape = "triangle"
      project = "daily-minor-planet"
    } else if (dbAnomaly.anomalySet === "diskDetective") {
      type = "sunspot"
      color = "#ff6b6b"
      shape = "star"
      project = "disk-detective"
    } else if (dbAnomaly.anomalySet === "superwasp-variable" || dbAnomaly.anomalySet === "telescope-superwasp-variable") {
      type = "sunspot"
      color = "#ff9966"
      shape = "star"
      project = "superwasp-variable"
    } else if (dbAnomaly.anomalySet === "telescope-tess") {
      project = "planet-hunters"
    } else if (dbAnomaly.anomalySet === "active-asteroids") {
      type = "asteroid"
      color = "#f2c572"
      shape = "triangle"
      project = "active-asteroids"
    }

    return {
      id: `db-${dbAnomaly.id}`,
      name: dbAnomaly.content || `${deploymentType === "stellar" ? "DSK" : "TESS"}-${String(dbAnomaly.id).padStart(3, "0")}`,
      x: seededRandom1(seed, 1) * 80 + 10,
      y: seededRandom1(seed, 2) * 80 + 10,
      brightness: seededRandom1(seed, 3) * 0.7 + 0.5,
      size: seededRandom1(seed, 4) * 0.8 + 0.6,
      pulseSpeed: seededRandom1(seed, 5) * 2 + 1,
      glowIntensity: seededRandom1(seed, 6) * 0.5 + 0.3,
      color,
      shape,
      sector: `${sectorX},${sectorY}`,
      discoveryDate: new Date().toLocaleDateString(),
      type,
      project,
      dbData: dbAnomaly,
    }
  }
}
