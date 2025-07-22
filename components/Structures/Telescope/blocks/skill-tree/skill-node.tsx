'use client'

import { CheckCircle, Circle, Lock, Sparkles } from "lucide-react"
import type { Skill, SkillStatus } from "@/types/Structures/telescope-skills"

interface SkillNodeProps {
  skill: Skill
  status: SkillStatus
  progress: number
  onClick: () => void
  isSelected: boolean
};

export function SkillNode({ skill, status, progress, onClick, isSelected }: SkillNodeProps) {
  const getStatusColor = () => {
    switch (status) {
      case "unlocked":
        return "#78cce2"
      case "can-unlock":
        return "#4e7988"
      case "locked":
        return "#78cce2"
      default:
        return "#78cce2"
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case "unlocked":
        return <CheckCircle className="h-6 w-6 text-[#78cce2]" />
      case "can-unlock":
        return <Sparkles className="h-6 w-6 text-[#4e7988]" />
      case "locked":
        return <Lock className="h-6 w-6 text-[#78cce2]" />
      default:
        return <Circle className="h-6 w-6 text-[#78cce2]" />
    }
  }

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
        <div className="absolute inset-0 w-20 h-20">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="40" cy="40" r="38" stroke="#78cce2" strokeWidth="2" fill="none" opacity="0.3" />
            <circle
              cx="40"
              cy="40"
              r="38"
              stroke="#78cce2"
              strokeWidth="2"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 38}`}
              strokeDashoffset={`${2 * Math.PI * 38 * (1 - progress / 100)}`}
              className="transition-all duration-500"
            />
          </svg>
        </div>
      )}

      {/* Main Node */}
      <div
        className={`w-20 h-20 rounded-full border-2 flex items-center justify-center relative transition-all duration-300 ${
          status === "unlocked"
            ? "bg-[#78cce2] border-[#78cce2] shadow-lg shadow-[#78cce2]/50"
            : status === "can-unlock"
              ? "bg-[#4e7988] border-[#4e7988] shadow-md shadow-[#4e7988]/30"
              : "bg-[#005066] border-[#78cce2] opacity-60"
        } ${isSelected ? "ring-4 ring-[#78cce2]/50" : ""}`}
        style={{
          borderColor: getStatusColor(),
        }}
      >
        {getStatusIcon()}

        {/* Sparkle Animation for Unlockable Skills */}
        {status === "can-unlock" && (
          <div className="absolute inset-0 animate-pulse">
            <Sparkles className="absolute top-1 right-1 h-3 w-3 text-[#78cce2] animate-bounce" />
            <Sparkles className="absolute bottom-1 left-1 h-2 w-2 text-[#4e7988] animate-bounce delay-300" />
          </div>
        )}
      </div>

      {/* Skill Name */}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 text-center">
        <div
          className={`text-xs font-mono px-2 py-1 rounded whitespace-nowrap ${
            status === "unlocked"
              ? "text-[#78cce2] bg-[#78cce2]/20"
              : status === "can-unlock"
                ? "text-[#4e7988] bg-[#4e7988]/20"
                : "text-[#78cce2] bg-[#78cce2]/10 opacity-60"
          }`}
        >
          {skill.name.toUpperCase()}
        </div>
        {skill.cost > 0 && (
          <div className="text-xs text-[#78cce2] mt-1 flex items-center justify-center gap-1">
            <Sparkles className="h-3 w-3" />
            {skill.cost}
          </div>
        )}
      </div>
    </div>
  )
};