import type { Anomaly, BaseAnomaly, Star } from "@/types/Structures/telescope"
import { baseAnomalies } from "@/data/missions"

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

// Generate anomalies for a specific sector
export const generateSectorAnomalies = (sectorX: number, sectorY: number): Anomaly[] => {
  const anomalies: Anomaly[] = []
  const sectorName = generateSectorName(sectorX, sectorY)
  const seed = Math.abs(sectorX * 1000 + sectorY)

  // Get base anomalies from all projects
  const allBaseAnomalies: BaseAnomaly[] = Object.values(baseAnomalies)
    .flat()
    .map(anomaly => ({
      ...anomaly,
      type: anomaly.type as BaseAnomaly["type"],
    }))

  // Shuffle and select a subset based on the sector
  const shuffledAnomalies = [...allBaseAnomalies].sort(() => seededRandom(seed, 0) - 0.5)
  const selectedAnomalies = shuffledAnomalies.slice(0, 15 + Math.floor(seededRandom(seed, 1) * 10))

  // Shape options for different anomaly types
  const shapes = {
    exoplanet: ["circle", "star", "hexagon"] as const,
    sunspot: ["circle", "oval", "star"] as const,
    asteroid: ["diamond", "triangle", "hexagon"] as const,
    accretion_disc: ["oval", "circle", "hexagon"] as const,
  }

  // Enhanced with visual properties
  selectedAnomalies.forEach((baseAnomaly, index) => {
    const randIndex = index * 100

    // Generate positions within viewport
    const x = seededRandom(seed, randIndex) * 80 + 10 // 10-90% of viewport
    const y = seededRandom(seed, randIndex + 1000) * 80 + 10

    // Some anomalies are already classified
    const classified = seededRandom(seed, randIndex + 2000) > 0.8

    // Enhanced visual properties
    const brightness = seededRandom(seed, randIndex + 3000) * 0.7 + 0.5
    const size = seededRandom(seed, randIndex + 4000) * 0.8 + 0.6
    const pulseSpeed = seededRandom(seed, randIndex + 5000) * 2 + 1
    const glowIntensity = seededRandom(seed, randIndex + 6000) * 0.5 + 0.3

    // Select shape based on anomaly type
    const availableShapes = shapes[baseAnomaly.type as keyof typeof shapes]
    const shapeIndex = Math.floor(seededRandom(seed, randIndex + 7000) * availableShapes.length)
    const shape = availableShapes[shapeIndex]

    // Enhanced color palettes for each type
    let color
    if (baseAnomaly.type === "exoplanet") {
      // Exoplanets: vibrant blues, purples, and golds
      const colors = ["#4FC3F7", "#AB47BC", "#FFD54F", "#26C6DA", "#7E57C2", "#FFCA28", "#29B6F6", "#BA68C8"]
      const colorIndex = Math.floor(seededRandom(seed, randIndex + 8000) * colors.length)
      color = colors[colorIndex]
    } else if (baseAnomaly.type === "sunspot") {
      // Sunspots: fiery oranges, reds, and yellows
      const colors = ["#FF7043", "#F44336", "#FF9800", "#FF5722", "#E91E63", "#FF6F00", "#D84315", "#BF360C"]
      const colorIndex = Math.floor(seededRandom(seed, randIndex + 8000) * colors.length)
      color = colors[colorIndex]
    } else if (baseAnomaly.type === "asteroid") {
      // Asteroids: cool purples, teals, and silvers
      const colors = ["#9C27B0", "#00BCD4", "#607D8B", "#673AB7", "#009688", "#795548", "#8BC34A", "#3F51B5"]
      const colorIndex = Math.floor(seededRandom(seed, randIndex + 8000) * colors.length)
      color = colors[colorIndex]
    } else {
      // Accretion discs: cosmic cyans, magentas, and greens
      const colors = ["#00E676", "#E91E63", "#00BCD4", "#8BC34A", "#FF4081", "#1DE9B6", "#536DFE", "#69F0AE"]
      const colorIndex = Math.floor(seededRandom(seed, randIndex + 8000) * colors.length)
      color = colors[colorIndex]
    }

    anomalies.push({
      ...baseAnomaly,
      x,
      y,
      classified,
      discoveryDate: classified
        ? new Date(Date.now() - seededRandom(seed, randIndex + 9000) * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
        : undefined,
      brightness,
      size,
      color,
      sector: sectorName,
      shape,
      pulseSpeed,
      glowIntensity,
    } as Anomaly)
  })

  return anomalies
}
