import type { ReactNode } from "react";

// Base anomaly type for weather phenomena
export interface BaseAnomaly {
  id: string
  name: string
  type: "storm" | "cloud_formation" | "atmospheric_phenomenon" | "surface_weather" | "geological_weather"
  project: string
  classified?: boolean
  discoveryDate?: string
}

// Extended anomaly with rendering properties
export interface WeatherAnomaly extends BaseAnomaly {
  x: number
  y: number
  intensity: number
  size: number
  color: string
  region: string
  shape: "circle" | "spiral" | "linear" | "irregular" | "oval" | "hexagon"
  animationSpeed: number
  opacity: number
  planet: string
}

export interface WeatherProject {
  id: string
  name: string
  description: string
  anomalyType: "storm" | "cloud_formation" | "atmospheric_phenomenon" | "surface_weather" | "geological_weather"
  completed: number
  total: number
  icon: ReactNode
  color: string
  bgGradient: string
}

export interface WeatherMission {
  id: string
  title: string
  description: string
  project: string
  reward: string
  difficulty: "easy" | "medium" | "hard"
  completed: boolean
  icon: ReactNode
}

export interface Planet {
  id: string
  name: string
  x: number
  y: number
  size: number
  color: string
  atmosphere: string
  temperature: string
  anomalyCount: number
  description: string
  weatherSystems: string[]
}

export interface AtmosphericLayer {
  x: number
  y: number
  size: number
  opacity: number
  color: string
  driftSpeed: number
  type: "cloud" | "dust" | "vapor" | "particle"
}

export type ViewMode = "planets" | "surface" | "discoveries"

export type DiscoveryPanelPosition = "top" | "bottom" | "hidden";