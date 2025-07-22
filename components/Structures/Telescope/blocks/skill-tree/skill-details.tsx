'use client'

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle, X, Lock, Sparkles } from "lucide-react"
import type { Skill, SkillStatus, UserProgress } from "@/types/Structures/telescope-skills"

interface SkillDetailsProps {
  skill: Skill
  status: SkillStatus
  progress: number
  userProgress: UserProgress
  onUnlock: () => void
  onClose: () => void
};

export function SkillDetails({ skill, status, progress, userProgress, onUnlock, onClose }: SkillDetailsProps) {
  const getStatusInfo = () => {
    switch (status) {
      case "unlocked":
        return {
          icon: <CheckCircle className="h-5 w-5 text-[#78cce2]" />,
          text: "UNLOCKED",
          color: "text-[#78cce2]",
          bgColor: "bg-[#78cce2]/20",
        }
      case "can-unlock":
        return {
          icon: <Sparkles className="h-5 w-5 text-[#4e7988]" />,
          text: "READY TO UNLOCK",
          color: "text-[#4e7988]",
          bgColor: "bg-[#4e7988]/20",
        }
      case "locked":
        return {
          icon: <Lock className="h-5 w-5 text-[#78cce2]" />,
          text: "LOCKED",
          color: "text-[#78cce2]",
          bgColor: "bg-[#78cce2]/10",
        }
      default:
        return {
          icon: <AlertCircle className="h-5 w-5 text-[#78cce2]" />,
          text: "UNKNOWN",
          color: "text-[#78cce2]",
          bgColor: "bg-[#78cce2]/10",
        }
    }
  }

  const statusInfo = getStatusInfo()
  const canAfford = userProgress.stardustBalance >= skill.cost
  const canUnlock = status === "can-unlock" && canAfford

  const getRequirementText = () => {
    if (skill.requirementType === "classification" && skill.classificationType) {
      const userCount = userProgress.classifications[skill.classificationType] || 0
      return `${userCount}/${skill.requiredCount} ${skill.classificationType} classifications`
    }
    return "No requirements"
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[#78cce2]/30 flex items-center justify-between">
        <h2 className="text-[#e4eff0] font-bold text-lg font-mono">SKILL DETAILS</h2>
        <Button variant="ghost" size="sm" onClick={onClose} className="text-[#78cce2] hover:bg-[#4e7988]/50">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Skill Info */}
        <Card className="bg-[#002439]/80 border border-[#78cce2]/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[#e4eff0] text-lg font-mono">{skill.name.toUpperCase()}</CardTitle>
              <Badge className={`${statusInfo.bgColor} ${statusInfo.color} font-mono`}>
                {statusInfo.icon}
                <span className="ml-1">{statusInfo.text}</span>
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-[#78cce2] text-sm mb-4">{skill.description}</p>

            {/* Cost */}
            {skill.cost > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-4 w-4 text-[#78cce2]" />
                <span className="text-[#e4eff0] font-mono">Cost: {skill.cost} Stardust</span>
                {!canAfford && status === "can-unlock" && (
                  <Badge className="bg-red-500/20 text-red-400 text-xs">INSUFFICIENT FUNDS</Badge>
                )}
              </div>
            )}

            {/* Requirements */}
            {skill.requirementType !== "none" && (
              <div className="space-y-2">
                <div className="text-[#e4eff0] font-mono text-sm">Requirements:</div>

                {/* Prerequisites */}
                {skill.prerequisites.length > 0 && (
                  <div className="space-y-1">
                    {skill.prerequisites.map((prereqId) => {
                      const isUnlocked = userProgress.unlockedSkills.includes(prereqId)
                      return (
                        <div key={prereqId} className="flex items-center gap-2 text-xs">
                          {isUnlocked ? (
                            <CheckCircle className="h-3 w-3 text-[#78cce2]" />
                          ) : (
                            <Lock className="h-3 w-3 text-[#78cce2]" />
                          )}
                          <span className={isUnlocked ? "text-[#78cce2]" : "text-[#78cce2]/60"}>
                            {prereqId.replace("-", " ").toUpperCase()}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Classification Requirements */}
                {skill.requirementType === "classification" && (
                  <div className="space-y-2">
                    <div className="text-xs text-[#78cce2]">{getRequirementText()}</div>
                    {progress > 0 && <Progress value={progress} className="h-2 bg-[#005066]" />}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rewards */}
        <Card className="bg-[#002439]/80 border border-[#78cce2]/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-[#e4eff0] text-sm font-mono">REWARDS</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {skill.rewards.map((reward, index) => (
                <li key={index} className="flex items-start gap-2 text-xs text-[#78cce2]">
                  <div className="w-1 h-1 bg-[#78cce2] rounded-full mt-2 flex-shrink-0" />
                  <span>{reward}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Action Button */}
        {status === "can-unlock" && (
          <Button
            onClick={onUnlock}
            disabled={!canUnlock}
            className={`w-full font-mono ${
              canUnlock
                ? "bg-[#78cce2] text-[#002439] hover:bg-[#e4eff0]"
                : "bg-[#4e7988]/50 text-[#78cce2]/50 cursor-not-allowed"
            }`}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {canUnlock ? "UNLOCK SKILL" : "INSUFFICIENT STARDUST"}
          </Button>
        )}

        {status === "unlocked" && (
          <div className="text-center py-4">
            <Badge className="bg-[#78cce2]/20 text-[#78cce2] font-mono">
              <CheckCircle className="h-4 w-4 mr-1" />
              SKILL UNLOCKED
            </Badge>
          </div>
        )}
      </div>
    </div>
  )
};