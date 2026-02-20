/**
 * Solar Event Utilities
 * Helper functions for managing weekly solar events
 */

/**
 * Get the start of the current week (Sunday at 00:00:00)
 */
export function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

/**
 * Get the end of the current week (Sunday at 00:00:00 of next week)
 */
export function getWeekEnd(date: Date = new Date()): Date {
  const weekStart = getWeekStart(date);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);
  return weekEnd;
}

/**
 * Format time remaining until a specific date
 * Returns human-readable string like "2d 5h remaining" or "3h 45m remaining"
 */
export function formatTimeRemaining(endDate: Date): string {
  const now = new Date();
  const diff = endDate.getTime() - now.getTime();
  
  if (diff <= 0) return "Event ended";
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) return `${days}d ${hours}h remaining`;
  if (hours > 0) return `${hours}h ${minutes}m remaining`;
  return `${minutes}m remaining`;
}

/**
 * List of G-type star names used for weekly rotation
 */
export const STAR_NAMES = [
  "Kepler-442",
  "Proxima Centauri",
  "TRAPPIST-1",
  "Tau Ceti",
  "Gliese 667C",
  "HD 40307",
  "Epsilon Eridani",
  "Ross 128",
  "Kapteyn's Star",
  "Wolf 1061",
  "Gliese 832",
  "HD 219134",
] as const;

/**
 * Get the star name for a given week
 * Rotates through STAR_NAMES based on week number
 */
export function getStarName(weekStart: Date): string {
  const weekNumber = Math.floor(weekStart.getTime() / (7 * 24 * 60 * 60 * 1000));
  return STAR_NAMES[weekNumber % STAR_NAMES.length];
}

/**
 * Check if a date is within the current solar event week
 */
export function isInCurrentWeek(date: Date): boolean {
  const weekStart = getWeekStart();
  const weekEnd = getWeekEnd();
  return date >= weekStart && date < weekEnd;
}

/**
 * Calculate progress percentage
 */
export function calculateProgressPercentage(current: number, threshold: number): number {
  return Math.min(100, Math.round((current / threshold) * 100));
}

/**
 * Default threshold for solar defense
 * Can be overridden in components
 */
const DEFAULT_DEFENSE_THRESHOLD = 100;

/**
 * Minimum classifications required to launch probes
 */
export const PROBE_UNLOCK_THRESHOLD = 5;
