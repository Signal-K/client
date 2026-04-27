/**
 * Utility functions for gameplay leveling and progression.
 * Implements a quadratic progression model where each level 
 * requires more experience points than the previous one.
 */

/**
 * Calculates the level based on total experience points.
 * Formula: level = floor(sqrt(xp / 5)) + 1
 * 
 * XP thresholds:
 * Level 1: 0 XP
 * Level 2: 5 XP
 * Level 3: 20 XP
 * Level 4: 45 XP
 * Level 5: 80 XP
 * Level 6: 125 XP
 * Level 7: 180 XP
 * Level 8: 245 XP
 * Level 9: 320 XP
 * Level 10: 405 XP
 */
export function calculateLevel(experiencePoints: number): number {
  if (experiencePoints <= 0) return 1;
  return Math.floor(Math.sqrt(experiencePoints / 5)) + 1;
}

/**
 * Calculates the total XP required to reach a specific level.
 */
export function getXPForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.pow(level - 1, 2) * 5;
}

/**
 * Calculates the progress percentage towards the next level.
 */
export function getLevelProgress(experiencePoints: number): number {
  const currentLevel = calculateLevel(experiencePoints);
  const xpForCurrentLevel = getXPForLevel(currentLevel);
  const xpForNextLevel = getXPForLevel(currentLevel + 1);
  
  const xpInCurrentLevel = experiencePoints - xpForCurrentLevel;
  const xpNeededForNextLevel = xpForNextLevel - xpForCurrentLevel;
  
  return Math.min(100, Math.max(0, (xpInCurrentLevel / xpNeededForNextLevel) * 100));
}

/**
 * Calculates how many points are needed for the next chapter.
 * Chapters unlock every 2 levels.
 */
export function getXPForNextChapter(currentChapter: number): number {
  // Chapter 1: Level 1-2 (0-19 XP)
  // Chapter 2: Level 3-4 (20-79 XP)
  // Chapter 3: Level 5-6 (80-179 XP)
  const levelForNextChapter = currentChapter * 2 + 1;
  return getXPForLevel(levelForNextChapter);
}

/**
 * Calculates the maximum unlocked chapter based on XP.
 */
export function getMaxUnlockedChapter(experiencePoints: number): number {
  const level = calculateLevel(experiencePoints);
  return Math.floor((level - 1) / 2) + 1;
}
