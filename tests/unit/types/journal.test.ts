import { describe, it, expect } from "vitest";
import type { Mission, Project, Category } from "@/src/types/journal";

describe("journal type shapes", () => {
  it("Mission has required fields", () => {
    const mission: Mission = {
      id: "m1",
      name: "Test Mission",
      xpReward: 100,
      coinReward: 50,
      progress: 2,
      totalSteps: 5,
      isComplete: false,
    };
    expect(mission.id).toBe("m1");
    expect(mission.isComplete).toBe(false);
    expect(mission.progress).toBeLessThanOrEqual(mission.totalSteps);
  });

  it("Project can hold missions array", () => {
    const project: Project = {
      id: "p1",
      name: "Planet Project",
      totalProgress: 40,
      missions: [],
    };
    expect(project.missions).toEqual([]);
  });

  it("Category holds projects array and tally", () => {
    const cat: Category = {
      id: "cat1",
      name: "Astronomy",
      projects: [],
      totalTally: 0,
    };
    expect(cat.totalTally).toBe(0);
  });

  it("complete mission has isComplete true", () => {
    const mission: Mission = {
      id: "m2",
      name: "Done",
      xpReward: 200,
      coinReward: 100,
      progress: 5,
      totalSteps: 5,
      isComplete: true,
    };
    expect(mission.isComplete).toBe(true);
    expect(mission.progress).toBe(mission.totalSteps);
  });
});
