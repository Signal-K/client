import type React from "react"

interface BasePanelProps {
  onViewDetails: () => void
  isExpanded?: boolean
}

export type SkillStatus = "locked" | "available" | "unlocked"

export interface Skill {
  id: string
  name: string
  description: string
  status: SkillStatus
  prerequisites: { type: "skill" | "progress"; value: string | number }[] // e.g., { type: "skill", value: "planet-hunters" } or { type: "progress", value: "4 planets classified" }
  unlockCost?: number // Optional cost to unlock
  icon: React.ElementType // Custom SVG icon component
  details?: string[] // Additional bullet points for skill details
}

export interface SkillCategory {
  id: string
  name: string
  skills: Skill[]
}

export interface SkillTreeProps extends BasePanelProps {
  skillTreeData: SkillCategory[]
  classifiedPlanets: number
  discoveredAsteroids: number
  onUnlockSkill: (skillId: string) => void
  onViewSkillDetails: (skill: Skill) => void
  isFullTree?: boolean // Indicates if it's the full tree view or a summary
}

export interface SkillNodeProps {
  skill: Skill
  onViewDetails: (skill: Skill) => void
  onUnlock: (skillId: string) => void
  isUnlockable: boolean
  isFullTree?: boolean
}

export interface SkillDetailProps {
  skill: Skill
  onUnlockSkill: (skillId: string) => void
  isUnlockable: boolean
};