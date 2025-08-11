// Utility functions for SatellitePosition time calculations

export const getNextSaturdayMidnight = (): Date => {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
  let daysUntilSaturday;
  if (dayOfWeek === 6) {
    const todayMidnight = new Date(now);
    todayMidnight.setHours(23, 59, 59, 999);
    if (now < todayMidnight) {
      daysUntilSaturday = 0;
    } else {
      daysUntilSaturday = 7;
    }
  } else {
    daysUntilSaturday = (6 - dayOfWeek + 7) % 7;
    if (daysUntilSaturday === 0) daysUntilSaturday = 7;
  }
  const nextSaturday = new Date(now);
  nextSaturday.setDate(now.getDate() + daysUntilSaturday);
  nextSaturday.setHours(23, 59, 59, 999);
  return nextSaturday;
};

export const getTimeSinceDeploy = (deployTime: Date, currentTime: Date): { minutes: number; seconds: number; total: number } => {
  const now = currentTime.getTime();
  const deploy = deployTime.getTime();
  const diffMs = Math.max(0, now - deploy);
  const totalSeconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return { minutes, seconds, total: totalSeconds };
};

export const getTimeUntilWeekEnd = (currentTime: Date): { days: number; hours: number; minutes: number; totalMs: number } => {
  const now = currentTime.getTime();
  const weekEnd = getNextSaturdayMidnight().getTime();
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
