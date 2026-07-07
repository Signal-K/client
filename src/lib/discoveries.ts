/**
 * Map classification type to user-friendly discovery type
 */
export function getDiscoveryTypeLabel(classificationType: string | null): string {
  switch (classificationType) {
    case 'planet':
      return 'New Exoplanet Discovered'
    case 'telescope-minorPlanet':
      return 'New Asteroid Detected'
    case 'cloud':
      return 'New Cloud Formation on Mars'
    default:
      return 'New Discovery'
  }
}

/**
 * Generate description for discovery based on classification type
 */
export function getDiscoveryDescription(classificationType: string | null, content: string | null): string {  
  switch (classificationType) {
    case 'planet':
      return `Potentially habitable world identified.`
    case 'telescope-minorPlanet':
      return `Near-Earth object cataloged.`
    case 'cloud':
      return `Atmospheric activity monitored.`
    default:
      return ""
  }
}