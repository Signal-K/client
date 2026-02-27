import { describe, it, expect } from "vitest";
import { projects } from "@/src/shared/data/projects";

describe("projects data", () => {
  it("exports an array with 4 projects", () => {
    expect(Array.isArray(projects)).toBe(true);
    expect(projects).toHaveLength(4);
  });

  it("each project has required fields", () => {
    for (const p of projects) {
      expect(p).toHaveProperty("id");
      expect(p).toHaveProperty("name");
      expect(p).toHaveProperty("description");
      expect(p).toHaveProperty("anomalyType");
      expect(typeof p.completed).toBe("number");
      expect(typeof p.total).toBe("number");
    }
  });

  it("contains planet-hunters project", () => {
    const ph = projects.find((p) => p.id === "planet-hunters");
    expect(ph).toBeDefined();
    expect(ph?.anomalyType).toBe("exoplanet");
  });

  it("contains sunspots project", () => {
    const ss = projects.find((p) => p.id === "sunspots");
    expect(ss).toBeDefined();
    expect(ss?.anomalyType).toBe("sunspot");
  });

  it("all projects have completed <= total", () => {
    for (const p of projects) {
      expect(p.completed).toBeLessThanOrEqual(p.total);
    }
  });
});
