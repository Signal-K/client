"use client"

import { useState, useEffect } from "react"
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react"
import { Button } from "@/src/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { SkillNode } from "./skill-node"
import { SkillDetails } from "./skill-details"
import { SkillLegend } from "./skill-legend"
import { StardustBalance } from "./balance"
import type { Skill, SkillStatus, UserProgress } from "@/types/Structures/telescope-skills"

interface SkillTreeViewProps {
  onBack: () => void
}

const SKILLS: Skill[] = [
  {
    id: "planet-hunting",
    name: "Planet Hunt",
    description: "Basic exoplanet detection",
    cost: 0,
    position: { x: 150, y: 80 },
    prerequisites: [],
    requirementType: "none",
    requiredCount: 0,
    classificationType: null,
    rewards: ["Planet classification access"],
    category: "core",
  },
  {
    id: "planetary-analysis",
    name: "Analysis",
    description: "Advanced planetary analysis",
    cost: 25,
    position: { x: 80, y: 180 },
    prerequisites: ["planet-hunting"],
    requirementType: "classification",
    requiredCount: 1,
    classificationType: "planet",
    rewards: ["Enhanced accuracy"],
    category: "analysis",
  },
  {
    id: "planet-exploration",
    name: "Exploration",
    description: "Deep planetary exploration",
    cost: 50,
    position: { x: 220, y: 180 },
    prerequisites: ["planet-hunting"],
    requirementType: "classification",
    requiredCount: 1,
    classificationType: "planet",
    rewards: ["Detailed mapping"],
    category: "exploration",
  },
  {
    id: "planet-visualization",
    name: "Visualization",
    description: "Advanced data visualization",
    cost: 75,
    position: { x: 300, y: 120 },
    prerequisites: ["planet-hunting"],
    requirementType: "classification",
    requiredCount: 1,
    classificationType: "planet",
    rewards: ["3D models"],
    category: "visualization",
  },
  {
    id: "asteroid-hunting",
    name: "Asteroids",
    description: "Minor body detection",
    cost: 100,
    position: { x: 420, y: 80 },
    prerequisites: ["planet-hunting"],
    requirementType: "classification",
    requiredCount: 4,
    classificationType: "planet",
    rewards: ["Asteroid detection"],
    category: "core",
  },
  {
    id: "active-asteroids",
    name: "Active Track",
    description: "Active asteroid tracking",
    cost: 125,
    position: { x: 420, y: 180 },
    prerequisites: ["asteroid-hunting"],
    requirementType: "classification",
    requiredCount: 2,
    classificationType: "telescope-minorPlanet",
    rewards: ["Hazard assessment"],
    category: "advanced",
  },
  {
    id: "stellar-analysis",
    name: "Stellar",
    description: "Star classification",
    cost: 200,
    position: { x: 80, y: 280 },
    prerequisites: ["planetary-analysis"],
    requirementType: "locked",
    requiredCount: 0,
    classificationType: null,
    rewards: ["Star analysis"],
    category: "locked",
  },
  {
    id: "deep-space-survey",
    name: "Deep Survey",
    description: "Large-scale surveys",
    cost: 300,
    position: { x: 300, y: 280 },
    prerequisites: ["planet-exploration", "planet-visualization"],
    requirementType: "locked",
    requiredCount: 0,
    classificationType: null,
    rewards: ["Survey tools"],
    category: "locked",
  },
]

export function SkillTreeView({ onBack }: SkillTreeViewProps) {
  const session = useSession()
  const supabase = useSupabaseClient()
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null)
  const [userProgress, setUserProgress] = useState<UserProgress>({
    unlockedSkills: ["planet-hunting"],
    stardustBalance: 0,
    classifications: {},
  })
  const [loading, setLoading] = useState(true)

  const userId = session?.user?.id || "4d9a57e6-ea3c-4836-aa18-1c3ee7f6f725"

  useEffect(() => {
    fetchUserProgress()
  }, [userId])

  const fetchUserProgress = async () => {
    setLoading(true)
    try {
      const { data: classifications } = await supabase
        .from("classifications")
        .select("classificationtype")
        .eq("author", userId)

      const classificationCounts: Record<string, number> = {}
      classifications?.forEach((c) => {
        const type = c.classificationtype || "unknown"
        classificationCounts[type] = (classificationCounts[type] || 0) + 1
      })

      const { data: unlockedSkills } = await supabase.from("user_skills").select("skill_id").eq("user_id", userId)

      const unlockedSkillIds = unlockedSkills?.map((s) => s.skill_id) || ["planet-hunting"]

      setUserProgress({
        unlockedSkills: unlockedSkillIds,
        stardustBalance: 0,
        classifications: classificationCounts,
      })
    } catch (error) {
      console.error("Error fetching user progress:", error)
    } finally {
      setLoading(false)
    }
  }

  const getSkillStatus = (skill: Skill): SkillStatus => {
    if (userProgress.unlockedSkills.includes(skill.id)) {
      return "unlocked"
    }

    if (skill.requirementType === "locked") {
      return "locked"
    }

    const prerequisitesMet = skill.prerequisites.every((prereq) => userProgress.unlockedSkills.includes(prereq))

    if (!prerequisitesMet) {
      return "locked"
    }

    if (skill.requirementType === "classification" && skill.classificationType) {
      const userCount = userProgress.classifications[skill.classificationType] || 0
      if (userCount >= skill.requiredCount) {
        return "can-unlock"
      }
    } else if (skill.requirementType === "none") {
      return "can-unlock"
    }

    return "locked"
  }

  const getRequirementProgress = (skill: Skill): number => {
    if (skill.requirementType === "classification" && skill.classificationType) {
      const userCount = userProgress.classifications[skill.classificationType] || 0
      return Math.min(userCount / skill.requiredCount, 1) * 100
    }
    return 0
  }

  const unlockSkill = async (skill: Skill) => {
    if (getSkillStatus(skill) !== "can-unlock" || userProgress.stardustBalance < skill.cost) {
      return
    }

    try {
      await supabase.from("user_skills").insert({
        user_id: userId,
        skill_id: skill.id,
        unlocked_at: new Date().toISOString(),
      })

      setUserProgress((prev) => ({
        ...prev,
        unlockedSkills: [...prev.unlockedSkills, skill.id],
        stardustBalance: prev.stardustBalance - skill.cost,
      }))
    } catch (error) {
      console.error("Error unlocking skill:", error)
    }
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center" style={{ backgroundColor: "#002439" }}>
        <div className="text-center">
          <div
            className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: "#78cce2", borderTopColor: "transparent" }}
          ></div>
          <div className="text-lg font-mono" style={{ color: "#e4eff0" }}>
            LOADING...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ backgroundColor: "#002439" }}>
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 border-b flex-shrink-0"
        style={{
          backgroundColor: "rgba(0, 80, 102, 0.95)",
          borderColor: "rgba(120, 204, 226, 0.3)",
        }}
      >
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack} style={{ color: "#78cce2" }}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            BACK
          </Button>
          <div>
            <h1 className="font-bold text-lg tracking-wider" style={{ color: "#e4eff0" }}>
              RESEARCH TREE
            </h1>
            <p className="text-sm font-mono" style={{ color: "#78cce2" }}>
              Skill Progression
            </p>
          </div>
        </div>
        <StardustBalance
          userId={userId}
          onBalanceUpdate={(balance) => setUserProgress((prev) => ({ ...prev, stardustBalance: balance }))}
        />
      </div>

      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Skill Tree Canvas */}
        <div
          className="flex-1 relative overflow-auto"
          style={{
            background: "linear-gradient(135deg, #002439 0%, #003d5c 50%, #002439 100%)",
          }}
        >
          {/* Grid Background */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `
                linear-gradient(rgba(120, 204, 226, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(120, 204, 226, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: "40px 40px",
            }}
          />

          {/* Skill Connections */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {SKILLS.map((skill) =>
              skill.prerequisites.map((prereqId) => {
                const prereq = SKILLS.find((s) => s.id === prereqId)
                if (!prereq) return null

                const isActive = userProgress.unlockedSkills.includes(skill.id)
                const prereqUnlocked = userProgress.unlockedSkills.includes(prereqId)

                return (
                  <line
                    key={`${prereqId}-${skill.id}`}
                    x1={prereq.position.x + 32}
                    y1={prereq.position.y + 32}
                    x2={skill.position.x + 32}
                    y2={skill.position.y + 32}
                    stroke={isActive ? "#78cce2" : prereqUnlocked ? "#4e7988" : "#78cce2"}
                    strokeWidth={isActive ? 3 : 2}
                    strokeOpacity={isActive ? 1 : 0.3}
                    strokeDasharray={isActive ? "none" : "5,5"}
                  />
                )
              }),
            )}
          </svg>

          {/* Skill Nodes */}
          {SKILLS.map((skill) => (
            <SkillNode
              key={skill.id}
              skill={skill}
              status={getSkillStatus(skill)}
              progress={getRequirementProgress(skill)}
              onClick={() => setSelectedSkill(skill)}
              isSelected={selectedSkill?.id === skill.id}
            />
          ))}

          {/* Legend */}
          <div className="absolute bottom-4 left-4">
            <SkillLegend />
          </div>
        </div>

        {/* Skill Details Panel */}
        {selectedSkill && (
          <div className="w-72 border-l flex-shrink-0" style={{ borderColor: "rgba(120, 204, 226, 0.3)" }}>
            <SkillDetails
              skill={selectedSkill}
              status={getSkillStatus(selectedSkill)}
              progress={getRequirementProgress(selectedSkill)}
              userProgress={userProgress}
              onUnlock={() => unlockSkill(selectedSkill)}
              onClose={() => setSelectedSkill(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
};