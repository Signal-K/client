'use client'

import React, { useEffect, useState, useCallback } from "react"
import { SkillTree } from "./tree"
import { SkillIcons } from "./skill-node"
import { SkillTreeExpandedPanelOverlay } from "@/src/components/ui/panel-overlay"
import { isSkillUnlockable } from "@/src/components/research/skill-utils"
import type { SkillCategory, Skill, SkillStatus } from "@/types/Reseearch/skill-tree"

interface SkillTreeSectionProps {
    isFullTree?: boolean;
};

export function SkillTreeSection({ isFullTree = false }: SkillTreeSectionProps) {
  const [unlockedSkills, setUnlockedSkills] = useState<string[]>([])
  const [classifiedPlanets, setClassifiedPlanets] = useState(0)
  const [discoveredAsteroids, setDiscoveredAsteroids] = useState(0)
  const [activeSkillDetailPanel, setActiveSkillDetailPanel] = useState<Skill | null>(null)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null) // State to hold the user ID

  // Skill tree data definition (structure of skills and their prerequisites)
  const skillTreeData: SkillCategory[] = [
    {
      id: "telescope",
      name: "Telescope Operations",
      skills: [
        {
          id: "planet-hunters",
          name: "Planet Hunters",
          description: "Master the art of discovering new exoplanets and celestial bodies.",
          status: "unlocked", // Changed from "locked" to "unlocked"
          prerequisites: [],
          unlockCost: 0,
          icon: SkillIcons.PlanetHunters,
          details: ["Increases exoplanet discovery rate.", "Unlocks advanced planetary analysis tools."],
        },
        {
          id: "asteroid-hunting",
          name: "Asteroid Hunting",
          description: "Specialize in identifying and tracking asteroids, including potential resource-rich ones.",
          status: "locked", // Will be updated by fetched data
          prerequisites: [
            { type: "skill", value: "planet-hunters" }, // Keep this for visual leveling
            { type: "progress", value: "4 planets classified" },
          ],
          unlockCost: 5,
          icon: SkillIcons.AsteroidHunting,
          details: ["Improves asteroid detection range.", "Unlocks asteroid trajectory prediction."],
        },
        {
          id: "planet-exploration",
          name: "Planet Exploration",
          description:
            "Learn techniques for detailed surface analysis and environmental assessment of discovered planets.",
          status: "locked", // Will be updated by fetched data
          prerequisites: [
            { type: "skill", value: "planet-hunters" }, // Keep this for visual leveling
            { type: "progress", value: "1 planet classified" },
          ],
          unlockCost: 5,
          icon: SkillIcons.PlanetExploration,
          details: ["Enables detailed planetary surface scans.", "Unlocks environmental data collection."],
        },
        {
          id: "cloudspotting",
          name: "Cloudspotting",
          description:
            "Focus on atmospheric phenomena, identifying unique cloud formations and weather patterns on gas giants.",
          status: "locked", // Will be updated by fetched data
          prerequisites: [
            { type: "skill", value: "planet-exploration" },
            { type: "progress", value: "2 planets classified" },
          ],
          unlockCost: 5,
          icon: SkillIcons.Cloudspotting,
          details: ["Improves atmospheric analysis capabilities.", "Unlocks weather prediction models for gas giants."],
        },
        {
          id: "active-asteroids",
          name: "Active Asteroids",
          description: "Specialize in detecting and analyzing active asteroids, which exhibit comet-like activity.",
          status: "locked", // Will be updated by fetched data
          prerequisites: [
            { type: "skill", value: "asteroid-hunting" },
            { type: "progress", value: "2 asteroids discovered" },
          ],
          unlockCost: 5,
          icon: SkillIcons.ActiveAsteroids,
          details: ["Enhances detection of active asteroids.", "Provides insights into their unique compositions."],
        },
      ],
    },
    // Add more categories and skills here later
  ]

  // Function to fetch user session and data
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/gameplay/research/summary")
      const payload = await response.json()
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to fetch skill tree data")
      }

      const currentUserId = payload?.userId ?? null
      setUserId(currentUserId)

      if (!currentUserId) {
        console.warn("No user ID found. Data fetching for skill tree skipped.")
        setLoading(false)
        return
      }

      const researchedTechTypes: string[] = payload?.researchedTechTypes || []
      const fetchedUnlockedSkillIds = researchedTechTypes
        .map((row) => {
          const foundSkill = skillTreeData[0].skills.find((s) => s.id === row || s.name === row)
          return foundSkill ? foundSkill.id : null
        })
        .filter(Boolean) as string[]

      // CRITICAL FIX: Ensure 'planet-hunters' is always considered unlocked for prerequisite checks
      if (!fetchedUnlockedSkillIds.includes("planet-hunters")) {
        fetchedUnlockedSkillIds.push("planet-hunters")
      }

      setUnlockedSkills(fetchedUnlockedSkillIds)
      setClassifiedPlanets(payload?.skillTree?.classifiedPlanets || 0)
      setDiscoveredAsteroids(payload?.skillTree?.discoveredAsteroids || 0)
    } catch (error) {
      console.error("Error fetching skill tree data:", error)
      // Optionally show an error message to the user
    } finally {
      setLoading(false)
    }
  }, []) // Removed skillTreeData from dependencies

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleCloseSkillDetailPanel = () => {
    setActiveSkillDetailPanel(null)
  }

  const handleViewSkillDetails = (skill: Skill) => {
    setActiveSkillDetailPanel(skill)
  }

  // Modified handleUnlockSkill to accept the current skill tree data
  const handleUnlockSkill = async (skillId: string, currentSkillTreeData: SkillCategory[]) => {
    if (!userId) {
      console.error("Cannot unlock skill: User not authenticated.")
      return
    }

    // Find the skill using the passed currentSkillTreeData
    const skillToUnlock = currentSkillTreeData[0].skills.find((s) => s.id === skillId)
    if (!skillToUnlock) {
      console.error(`ERROR: Skill with ID '${skillId}' not found in currentSkillTreeData.`)
      return
    }

    if (skillToUnlock.status === "available") {
      setLoading(true)
      try {
        const response = await fetch("/api/gameplay/research/unlock", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ techType: skillToUnlock.id }),
        })
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}))
          throw new Error(payload?.error || "Failed to unlock skill")
        }

        setUnlockedSkills((prev) => [...prev, skillId])
        handleCloseSkillDetailPanel()
        // Re-fetch data to ensure counts are up-to-date if unlocking affects prerequisites
        await fetchData()
      } catch (error) {
        console.error("ERROR: Error unlocking skill:", error)
        // Optionally show an error message to the user
      } finally {
        setLoading(false)
      }
    } else {
      console.warn(
        `WARN: Skill '${skillToUnlock.name}' is not 'available' for unlocking. Current status: ${skillToUnlock.status}`,
      )
    }
  }

  // Update skill statuses based on unlockedSkills state and progress
  const updatedSkillTreeData = skillTreeData.map((category) => ({
    ...category,
    skills: category.skills.map((skill) => {
      // Special case: Planet Hunters is always unlocked
      if (skill.id === "planet-hunters") {
        return { ...skill, status: "unlocked" as SkillStatus }
      }

      const isUnlocked = unlockedSkills.includes(skill.id)
      const isAvailable = isSkillUnlockable(skill, unlockedSkills, classifiedPlanets, discoveredAsteroids)
      return {
        ...skill,
        status: (isUnlocked ? "unlocked" : isAvailable ? "available" : "locked") as SkillStatus,
      }
    }),
  }))

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-muted-foreground">Loading skill tree...</div>
    )
  }

  return (
    <>
      <SkillTree
              skillTreeData={updatedSkillTreeData}
              classifiedPlanets={classifiedPlanets}
              discoveredAsteroids={discoveredAsteroids}
              // Pass updatedSkillTreeData to handleUnlockSkill
              onUnlockSkill={(skillId) => handleUnlockSkill(skillId, updatedSkillTreeData)}
              onViewSkillDetails={handleViewSkillDetails}
              isFullTree={isFullTree} onViewDetails={function (): void {
                  throw new Error("Function not implemented.")
              } }      />

      {activeSkillDetailPanel && (
        <SkillTreeExpandedPanelOverlay
          skill={activeSkillDetailPanel}
          onClose={handleCloseSkillDetailPanel}
          // Pass updatedSkillTreeData to handleUnlockSkill in the overlay as well
          onUnlockSkill={(skillId) => handleUnlockSkill(skillId, updatedSkillTreeData)}
          isUnlockable={isSkillUnlockable(
            activeSkillDetailPanel,
            unlockedSkills,
            classifiedPlanets,
            discoveredAsteroids,
          )}
        />
      )}
    </>
  )
};
