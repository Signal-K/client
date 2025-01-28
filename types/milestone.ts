export interface Milestone {
  id: string
  title: string
  description: string
  current: number
  target: number
  type: "animals" | "stations" | "biomes"
}

