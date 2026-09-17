import type { ElementType } from "react"

export interface Mission {
  name: string
  icon: ElementType
  description: string
  identifier: string
  techId: number
  tutorialMission: number
  activeStructure: number
  sourceLink?: string
  status?: "active" | "maintenance" | "offline"
  difficulty?: number
  estimatedTime?: string
}

export interface Structure {
  name: string
  icon: ElementType
  description: string
  bgGradient: string
  iconColor: string
  inventoryItemId: number
  specialty: string
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  status?: "operational" | "limited" | "offline"
  powerLevel?: number
  systemVersion?: string
}

export interface Project {
  name: string
  description: string
  identifier: string
  sourceLink: string
  icon: ElementType
  techId: number
  tutorialMission: number
  activeStructure: number
  status?: "active" | "maintenance" | "offline"
  difficulty?: number
  estimatedTime?: string
}