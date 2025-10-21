// Utility functions for SatellitePosition time calculations

// getNextSaturdayMidnight and getTimeSinceDeploy removed (unused)

export const getTimeUntilWeekEnd = (currentTime: Date): { days: number; hours: number; minutes: number; totalMs: number } => {
  const now = currentTime.getTime();
  // Inline calculation for next Saturday midnight to avoid dependency on removed helper
  const nowDate = new Date(currentTime);
  const dayOfWeek = nowDate.getDay(); // 0 = Sunday, 6 = Saturday
  let daysUntilSaturday = (6 - dayOfWeek + 7) % 7;
  if (daysUntilSaturday === 0) daysUntilSaturday = 7;
  const nextSaturday = new Date(nowDate);
  nextSaturday.setDate(nowDate.getDate() + daysUntilSaturday);
  nextSaturday.setHours(23, 59, 59, 999);
  const weekEnd = nextSaturday.getTime();
  const diffMs = Math.max(0, weekEnd - now);
  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = totalHours % 24;
  const minutes = totalMinutes % 60;
  return { days, hours, minutes, totalMs: diffMs };
};

export const getTimeSinceLastAction = (lastActionTime: Date | null, currentTime: Date): { days: number; hours: number; minutes: number } => {
  if (!lastActionTime) {
    return { days: 0, hours: 0, minutes: 0 };
  }
  const now = currentTime.getTime();
  const lastAction = lastActionTime.getTime();
  const diffMs = Math.max(0, now - lastAction);
  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = totalHours % 24;
  const minutes = totalMinutes % 60;
  return { days, hours, minutes };
};
