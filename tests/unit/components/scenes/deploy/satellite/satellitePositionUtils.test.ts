import { describe, it, expect, vi } from "vitest";
import { calculateSatellitePosition } from "@/components/scenes/deploy/satellite/Deploy/satellitePositionUtils";

// Mock the time utils to control the week progress
vi.mock("@/components/scenes/deploy/satellite/satelliteTimeUtils", () => ({
  getTimeUntilWeekEnd: vi.fn(),
}));

import { getTimeUntilWeekEnd } from "@/components/scenes/deploy/satellite/satelliteTimeUtils";

const mockGetTimeUntilWeekEnd = vi.mocked(getTimeUntilWeekEnd);
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

describe("calculateSatellitePosition", () => {
  it("returns position at center start when week just started", () => {
    // Full week remaining = progress ~0
    mockGetTimeUntilWeekEnd.mockReturnValue({
      days: 7,
      hours: 0,
      minutes: 0,
      totalMs: WEEK_MS,
    });
    const pos = calculateSatellitePosition({}, new Date());
    // weekProgress = 1 - (WEEK_MS / WEEK_MS) = 0, radius = 0
    expect(pos.x).toBeCloseTo(50, 0);
    expect(pos.y).toBeCloseTo(50, 0);
  });

  it("returns position away from center mid-week", () => {
    // Half week remaining
    mockGetTimeUntilWeekEnd.mockReturnValue({
      days: 3,
      hours: 12,
      minutes: 0,
      totalMs: WEEK_MS / 2,
    });
    const pos = calculateSatellitePosition({}, new Date());
    // weekProgress = 0.5, radius = 20
    expect(pos.x).not.toBeCloseTo(50, 0);
  });

  it("positions are clamped between 10 and 90", () => {
    // End of week, maximum radius
    mockGetTimeUntilWeekEnd.mockReturnValue({
      days: 0,
      hours: 0,
      minutes: 0,
      totalMs: 0,
    });
    const pos = calculateSatellitePosition({}, new Date());
    expect(pos.x).toBeGreaterThanOrEqual(10);
    expect(pos.x).toBeLessThanOrEqual(90);
    expect(pos.y).toBeGreaterThanOrEqual(10);
    expect(pos.y).toBeLessThanOrEqual(90);
  });

  it("returns object with x and y", () => {
    mockGetTimeUntilWeekEnd.mockReturnValue({
      days: 1,
      hours: 0,
      minutes: 0,
      totalMs: 24 * 60 * 60 * 1000,
    });
    const pos = calculateSatellitePosition({}, new Date());
    expect(pos).toHaveProperty("x");
    expect(pos).toHaveProperty("y");
    expect(typeof pos.x).toBe("number");
    expect(typeof pos.y).toBe("number");
  });

  it("x and y are always numbers", () => {
    const testCases = [0, WEEK_MS / 4, WEEK_MS / 2, WEEK_MS * 0.75, WEEK_MS];
    testCases.forEach((totalMs) => {
      mockGetTimeUntilWeekEnd.mockReturnValue({
        days: 0,
        hours: 0,
        minutes: 0,
        totalMs,
      });
      const pos = calculateSatellitePosition({}, new Date());
      expect(Number.isFinite(pos.x)).toBe(true);
      expect(Number.isFinite(pos.y)).toBe(true);
    });
  });
});
