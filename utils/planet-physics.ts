export interface PlanetStats {
  mass: number // Earth masses
  radius: number // Earth radii
  density: number // g/cm³
  type: 'terrestrial' | 'gaseous'
}

export function calculatePlanetStats(mass: number, radius: number, typeOverride: 'terrestrial' | 'gaseous' | null = null): PlanetStats {
  const earthDensity = 5.51 // g/cm³
  const density = (mass / Math.pow(radius, 3)) * earthDensity

  let type: 'terrestrial' | 'gaseous'
  if (typeOverride) {
    type = typeOverride
  } else {
    type = mass > 7.5 || radius > 2.0 ? 'gaseous' : 'terrestrial'
  }

  return {
    mass,
    radius,
    density,
    type
  }
}

