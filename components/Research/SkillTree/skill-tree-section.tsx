'use client'

import React, { useEffect, useState, useCallback } from "react"
import { SkillTree } from "./tree"
import { SkillIcons } from "./skill-node"
import { SkillTreeExpandedPanelOverlay } from "@/components/ui/panel-overlay"
import { isSkillUnlockable } from "@/utils/research/skill-utils"
import type { SkillCategory, Skill } from "@/types/Reseearch/skill-tree"
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react"

interface SkillTreeSectionProps {
    isFullTree?: boolean;
};

export function SkillTreeSection({ isFullTree = false }: SkillTreeSectionProps) {
    const supabase = useSupabaseClient();
    const session = useSession()

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
          status: "locked", // Will be updated by fetched data
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
            { type: "skill", value: "planet-hunters" },
            { type: "progress", value: "4 planets classified" },
          ],
          unlockCost: 100,
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
            { type: "skill", value: "planet-hunters" },
            { type: "progress", value: "1 planet explored" },
          ],
          unlockCost: 150,
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
            { type: "progress", value: "1 planet explored" },
          ],
          unlockCost: 200,
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
          unlockCost: 250,
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
      // Get user session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()
      if (sessionError) throw sessionError

      const currentUserId = session?.user?.id // No dummy ID fallback here
      if (session && session.user) {
        setUserId(session.user.id)
      } else {
        setUserId(null)
      }

      if (!currentUserId) {
        console.warn("No user ID found. Data fetching for skill tree skipped.")
        setLoading(false)
        return
      }

      // Fetch unlocked skills
      const { data: researchedData, error: researchedError } = await supabase
        .from("researched")
        .select("tech_type")
        .eq("user_id", currentUserId)

      if (researchedError) throw researchedError
      setUnlockedSkills(researchedData.map((row) => row.tech_type))

      // Fetch classified planets
      const { count: planetCount, error: planetError } = await supabase
        .from("classifications")
        .select("id", { count: "exact" })
        .eq("author", currentUserId)
        .eq("classificationtype", "Planet")

      if (planetError) throw planetError
      setClassifiedPlanets(planetCount || 0)

      // Fetch discovered asteroids (using 'telescope-minorPlanet' as per schema)
      const { count: asteroidCount, error: asteroidError } = await supabase
        .from("classifications")
        .select("id", { count: "exact" })
        .eq("author", currentUserId)
        .eq("classificationtype", "telescope-minorPlanet")

      if (asteroidError) throw asteroidError
      setDiscoveredAsteroids(asteroidCount || 0)
    } catch (error) {
      console.error("Error fetching skill tree data:", error)
      // Optionally show an error message to the user
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleCloseSkillDetailPanel = () => {
    setActiveSkillDetailPanel(null)
  }

  const handleViewSkillDetails = (skill: Skill) => {
    setActiveSkillDetailPanel(skill)
  }

  const handleUnlockSkill = async (skillId: string) => {
    if (!userId) {
      console.error("Cannot unlock skill: User not authenticated.")
      return
    }

    const skillToUnlock = skillTreeData[0].skills.find((s) => s.id === skillId)
    if (skillToUnlock && skillToUnlock.status === "available") {
      setLoading(true)
      try {
        const { error } = await supabase.from("researched").insert({ tech_type: skillToUnlock.name, user_id: userId }) // Use skill name for tech_type

        if (error) throw error

        setUnlockedSkills((prev) => [...prev, skillId])
        console.log(`Skill unlocked: ${skillId}`)
        handleCloseSkillDetailPanel()
        // Re-fetch data to ensure counts are up-to-date if unlocking affects prerequisites
        await fetchData()
      } catch (error) {
        console.error("Error unlocking skill:", error)
        // Optionally show an error message to the user
      } finally {
        setLoading(false)
      }
    }
  }

  // Update skill statuses based on unlockedSkills state and progress
  const updatedSkillTreeData = skillTreeData.map((category) => ({
    ...category,
    skills: category.skills.map((skill) => {
      const isUnlocked = unlockedSkills.includes(skill.id)
      const isAvailable = isSkillUnlockable(skill, unlockedSkills, classifiedPlanets, discoveredAsteroids)
      // Ensure status is typed as SkillStatus
      const status: import("@/types/Reseearch/skill-tree").SkillStatus =
        isUnlocked ? "unlocked" : isAvailable ? "available" : "locked"
      return {
        ...skill,
        status,
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
        onUnlockSkill={handleUnlockSkill}
        onViewSkillDetails={handleViewSkillDetails}
        isFullTree={isFullTree} onViewDetails={function (): void {
            throw new Error("Function not implemented.")
        } }      
        />

      {activeSkillDetailPanel && (
        <SkillTreeExpandedPanelOverlay
          skill={activeSkillDetailPanel}
          onClose={handleCloseSkillDetailPanel}
          onUnlockSkill={handleUnlockSkill}
          isUnlockable={isSkillUnlockable(
            activeSkillDetailPanel,
            unlockedSkills,
            classifiedPlanets,
            discoveredAsteroids,
          )}
        />
      )}
    </>
  );
};