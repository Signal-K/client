import type React from "react"

export interface Skill {
  id: string
  name: string
  description: string
  icon?: React.ReactNode
  unlocked?: boolean
  completed?: boolean
  progress?: number
  maxProgress?: number
  cost: number
  position: { x: number; y: number }
  prerequisites: string[]
  requirementType: "none" | "classification" | "locked"
  requiredCount: number
  classificationType: string | null
  rewards: string[]
  category:
    | "planet"
    | "asteroid"
    | "general"
    | "core"
    | "analysis"
    | "exploration"
    | "visualization"
    | "advanced"
    | "locked"
  level?: number
  xpReward?: number
  requirements?: SkillRequirement[]
};

export interface SkillRequirement {
  type: "classification" | "achievement" | "level"
  classificationtype?: string
  count: number
  description: string
}

export type SkillStatus = "unlocked" | "can-unlock" | "locked"

export interface UserProgress {
  unlockedSkills: string[]
  stardustBalance: number
  classifications: Record<string, number>
};