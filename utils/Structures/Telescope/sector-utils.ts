import type { Anomaly, Star } from "@/types/Structures/telescope"

// Generate sector names
export const generateSectorName = (x: number, y: number): string => {
  const sectors = [
    "Alpha",
    "Beta",
    "Gamma",
    "Delta",
    "Epsilon",
    "Zeta",
    "Eta",
    "Theta",
    "Iota",
    "Kappa",
    "Lambda",
    "Mu",
    "Nu",
    "Xi",
    "Omicron",
    "Pi",
  ]
  const regions = ["Nebula", "Cluster", "Field", "Void", "Stream", "Cloud", "Ring", "Arm"]

  const sectorIndex = Math.abs(Math.floor(x / 1000) + Math.floor(y / 1000)) % sectors.length
  const regionIndex = Math.abs(Math.floor(x / 500) + Math.floor(y / 500)) % regions.length

  return `${sectors[sectorIndex]} ${regions[regionIndex]}`
}

// Generate random number based on seed
export const seededRandom = (seed: number, index: number): number => {
  const x = Math.sin(seed + index) * 10000
  return x - Math.floor(x)
}

// Generate colorful background stars for current sector
export const generateStars = (sectorX: number, sectorY: number): Star[] => {
  const backgroundStars: Star[] = []
  const seed = Math.abs(sectorX * 1000 + sectorY)

  // Star colors for variety
  const starColors = [
    "#FFE4B5", // Moccasin (warm white)
    "#87CEEB", // Sky blue
    "#FFB6C1", // Light pink
    "#98FB98", // Pale green
    "#DDA0DD", // Plum
    "#F0E68C", // Khaki
    "#FFA07A", // Light salmon
    "#20B2AA", // Light sea green
    "#FFFFFF", // Pure white
    "#FFFACD", // Lemon chiffon
  ]

  for (let i = 0; i < 400; i++) {
    const x = seededRandom(seed, i)
    const y = seededRandom(seed, i + 1000)
    const size = seededRandom(seed, i + 2000)
    const opacity = seededRandom(seed, i + 3000)
    const colorIndex = Math.floor(seededRandom(seed, i + 4000) * starColors.length)
    const twinkleSpeed = seededRandom(seed, i + 5000)

    backgroundStars.push({
      x: x * 100,
      y: y * 100,
      size: size * 3 + 0.5,
      opacity: opacity * 0.9 + 0.3,
      color: starColors[colorIndex],
      twinkleSpeed: twinkleSpeed * 2 + 1,
    })
  }
  return backgroundStars
}

// Filter anomalies by current sector
export const filterAnomaliesBySector = (anomalies: Anomaly[], sectorX: number, sectorY: number): Anomaly[] => {
  const sectorName = generateSectorName(sectorX, sectorY)
  return anomalies.filter((anomaly) => anomaly.sector === sectorName)
};