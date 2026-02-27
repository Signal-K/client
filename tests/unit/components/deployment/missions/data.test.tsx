import { describe, it, expect } from "vitest";
import { missions } from "@/src/components/deployment/missions/data";

describe("missions data", () => {
  it("exports an array of missions", () => {
    expect(Array.isArray(missions)).toBe(true);
    expect(missions.length).toBeGreaterThan(0);
  });

  it("each mission has an id", () => {
    missions.forEach((mission) => {
      expect(mission.id).toBeDefined();
      expect(typeof mission.id).toBe("string");
    });
  });

  it("each mission has a description", () => {
    missions.forEach((mission) => {
      expect(mission.description).toBeDefined();
      expect(typeof mission.description).toBe("string");
    });
  });

  it("each mission has a reward", () => {
    missions.forEach((mission) => {
      expect(mission.reward).toBeDefined();
    });
  });

  it("first mission id is mission-1", () => {
    expect(missions[0].id).toBe("mission-1");
  });

  it("each mission has a completed boolean", () => {
    missions.forEach((mission) => {
      expect(typeof mission.completed).toBe("boolean");
    });
  });

  it("each mission has a project field", () => {
    missions.forEach((mission) => {
      expect(mission.project).toBeDefined();
      expect(typeof mission.project).toBe("string");
    });
  });
});
