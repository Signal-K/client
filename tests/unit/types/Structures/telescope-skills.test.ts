import { describe, it, expect } from "vitest";
import type { Skill, SkillStatus, UserProgress } from "@/src/types/Structures/telescope-skills";

describe("telescope-skills type shapes", () => {
  it("Skill has required fields", () => {
    const skill: Skill = {
      id: "skill-1",
      name: "Planet Analysis",
      description: "Analyse planets",
      cost: 10,
      position: { x: 100, y: 200 },
      prerequisites: [],
      requirementType: "none",
      requiredCount: 0,
      classificationType: null,
      rewards: ["bonus"],
      category: "planet",
    };
    expect(skill.id).toBe("skill-1");
    expect(skill.requirementType).toBe("none");
    expect(skill.classificationType).toBeNull();
  });

  it("SkillStatus accepts valid values", () => {
    const statuses: SkillStatus[] = ["unlocked", "can-unlock", "locked"];
    expect(statuses).toHaveLength(3);
  });

  it("UserProgress tracks unlockedSkills and balance", () => {
    const progress: UserProgress = {
      unlockedSkills: ["skill-1", "skill-2"],
      stardustBalance: 250,
      classifications: { planet: 5, asteroid: 2 },
    };
    expect(progress.unlockedSkills).toHaveLength(2);
    expect(progress.stardustBalance).toBe(250);
  });

  it("Skill category includes core", () => {
    const skill: Skill = {
      id: "core-skill",
      name: "Core Skill",
      description: "Core",
      cost: 0,
      position: { x: 0, y: 0 },
      prerequisites: [],
      requirementType: "none",
      requiredCount: 0,
      classificationType: null,
      rewards: [],
      category: "core",
    };
    expect(skill.category).toBe("core");
  });
});
