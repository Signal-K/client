import type { Skill } from "@/types/Reseearch/skill-tree"

/**
 * Determines if a skill is unlockable based on its prerequisites and user progress.
 * @param skill The skill to check.
 * @param unlockedSkills An array of IDs of skills already unlocked by the user.
 * @param classifiedPlanets The number of planets classified by the user.
 * @param discoveredAsteroids The number of asteroids discovered by the user.
 * @returns True if the skill is unlockable, false otherwise.
 */
export const isSkillUnlockable = (
  skill: Skill,
  unlockedSkills: string[],
  classifiedPlanets: number,
  discoveredAsteroids: number,
) => {
  console.log(`Checking skill ${skill.id}: planets=${classifiedPlanets}, asteroids=${discoveredAsteroids}`)
  
  if (skill.status === "unlocked") return false
  if (skill.status === "locked") return false // Should not happen if status is correctly derived, but as a safeguard

  for (const prereq of skill.prerequisites) {
    if (prereq.type === "skill") {
      if (!unlockedSkills.includes(prereq.value as string)) {
        return false
      }
    } else if (prereq.type === "progress") {
      if (prereq.value === "4 planets classified" && classifiedPlanets < 4) return false
      if (prereq.value === "1 planet explored" && classifiedPlanets < 1) return false
      if (prereq.value === "1 planet classified" && classifiedPlanets < 1) return false
      if (prereq.value === "2 planets classified" && classifiedPlanets < 2) return false
      if (prereq.value === "2 asteroids discovered" && discoveredAsteroids < 2) return false
    }
  }
  return true
}
