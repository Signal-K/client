"use client"

import { Lock, Sparkles } from "lucide-react"
import { getSkillIcon } from "./skill-icons"
import type { SkillStatus, Skill } from "@/types/Structures/telescope-skills"

interface SkillNodeProps {
  skill: Skill
  status: SkillStatus
  progress: number
  onClick: () => void
  isSelected: boolean
}

export function SkillNode({ skill, status, progress, onClick, isSelected }: SkillNodeProps) {
  const getNodeStyle = () => {
    switch (status) {
      case "unlocked":
        return {
          backgroundColor: "#78cce2",
          borderColor: "#78cce2",
          color: "#002439",
          boxShadow: "0 0 20px rgba(120, 204, 226, 0.5)",
        }
      case "can-unlock":
        return {
          backgroundColor: "#4e7988",
          borderColor: "#4e7988",
          color: "#e4eff0",
          boxShadow: "0 0 15px rgba(78, 121, 136, 0.3)",
        }
      case "locked":
        return {
          backgroundColor: "#005066",
          borderColor: "#78cce2",
          color: "#78cce2",
          opacity: 0.6,
        }
      default:
        return {
          backgroundColor: "#005066",
          borderColor: "#78cce2",
          color: "#78cce2",
        }
    }
  }

  const nodeStyle = getNodeStyle()

  return (
    <div
      className={`absolute cursor-pointer transition-all duration-300 ${
        isSelected ? "scale-110 z-10" : "hover:scale-105"
      }`}
      style={{
        left: skill.position.x,
        top: skill.position.y,
      }}
      onClick={onClick}
    >
      {/* Progress Ring */}
      {status === "can-unlock" && progress > 0 && (
        <div className="absolute inset-0 w-16 h-16">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="32" cy="32" r="30" stroke="#78cce2" strokeWidth="2" fill="none" opacity="0.3" />
            <circle
              cx="32"
              cy="32"
              r="30"
              stroke="#78cce2"
              strokeWidth="2"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 30}`}
              strokeDashoffset={`${2 * Math.PI * 30 * (1 - progress / 100)}`}
              className="transition-all duration-500"
            />
          </svg>
        </div>
      )}

      {/* Main Node */}
      <div
        className={`w-16 h-16 rounded-full border-2 flex items-center justify-center relative transition-all duration-300 ${
          isSelected ? "ring-4" : ""
        }`}
        style={{
          ...nodeStyle,
        }}
      >
        {status === "unlocked" ? (
          getSkillIcon(skill.id)
        ) : status === "can-unlock" ? (
          <Sparkles className="h-6 w-6" />
        ) : (
          <Lock className="h-6 w-6" />
        )}

        {/* Sparkle Animation for Unlockable Skills */}
        {status === "can-unlock" && (
          <div className="absolute inset-0 animate-pulse">
            <Sparkles className="absolute top-0 right-0 h-3 w-3 animate-bounce" style={{ color: "#78cce2" }} />
          </div>
        )}
      </div>

      {/* Skill Name - Simplified */}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 text-center">
        <div
          className="text-xs font-mono px-2 py-1 rounded whitespace-nowrap max-w-20 truncate"
          style={{
            color: status === "unlocked" ? "#78cce2" : status === "can-unlock" ? "#4e7988" : "#78cce2",
            backgroundColor:
              status === "unlocked"
                ? "rgba(120, 204, 226, 0.2)"
                : status === "can-unlock"
                  ? "rgba(78, 121, 136, 0.2)"
                  : "rgba(120, 204, 226, 0.1)",
            opacity: status === "locked" ? 0.6 : 1,
          }}
        >
          {skill.name.split(" ")[0].toUpperCase()}
        </div>
        {skill.cost > 0 && (
          <div className="text-xs mt-1 flex items-center justify-center gap-1" style={{ color: "#78cce2" }}>
            <Sparkles className="h-2 w-2" />
            {skill.cost}
          </div>
        )}
      </div>
    </div>
  )
};