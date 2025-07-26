'use client'

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle, Lock, FlaskConical } from "lucide-react"

import type { SkillNodeProps } from "@/types/Reseearch/skill-tree"

const PlanetHuntersIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2v20M2 12h20" />
    <circle cx="12" cy="12" r="4" fill="currentColor" />
  </svg>
)

const AsteroidHuntingIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 2l-2 2-2-2" />
    <path d="M10 22l2-2 2 2" />
    <path d="M22 10l-2 2 2 2" />
    <path d="M2 14l2-2-2-2" />
    <circle cx="12" cy="12" r="4" />
  </svg>
)

const PlanetExplorationIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M8 14l4-4 4 4" />
    <path d="M12 18v-8" />
  </svg>
)

const CloudspottingIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 10H7a4 4 0 0 0 0 8h10a4 4 0 0 0 0-8z" />
    <path d="M12 14h.01" />
    <path d="M16 14h.01" />
    <path d="M8 14h.01" />
  </svg>
)

const ActiveAsteroidsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 2l-2 2-2-2" />
    <path d="M10 22l2-2 2 2" />
    <path d="M22 10l-2 2 2 2" />
    <path d="M2 14l2-2-2-2" />
    <circle cx="12" cy="12" r="4" />
    <path d="M16 8l-4 4-4-4" />
    <path d="M8 16l4-4 4 4" />
  </svg>
)

export function SkillNode({ skill, onViewDetails, onUnlock, isUnlockable, isFullTree }: SkillNodeProps) {
  const IconComponent = skill.icon

  const getStatusColor = (status: string) => {
    switch (status) {
      case "unlocked":
        return "text-chart-1"
      case "available":
        return "text-chart-2"
      case "locked":
        return "text-muted-foreground"
      default:
        return "text-foreground"
    }
  }

  const getBorderColor = (status: string) => {
    switch (status) {
      case "unlocked":
        return "border-chart-1/50"
      case "available":
        return "border-chart-2/50"
      case "locked":
        return "border-muted/30"
      default:
        return "border-border"
    }
  }

  const getBgColor = (status: string) => {
    switch (status) {
      case "unlocked":
        return "bg-chart-1/10"
      case "available":
        return "bg-chart-2/10"
      case "locked":
        return "bg-muted/10"
      default:
        return "bg-card"
    }
  }

  return (
    <Card
      className={`relative flex flex-col items-center justify-center p-3 rounded-lg shadow-sm transition-all duration-300 ease-in-out ${getBgColor(skill.status)} ${getBorderColor(skill.status)}`}
    >
      <Button
        variant="ghost"
        className={`flex flex-col items-center gap-2 p-2 h-auto w-full text-center ${getStatusColor(skill.status)} ${skill.status === "locked" ? "cursor-not-allowed" : "hover:bg-muted/20"}`}
        onClick={() => onViewDetails(skill)}
      >
        <div className="relative w-12 h-12 flex items-center justify-center rounded-full bg-background/50 border border-current">
          <IconComponent className="w-7 h-7" />
          {skill.status === "unlocked" && (
            <CheckCircle className="absolute -top-1 -right-1 w-5 h-5 text-chart-1 bg-card rounded-full" />
          )}
          {skill.status === "available" && (
            <FlaskConical className="absolute -top-1 -right-1 w-5 h-5 text-chart-2 bg-card rounded-full" />
          )}
          {skill.status === "locked" && (
            <Lock className="absolute -top-1 -right-1 w-5 h-5 text-muted-foreground bg-card rounded-full" />
          )}
        </div>
        <span className="text-sm font-semibold text-foreground">{skill.name}</span>
        {isFullTree && <span className={`text-xs capitalize ${getStatusColor(skill.status)}`}>{skill.status}</span>}
      </Button>
      {skill.status === "available" && isUnlockable && (
        <Button
          variant="secondary"
          size="sm"
          className="mt-2 w-full bg-chart-2 hover:bg-chart-2/90 text-primary-foreground"
          onClick={() => onUnlock(skill.id)}
        >
          Unlock
        </Button>
      )}
      {skill.status === "locked" && isFullTree && skill.prerequisites.length > 0 && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-lg flex items-center justify-center p-2 text-center text-xs text-muted-foreground">
          Requires: {skill.prerequisites.map((p) => (p.type === "skill" ? p.value : `${p.value}`)).join(", ")}
        </div>
      )}
    </Card>
  )
}

// Export icons for use in skill data
export const SkillIcons = {
  PlanetHunters: PlanetHuntersIcon,
  AsteroidHunting: AsteroidHuntingIcon,
  PlanetExploration: PlanetExplorationIcon,
  Cloudspotting: CloudspottingIcon,
  ActiveAsteroids: ActiveAsteroidsIcon,
};