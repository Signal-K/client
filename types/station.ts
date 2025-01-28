export interface Animal {
  name: string
  icon: string
}

export interface Biome {
  name: string
  color: string
  accentColor: string
  darkColor: string
}

export interface Location {
  coordinates: string
  depth?: string
  altitude?: string
}

export interface Station {
  id: string
  name: string
  icon: string
  biome: Biome
  animals: Animal[]
  built: boolean
  location: Location
}

