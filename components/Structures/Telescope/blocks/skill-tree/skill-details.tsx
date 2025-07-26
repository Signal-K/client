"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { X, Sparkles, Lock, CheckCircle, AlertCircle } from "lucide-react"
import { getSkillIcon } from "./skill-icons"
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
          icon: <CheckCircle className="h-4 w-4" style={{ color: "#78cce2" }} />,
          text: "UNLOCKED",
          style: { color: "#78cce2", backgroundColor: "rgba(120, 204, 226, 0.2)" },
        }
      case "can-unlock":
        return {
          icon: <Sparkles className="h-4 w-4" style={{ color: "#4e7988" }} />,
          text: "READY",
          style: { color: "#4e7988", backgroundColor: "rgba(78, 121, 136, 0.2)" },
        }
      case "locked":
        return {
          icon: <Lock className="h-4 w-4" style={{ color: "#78cce2" }} />,
          text: "LOCKED",
          style: { color: "#78cce2", backgroundColor: "rgba(120, 204, 226, 0.1)" },
        }
      default:
        return {
          icon: <AlertCircle className="h-4 w-4" style={{ color: "#78cce2" }} />,
          text: "UNKNOWN",
          style: { color: "#78cce2", backgroundColor: "rgba(120, 204, 226, 0.1)" },
        }
    }
  }

  const statusInfo = getStatusInfo()
  const canAfford = userProgress.stardustBalance >= skill.cost
  const canUnlock = status === "can-unlock" && canAfford

  const getRequirementText = () => {
    if (skill.requirementType === "classification" && skill.classificationType) {
      const userCount = userProgress.classifications[skill.classificationType] || 0
      return `${userCount}/${skill.requiredCount} classifications`
    }
    return "No requirements"
  }

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: "#005066" }}>
      {/* Header */}
      <div
        className="p-3 border-b flex items-center justify-between"
        style={{
          borderColor: "rgba(120, 204, 226, 0.3)",
          backgroundColor: "rgba(0, 80, 102, 0.95)",
        }}
      >
        <h2 className="font-bold text-sm font-mono" style={{ color: "#e4eff0" }}>
          SKILL DETAILS
        </h2>
        <Button variant="ghost" size="sm" onClick={onClose} className="p-1 h-auto" style={{ color: "#78cce2" }}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Skill Info */}
        <Card
          className="border"
          style={{
            backgroundColor: "rgba(0, 36, 57, 0.8)",
            borderColor: "rgba(120, 204, 226, 0.3)",
          }}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 mb-2">
              <div style={{ color: "#78cce2" }}>{getSkillIcon(skill.id)}</div>
              <CardTitle className="text-sm font-mono" style={{ color: "#e4eff0" }}>
                {skill.name.toUpperCase()}
              </CardTitle>
            </div>
            <Badge className="font-mono text-xs w-fit" style={statusInfo.style}>
              {statusInfo.icon}
              <span className="ml-1">{statusInfo.text}</span>
            </Badge>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs mb-3" style={{ color: "#78cce2" }}>
              {skill.description}
            </p>

            {/* Cost */}
            {skill.cost > 0 && (
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-3 w-3" style={{ color: "#78cce2" }} />
                <span className="text-xs font-mono" style={{ color: "#e4eff0" }}>
                  {skill.cost} Stardust
                </span>
                {!canAfford && status === "can-unlock" && (
                  <Badge
                    className="text-xs ml-auto"
                    style={{ backgroundColor: "rgba(191, 97, 106, 0.2)", color: "#BF616A" }}
                  >
                    INSUFFICIENT
                  </Badge>
                )}
              </div>
            )}

            {/* Requirements - Simplified */}
            {skill.requirementType !== "none" && (
              <div className="space-y-2">
                <div className="text-xs font-mono" style={{ color: "#e4eff0" }}>
                  Requirements:
                </div>

                {/* Prerequisites */}
                {skill.prerequisites.length > 0 && (
                  <div className="space-y-1">
                    {skill.prerequisites.slice(0, 2).map((prereqId) => {
                      const isUnlocked = userProgress.unlockedSkills.includes(prereqId)
                      return (
                        <div key={prereqId} className="flex items-center gap-2 text-xs">
                          {isUnlocked ? (
                            <CheckCircle className="h-3 w-3" style={{ color: "#78cce2" }} />
                          ) : (
                            <Lock className="h-3 w-3" style={{ color: "#78cce2" }} />
                          )}
                          <span style={{ color: isUnlocked ? "#78cce2" : "rgba(120, 204, 226, 0.6)" }}>
                            {prereqId.split("-")[0].toUpperCase()}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Classification Requirements */}
                {skill.requirementType === "classification" && (
                  <div className="space-y-1">
                    <div className="text-xs" style={{ color: "#78cce2" }}>
                      {getRequirementText()}
                    </div>
                    {progress > 0 && (
                      <Progress value={progress} className="h-1" style={{ backgroundColor: "#005066" }} />
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rewards - Simplified */}
        <Card
          className="border"
          style={{
            backgroundColor: "rgba(0, 36, 57, 0.8)",
            borderColor: "rgba(120, 204, 226, 0.3)",
          }}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-mono" style={{ color: "#e4eff0" }}>
              REWARDS
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-1">
              {skill.rewards.slice(0, 2).map((reward, index) => (
                <li key={index} className="flex items-start gap-2 text-xs" style={{ color: "#78cce2" }}>
                  <div className="w-1 h-1 rounded-full mt-1 flex-shrink-0" style={{ backgroundColor: "#78cce2" }} />
                  <span className="truncate">{reward}</span>
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
            className="w-full font-mono text-xs py-2"
            style={{
              backgroundColor: canUnlock ? "#78cce2" : "rgba(78, 121, 136, 0.5)",
              color: canUnlock ? "#002439" : "rgba(120, 204, 226, 0.5)",
              border: "none",
            }}
          >
            <Sparkles className="h-3 w-3 mr-1" />
            {canUnlock ? "UNLOCK" : "INSUFFICIENT STARDUST"}
          </Button>
        )}

        {status === "unlocked" && (
          <div className="text-center py-2">
            <Badge
              className="font-mono text-xs"
              style={{ backgroundColor: "rgba(120, 204, 226, 0.2)", color: "#78cce2" }}
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              UNLOCKED
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
};