import type { ReactNode } from "react"

// Base anomaly type with just essential properties
interface BaseAnomaly {
  id: string
  name: string
  type: "exoplanet" | "sunspot" | "asteroid" | "accretion_disc"
  project: string
  classified?: boolean
  discoveryDate?: string
};

// Extended anomaly with rendering properties
export interface Anomaly extends BaseAnomaly {
  x: number
  y: number
  brightness: number
  size: number
  color: string
  sector: string
  shape: "circle" | "star" | "diamond" | "hexagon" | "triangle" | "oval"
  pulseSpeed: number
  glowIntensity: number
}

export interface Project {
  id: string
  name: string
  description: string
  anomalyType: "exoplanet" | "sunspot" | "asteroid" | "accretion_disc"
  completed: number
  total: number
  icon: ReactNode
  color: string
  bgGradient: string
}

export interface Mission {
  id: string
  title: string
  description: string
  project: string
  reward: string
  difficulty: "easy" | "medium" | "hard"
  completed: boolean
  icon: ReactNode
};

export interface Star {
  x: number
  y: number
  size: number
  opacity: number
  color: string
  twinkleSpeed: number
}

export type ViewMode = "viewport" | "discoveries"

export type DiscoveryPanelPosition = "top" | "bottom" | "hidden"