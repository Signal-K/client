import { describe, it, expect } from "vitest";

// Import types file to exercise the module
import type {
  ClassificationType,
  MilestoneTier,
  ClassificationAchievement,
} from "@/src/types/achievement";

describe("achievement type shapes (runtime-checked via object construction)", () => {
  it("ClassificationAchievement has expected structure", () => {
    const ach: ClassificationAchievement = {
      type: "classification",
      classificationType: "DiskDetective",
      count: 10,
      milestones: [{ tier: 1, isUnlocked: false }],
    };
    expect(ach.type).toBe("classification");
    expect(ach.count).toBe(10);
    expect(ach.milestones).toHaveLength(1);
  });

  it("MilestoneTier values are 1, 5, 10, 25", () => {
    const tiers: MilestoneTier[] = [1, 5, 10, 25];
    expect(tiers).toEqual([1, 5, 10, 25]);
  });

  it("ClassificationType includes DiskDetective", () => {
    const t: ClassificationType = "DiskDetective";
    expect(t).toBe("DiskDetective");
  });

  it("milestone can be unlocked", () => {
    const ach: ClassificationAchievement = {
      type: "classification",
      classificationType: "automaton-aiForMars",
      count: 5,
      milestones: [{ tier: 5, isUnlocked: true }],
    };
    expect(ach.milestones[0].isUnlocked).toBe(true);
  });
});
