// Position calculation for satellites
import { getTimeUntilWeekEnd } from "../satelliteTimeUtils";

export const calculateSatellitePosition = (satellite: any, currentTime: Date) => {
  const { totalMs: timeRemainingMs } = getTimeUntilWeekEnd(currentTime);
  const weekDurationMs = 7 * 24 * 60 * 60 * 1000; // 1 week in ms
  const weekProgress = 1 - (timeRemainingMs / weekDurationMs);
  const centerX = 50;
  const centerY = 50;
  const angle = weekProgress * Math.PI * 4; // 4 full rotations
  const radius = weekProgress * 40;
  const x = centerX + Math.cos(angle) * radius;
  const y = centerY + Math.sin(angle) * radius;
  return {
    x: Math.max(10, Math.min(90, x)),
    y: Math.max(10, Math.min(90, y)),
  };
};
