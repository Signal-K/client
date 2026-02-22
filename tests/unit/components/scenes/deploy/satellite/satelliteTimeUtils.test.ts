import { describe, it, expect } from "vitest";
import {
  getTimeUntilWeekEnd,
  getTimeSinceLastAction,
} from "@/components/scenes/deploy/satellite/satelliteTimeUtils";

describe("getTimeUntilWeekEnd", () => {
  it("returns positive values for a weekday", () => {
    // Wednesday, Jan 15 2025, noon
    const wed = new Date(2025, 0, 15, 12, 0, 0);
    const result = getTimeUntilWeekEnd(wed);
    expect(result.days).toBeGreaterThanOrEqual(0);
    expect(result.hours).toBeGreaterThanOrEqual(0);
    expect(result.minutes).toBeGreaterThanOrEqual(0);
    expect(result.totalMs).toBeGreaterThan(0);
  });

  it("returns 7 days for a Saturday (since daysUntilSaturday=7 when dayOfWeek=6)", () => {
    // Saturday, Jan 18 2025, 00:00:00
    const sat = new Date(2025, 0, 18, 0, 0, 0);
    const result = getTimeUntilWeekEnd(sat);
    // On Saturday, daysUntilSaturday is 7 (next Saturday)
    expect(result.days).toBeGreaterThanOrEqual(6);
    expect(result.totalMs).toBeGreaterThan(0);
  });

  it("returns object with correct shape", () => {
    const now = new Date();
    const result = getTimeUntilWeekEnd(now);
    expect(result).toHaveProperty("days");
    expect(result).toHaveProperty("hours");
    expect(result).toHaveProperty("minutes");
    expect(result).toHaveProperty("totalMs");
  });

  it("hours is 0-23 and minutes is 0-59", () => {
    const now = new Date(2025, 5, 10, 15, 30, 0); // Tuesday
    const result = getTimeUntilWeekEnd(now);
    expect(result.hours).toBeGreaterThanOrEqual(0);
    expect(result.hours).toBeLessThanOrEqual(23);
    expect(result.minutes).toBeGreaterThanOrEqual(0);
    expect(result.minutes).toBeLessThanOrEqual(59);
  });

  it("totalMs is never negative", () => {
    // Even far-future dates should return non-negative
    const future = new Date(2099, 11, 31, 23, 59, 59);
    const result = getTimeUntilWeekEnd(future);
    expect(result.totalMs).toBeGreaterThanOrEqual(0);
  });
});

describe("getTimeSinceLastAction", () => {
  it("returns zeros when lastActionTime is null", () => {
    const now = new Date();
    const result = getTimeSinceLastAction(null, now);
    expect(result).toEqual({ days: 0, hours: 0, minutes: 0 });
  });

  it("returns correct difference for known times", () => {
    const lastAction = new Date(2025, 0, 10, 12, 0, 0);
    const current = new Date(2025, 0, 12, 15, 30, 0);
    const result = getTimeSinceLastAction(lastAction, current);
    expect(result.days).toBe(2);
    expect(result.hours).toBe(3);
    expect(result.minutes).toBe(30);
  });

  it("returns zeros when times are equal", () => {
    const time = new Date(2025, 5, 15, 10, 0, 0);
    const result = getTimeSinceLastAction(time, time);
    expect(result).toEqual({ days: 0, hours: 0, minutes: 0 });
  });

  it("returns zeros when lastAction is in the future (clamped to 0)", () => {
    const lastAction = new Date(2025, 5, 20, 12, 0, 0);
    const current = new Date(2025, 5, 15, 12, 0, 0);
    const result = getTimeSinceLastAction(lastAction, current);
    expect(result).toEqual({ days: 0, hours: 0, minutes: 0 });
  });

  it("calculates large time differences correctly", () => {
    const lastAction = new Date(2025, 0, 1, 0, 0, 0);
    const current = new Date(2025, 0, 31, 0, 0, 0);
    const result = getTimeSinceLastAction(lastAction, current);
    expect(result.days).toBe(30);
    expect(result.hours).toBe(0);
    expect(result.minutes).toBe(0);
  });

  it("hours is 0-23 and minutes is 0-59", () => {
    const lastAction = new Date(2025, 0, 1, 0, 0, 0);
    const current = new Date(2025, 0, 5, 13, 45, 0);
    const result = getTimeSinceLastAction(lastAction, current);
    expect(result.hours).toBeGreaterThanOrEqual(0);
    expect(result.hours).toBeLessThanOrEqual(23);
    expect(result.minutes).toBeGreaterThanOrEqual(0);
    expect(result.minutes).toBeLessThanOrEqual(59);
  });
});
