'use client'

import { Button } from "@/components/ui/button"
import { PanelCard } from "@/components/ui/common/panel-card"
import { GitFork, ChevronRight } from "lucide-react"
import { SkillNode } from "./skill-node"
import { isSkillUnlockable } from "@/utils/research/skill-utils"
import type { SkillTreeProps, Skill, SkillCategory } from "@/types/Reseearch/skill-tree"

export function SkillTree({
  skillTreeData,
  classifiedPlanets,
  discoveredAsteroids,
  onUnlockSkill,
  onViewSkillDetails,
  isFullTree = false,
}: SkillTreeProps) {
  // For the simplified view, we only show the first category and its first few skills
  const displayCategories = isFullTree ? skillTreeData : skillTreeData.slice(0, 1)

  return (
    <PanelCard
      borderColorClass="border-chart-4/30"
      title="skill tree"
      icon={GitFork}
      headerRightContent={
        !isFullTree && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewSkillDetails(null as any)}
            className="h-6 w-6 p-0 hover:bg-chart-4/20"
          >
            <ChevronRight className="w-3 h-3 text-chart-4" />
          </Button>
        )
      }
      className={isFullTree ? "min-h-[calc(100vh-120px)]" : ""}
      contentClassName="p-4 overflow-auto" // Ensure overflow-auto is correctly applied
    >
      <div className="relative w-full h-full p-4">
        {displayCategories.map((category: SkillCategory) => {
          // Calculate skill levels for the full tree view
          const skillsWithLevels: (Skill & { level: number })[] = category.skills.map((s) => ({ ...s, level: 0 }))
          let changed = true
          while (changed) {
            changed = false
            for (const skill of skillsWithLevels) {
              let maxPrereqLevel = -1
              for (const prereq of skill.prerequisites) {
                if (prereq.type === "skill") {
                  const prereqSkill = skillsWithLevels.find((s) => s.id === prereq.value)
                  if (prereqSkill && prereqSkill.level > maxPrereqLevel) {
                    maxPrereqLevel = prereqSkill.level
                  }
                }
              }
              const newLevel = maxPrereqLevel + 1
              if (newLevel > skill.level) {
                skill.level = newLevel
                changed = true
              }
            }
          }

          // Group skills by level
          const skillsByLevel = skillsWithLevels.reduce(
            (acc, skill) => {
              if (!acc[skill.level]) {
                acc[skill.level] = []
              }
              acc[skill.level].push(skill)
              return acc
            },
            {} as Record<number, (Skill & { level: number })[]>,
          )

          const sortedLevels = Object.keys(skillsByLevel)
            .map(Number)
            .sort((a, b) => a - b)

          return (
            <div key={category.id} className="mb-8">
              <h3 className="text-lg font-bold text-chart-4 mb-4">{category.name}</h3>
              {isFullTree ? (
                <div className="flex flex-row overflow-x-auto gap-8 pb-4">
                  {sortedLevels.map((level) => (
                    <div
                      key={level}
                      className="flex flex-col gap-8 p-4 border-r border-border last:border-r-0 min-w-[200px]"
                    >
                      <h4 className="text-sm font-semibold text-muted-foreground mb-2">Level {level + 1}</h4>
                      {skillsByLevel[level].map((skill: Skill) => (
                        <SkillNode
                          key={skill.id}
                          skill={skill}
                          onViewDetails={onViewSkillDetails}
                          onUnlock={onUnlockSkill}
                          isUnlockable={isSkillUnlockable(
                            skill,
                            category.skills.filter((s) => s.status === "unlocked").map((s) => s.id),
                            classifiedPlanets, // Pass classifiedPlanets
                            discoveredAsteroids, // Pass discoveredAsteroids
                          )}
                          isFullTree={isFullTree}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="relative flex flex-col items-center w-full">
                  {/* Level 0: Planet Hunters */}
                  <div className="relative z-10">
                    <SkillNode
                      skill={category.skills.find((s) => s.id === "planet-hunters")!}
                      onViewDetails={onViewSkillDetails}
                      onUnlock={onUnlockSkill}
                      isUnlockable={isSkillUnlockable(
                        category.skills.find((s) => s.id === "planet-hunters")!,
                        category.skills.filter((s) => s.status === "unlocked").map((s) => s.id),
                        classifiedPlanets,
                        discoveredAsteroids,
                      )}
                      isFullTree={isFullTree}
                    />
                  </div>

                  {/* Line from Planet Hunters to next level */}
                  <div className="relative w-full h-16 flex justify-center">
                    <div className="absolute top-0 w-2 h-full bg-chart-2 rounded-full"></div>
                    <div className="absolute top-1/2 w-1/2 h-2 bg-chart-2 rounded-full"></div>
                  </div>

                  {/* Level 1: Asteroid Hunting & Planet Exploration */}
                  <div className="relative z-10 flex justify-center gap-x-16 w-full">
                    <SkillNode
                      skill={category.skills.find((s) => s.id === "asteroid-hunting")!}
                      onViewDetails={onViewSkillDetails}
                      onUnlock={onUnlockSkill}
                      isUnlockable={isSkillUnlockable(
                        category.skills.find((s) => s.id === "asteroid-hunting")!,
                        category.skills.filter((s) => s.status === "unlocked").map((s) => s.id),
                        classifiedPlanets,
                        discoveredAsteroids,
                      )}
                      isFullTree={isFullTree}
                    />
                    <SkillNode
                      skill={category.skills.find((s) => s.id === "planet-exploration")!}
                      onViewDetails={onViewSkillDetails}
                      onUnlock={onUnlockSkill}
                      isUnlockable={isSkillUnlockable(
                        category.skills.find((s) => s.id === "planet-exploration")!,
                        category.skills.filter((s) => s.status === "unlocked").map((s) => s.id),
                        classifiedPlanets,
                        discoveredAsteroids,
                      )}
                      isFullTree={isFullTree}
                    />
                  </div>

                  {/* Line from Level 1 to Level 2 */}
                  <div className="relative w-full h-16 flex justify-center">
                    {/* Vertical lines from AH and PE */}
                    <div className="absolute top-0 left-[calc(50%-8px-8rem)] w-2 h-full bg-chart-2 rounded-full"></div>{" "}
                    {/* Adjust left for AH */}
                    <div className="absolute top-0 right-[calc(50%-8px-8rem)] w-2 h-full bg-chart-2 rounded-full"></div>{" "}
                    {/* Adjust right for PE */}
                    {/* Horizontal line connecting them */}
                    <div className="absolute top-1/2 w-[calc(16rem)] h-2 bg-chart-2 rounded-full"></div>{" "}
                    {/* Adjust width based on gap */}
                  </div>

                  {/* Level 2: Cloudspotting & Active Asteroids */}
                  <div className="relative z-10 flex justify-center gap-x-16 w-full">
                    <SkillNode
                      skill={category.skills.find((s) => s.id === "active-asteroids")!}
                      onViewDetails={onViewSkillDetails}
                      onUnlock={onUnlockSkill}
                      isUnlockable={isSkillUnlockable(
                        category.skills.find((s) => s.id === "active-asteroids")!,
                        category.skills.filter((s) => s.status === "unlocked").map((s) => s.id),
                        classifiedPlanets,
                        discoveredAsteroids,
                      )}
                      isFullTree={isFullTree}
                    />
                    <SkillNode
                      skill={category.skills.find((s) => s.id === "cloudspotting")!}
                      onViewDetails={onViewSkillDetails}
                      onUnlock={onUnlockSkill}
                      isUnlockable={isSkillUnlockable(
                        category.skills.find((s) => s.id === "cloudspotting")!,
                        category.skills.filter((s) => s.status === "unlocked").map((s) => s.id),
                        classifiedPlanets,
                        discoveredAsteroids,
                      )}
                      isFullTree={isFullTree}
                    />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </PanelCard>
  )
};