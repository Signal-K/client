export interface PlanetStats {
  mass: number // Earth masses
  radius: number // Earth radii
  density: number // g/cm³
  type: "terrestrial" | "gaseous"
  temperature: number // Kelvin
  orbitalPeriod: number // Earth days
  atmosphereStrength: number // 0 to 1
  cloudCount: number // 0 to 100
  waterLevel: number // 0 to 1
  surfaceRoughness: number // 0 to 1
}

export interface LiquidInfo {
  type: "water" | "methane" | "nitrogen" | "none"
  color: string
  temperatureRange: string
}

export function calculatePlanetStats(
  mass: number,
  radius: number,
  temperature = 288, // Default Earth-like temperature
  orbitalPeriod = 365, // Default Earth-like orbital period
  typeOverride: "terrestrial" | "gaseous" | null = null,
  atmosphereStrength = 0.5,
  cloudCount = 50,
  waterLevel = 0.5,
  surfaceRoughness = 0.5,
  density?: number,
): PlanetStats {
  const earthDensity = 5.51 // g/cm³
  const calculatedDensity = density || (mass / Math.pow(radius, 3)) * earthDensity

  let type: "terrestrial" | "gaseous"
  if (typeOverride) {
    type = typeOverride
  } else {
    type = mass > 7.5 || radius > 2.0 ? "gaseous" : "terrestrial"
  }

  return {
    mass,
    radius,
    density: calculatedDensity,
    type,
    temperature,
    orbitalPeriod,
    atmosphereStrength,
    cloudCount,
    waterLevel,
    surfaceRoughness,
  }
}

export function determineLiquidType(temperature: number): LiquidInfo {
  if (temperature >= 273 && temperature <= 373) {
    return {
      type: "water",
      color: "#1E4D6B",
      temperatureRange: "273K - 373K",
    }
  } else if (temperature >= 91 && temperature <= 112) {
    return {
      type: "methane",
      color: "#FFD700",
      temperatureRange: "91K - 112K",
    }
  } else if (temperature >= 195 && temperature <= 240) {
    return {
      type: "nitrogen",
      color: "#90EE90",
      temperatureRange: "195K - 240K",
    }
  }
  return {
    type: "none",
    color: "#8B4513",
    temperatureRange: "N/A",
  }
}

