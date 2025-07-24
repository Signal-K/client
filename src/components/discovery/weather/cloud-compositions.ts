import { CloudComposition } from '@/types/Generators/JVH/atmosphere';

export type CloudPattern = 'featureless' | 'turbulent' | 'vortex' | 'bands';

export const cloudCompositions: Record<string, CloudComposition> = {
  ammonia: {
    name: 'Ammonia Clouds',
    colorRanges: {
      shallow: ['rgba(255, 255, 255, 0.8)', 'rgba(220, 230, 255, 0.7)'],
      medium: ['rgba(200, 210, 255, 0.7)', 'rgba(180, 190, 240, 0.6)'],
      deep: ['rgba(160, 170, 220, 0.6)', 'rgba(140, 150, 200, 0.5)']
    },
    description: 'White to pale blue, visible in calm regions'
  },
  ammoniumHydrosulfide: {
    name: 'Ammonium Hydrosulfide',
    colorRanges: {
      shallow: ['rgba(205, 133, 63, 0.6)', 'rgba(210, 140, 70, 0.5)'],
      medium: ['rgba(180, 100, 40, 0.5)', 'rgba(160, 80, 30, 0.4)'],
      deep: ['rgba(140, 60, 20, 0.4)', 'rgba(120, 40, 10, 0.3)']
    },
    description: 'Brownish-orange, present in stormy areas'
  },
  water: {
    name: 'Water Clouds',
    colorRanges: {
      shallow: ['rgba(135, 206, 235, 0.5)', 'rgba(120, 190, 220, 0.4)'],
      medium: ['rgba(100, 170, 200, 0.4)', 'rgba(80, 150, 180, 0.3)'],
      deep: ['rgba(60, 130, 160, 0.3)', 'rgba(40, 110, 140, 0.2)']
    },
    description: 'Blue tinted, visible in major storms'
  }
}

export function getColorsByAltitude(altitude: number, pattern: CloudPattern): string[] {
  const depthLevel = altitude > 300 ? 'deep' : altitude > 100 ? 'medium' : 'shallow'
  
  switch (pattern) {
    case 'featureless':
      return cloudCompositions.ammonia.colorRanges[depthLevel]
    case 'turbulent':
      return [
        ...cloudCompositions.ammonia.colorRanges[depthLevel],
        ...cloudCompositions.ammoniumHydrosulfide.colorRanges[depthLevel]
      ]
    case 'vortex':
      return [
        ...cloudCompositions.ammoniumHydrosulfide.colorRanges[depthLevel],
        ...cloudCompositions.water.colorRanges[depthLevel]
      ]
    case 'bands':
      return [
        ...cloudCompositions.ammonia.colorRanges[depthLevel],
        ...cloudCompositions.ammoniumHydrosulfide.colorRanges[depthLevel],
        ...cloudCompositions.water.colorRanges[depthLevel]
      ]
    default:
      return cloudCompositions.ammonia.colorRanges[depthLevel]
  }
}

