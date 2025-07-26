'use client'

import { X } from "lucide-react"
import { Button } from "./button"
import { SkillDetail } from "../Research/SkillTree/skill-detail"
import type { Skill } from "@/types/Reseearch/skill-tree"

interface SkillTreeExpandedPanelOverlayProps {
  skill: Skill
  onClose: () => void
  onUnlockSkill: (skillId: string) => void
  isUnlockable: boolean
}

export function SkillTreeExpandedPanelOverlay({
  skill,
  onClose,
  onUnlockSkill,
  isUnlockable,
}: SkillTreeExpandedPanelOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col p-4 md:p-8 overflow-y-auto">
      <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
        <h2 className="text-2xl font-bold text-foreground">{skill.name} Details</h2>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="w-6 h-6" />
          <span className="sr-only">Close</span>
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <SkillDetail skill={skill} onUnlockSkill={onUnlockSkill} isUnlockable={isUnlockable} />
      </div>
    </div>
  )
};