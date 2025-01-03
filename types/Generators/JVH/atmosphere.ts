export type CloudPattern = 'featureless' | 'turbulent' | 'vortex' | 'bands'

export interface CloudComposition {
  name: string
  colorRanges: {
    shallow: string[]
    medium: string[]
    deep: string[]
  }
  description: string
}

export interface AtmosphericLayer {
  name: string
  minAltitude: number
  maxAltitude: number
  primaryComposition: CloudComposition[]
  temperature: string
  pressure: string
}

export interface CloudConfiguration {
  patterns: CloudPattern[]
  altitude: number
  timestamp: string
  classificationOptions?: {
    [key: string]: {
      [key: string]: boolean
    }
  }
}