"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useState, useEffect } from "react"
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react"
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
    name: "Planet Hunting",
    description: "Basic exoplanet detection and classification",
    cost: 0,
    position: { x: 200, y: 100 },
    prerequisites: [],
    requirementType: "none",
    requiredCount: 0,
    classificationType: null,
    rewards: ["Access to basic planet classification", "Foundation for advanced techniques"],
    category: "core",
  },
  {
    id: "planetary-analysis",
    name: "Planetary Analysis",
    description: "Advanced analysis techniques for planetary characteristics",
    cost: 25,
    position: { x: 100, y: 200 },
    prerequisites: ["planet-hunting"],
    requirementType: "classification",
    requiredCount: 1,
    classificationType: "planet",
    rewards: ["Enhanced planet detection accuracy", "Access to atmospheric analysis"],
    category: "analysis",
  },
  {
    id: "planet-exploration",
    name: "Planet Exploration",
    description: "Deep exploration of planetary systems and environments",
    cost: 50,
    position: { x: 200, y: 250 },
    prerequisites: ["planet-hunting"],
    requirementType: "classification",
    requiredCount: 1,
    classificationType: "planet",
    rewards: ["Detailed planetary mapping", "System composition analysis"],
    category: "exploration",
  },
  {
    id: "planet-visualization",
    name: "Planet Visualization",
    description: "Advanced visualization tools for planetary data",
    cost: 75,
    position: { x: 300, y: 200 },
    prerequisites: ["planet-hunting"],
    requirementType: "classification",
    requiredCount: 1,
    classificationType: "planet",
    rewards: ["3D planetary models", "Interactive data visualization"],
    category: "visualization",
  },
  {
    id: "asteroid-hunting",
    name: "Asteroid Hunting",
    description: "Detection and tracking of minor planetary bodies",
    cost: 100,
    position: { x: 450, y: 100 },
    prerequisites: ["planet-hunting"],
    requirementType: "classification",
    requiredCount: 4,
    classificationType: "planet",
    rewards: ["Asteroid detection capabilities", "Minor planet classification"],
    category: "core",
  },
  {
    id: "active-asteroids",
    name: "Active Asteroids",
    description: "Advanced tracking of active and potentially hazardous asteroids",
    cost: 125,
    position: { x: 450, y: 200 },
    prerequisites: ["asteroid-hunting"],
    requirementType: "classification",
    requiredCount: 2,
    classificationType: "telescope-minorPlanet",
    rewards: ["Active asteroid monitoring", "Hazard assessment tools"],
    category: "advanced",
  },
  {
    id: "stellar-analysis",
    name: "Stellar Analysis",
    description: "Advanced stellar classification and analysis techniques",
    cost: 200,
    position: { x: 100, y: 350 },
    prerequisites: ["planetary-analysis"],
    requirementType: "locked",
    requiredCount: 0,
    classificationType: null,
    rewards: ["Stellar classification", "Star formation analysis"],
    category: "locked",
  },
  {
    id: "deep-space-survey",
    name: "Deep Space Survey",
    description: "Large-scale astronomical surveys and data mining",
    cost: 300,
    position: { x: 300, y: 350 },
    prerequisites: ["planet-exploration", "planet-visualization"],
    requirementType: "locked",
    requiredCount: 0,
    classificationType: null,
    rewards: ["Survey planning tools", "Large dataset analysis"],
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
      // Fetch user classifications
      const { data: classifications } = await supabase
        .from("classifications")
        .select("classificationtype")
        .eq("author", userId)

      // Count classifications by type
      const classificationCounts: Record<string, number> = {}
      classifications?.forEach((c) => {
        const type = c.classificationtype || "unknown"
        classificationCounts[type] = (classificationCounts[type] || 0) + 1
      })

      // Fetch unlocked skills (you might want to store this in a separate table)
      const { data: unlockedSkills } = await supabase.from("user_skills").select("skill_id").eq("user_id", userId)

      const unlockedSkillIds = unlockedSkills?.map((s) => s.skill_id) || ["planet-hunting"]

      setUserProgress({
        unlockedSkills: unlockedSkillIds,
        stardustBalance: 0, // This will be updated by StardustBalance component
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

    // Check prerequisites
    const prerequisitesMet = skill.prerequisites.every((prereq) => userProgress.unlockedSkills.includes(prereq))

    if (!prerequisitesMet) {
      return "locked"
    }

    // Check classification requirements
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
      // Add skill to user_skills table
      await supabase.from("user_skills").insert({
        user_id: userId,
        skill_id: skill.id,
        unlocked_at: new Date().toISOString(),
      })

      // Deduct stardust cost (you might want to implement this in your points system)
      // For now, we'll just update the local state
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
      <div className="h-full bg-[#002439] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#78cce2] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-[#e4eff0] text-lg font-mono">LOADING RESEARCH DATA...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-[#002439] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-[#005066]/95 border-b border-[#78cce2]/30 flex-shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="text-[#78cce2] hover:bg-[#4e7988]/50">
            <ArrowLeft className="h-4 w-4 mr-2" />
            BACK TO TELESCOPE
          </Button>
          <div>
            <h1 className="text-[#e4eff0] font-bold text-lg tracking-wider">RESEARCH & DEVELOPMENT</h1>
            <p className="text-[#78cce2] text-sm font-mono">Skill Tree & Progression</p>
          </div>
        </div>
        <StardustBalance
          userId={userId}
          onBalanceUpdate={(balance) => setUserProgress((prev) => ({ ...prev, stardustBalance: balance }))}
        />
      </div>

      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Skill Tree Canvas */}
        <div className="flex-1 relative overflow-auto bg-gradient-to-br from-[#002439] via-[#003d5c] to-[#002439]">
          {/* Grid Background */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `
                linear-gradient(rgba(120, 204, 226, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(120, 204, 226, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: "50px 50px",
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
                    x1={prereq.position.x + 40}
                    y1={prereq.position.y + 40}
                    x2={skill.position.x + 40}
                    y2={skill.position.y + 40}
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
          <div className="w-80 bg-[#005066]/95 border-l border-[#78cce2]/30 flex-shrink-0">
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
  )
};