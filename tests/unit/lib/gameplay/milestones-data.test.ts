import { describe, it, expect } from "vitest";
import { milestones, communityMilestones } from "@/lib/gameplay/milestones-data";

describe("milestones data", () => {
  it("is a non-empty array", () => {
    expect(Array.isArray(milestones)).toBe(true);
    expect(milestones.length).toBeGreaterThan(0);
  });

  it("each milestone has a weekStart date string", () => {
    milestones.forEach((milestone) => {
      expect(milestone).toHaveProperty("weekStart");
      expect(typeof milestone.weekStart).toBe("string");
      // Validate date format YYYY-MM-DD
      expect(milestone.weekStart).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  it("each milestone has a non-empty data array", () => {
    milestones.forEach((milestone) => {
      expect(Array.isArray(milestone.data)).toBe(true);
      expect(milestone.data.length).toBeGreaterThan(0);
    });
  });

  it("each milestone item has required properties", () => {
    milestones.forEach((milestone) => {
      milestone.data.forEach((item) => {
        expect(item).toHaveProperty("name");
        expect(typeof item.name).toBe("string");
        expect(item.name.length).toBeGreaterThan(0);

        expect(item).toHaveProperty("structure");
        expect(typeof item.structure).toBe("string");

        expect(item).toHaveProperty("group");
        expect(typeof item.group).toBe("string");

        expect(item).toHaveProperty("icon");
        expect(typeof item.icon).toBe("string");

        expect(item).toHaveProperty("xp");
        expect(typeof item.xp).toBe("number");
        expect(item.xp).toBeGreaterThan(0);

        expect(item).toHaveProperty("table");
        expect(typeof item.table).toBe("string");

        expect(item).toHaveProperty("field");
        expect(typeof item.field).toBe("string");

        expect(item).toHaveProperty("value");
        expect(typeof item.value).toBe("string");

        expect(item).toHaveProperty("requiredCount");
        expect(typeof item.requiredCount).toBe("number");
        expect(item.requiredCount).toBeGreaterThan(0);
      });
    });
  });

  it("weekStart dates are valid dates", () => {
    milestones.forEach((milestone) => {
      const date = new Date(milestone.weekStart);
      expect(date.toString()).not.toBe("Invalid Date");
    });
  });

  it("has valid structure names", () => {
    const validStructures = ["Telescope", "WeatherBalloon", "Greenhouse"];
    milestones.forEach((milestone) => {
      milestone.data.forEach((item) => {
        expect(validStructures).toContain(item.structure);
      });
    });
  });

  it("has valid table names", () => {
    const validTables = ["classifications", "votes", "comments", "uploads", "events"];
    milestones.forEach((milestone) => {
      milestone.data.forEach((item) => {
        expect(validTables).toContain(item.table);
      });
    });
  });

  it("weekStart dates are in descending order", () => {
    for (let i = 0; i < milestones.length - 1; i++) {
      const current = new Date(milestones[i].weekStart).getTime();
      const next = new Date(milestones[i + 1].weekStart).getTime();
      expect(current).toBeGreaterThanOrEqual(next);
    }
  });
});

describe("communityMilestones data", () => {
  it("is a non-empty array", () => {
    expect(Array.isArray(communityMilestones)).toBe(true);
    expect(communityMilestones.length).toBeGreaterThan(0);
  });

  it("each community milestone has weekStart and data", () => {
    communityMilestones.forEach((milestone) => {
      expect(milestone).toHaveProperty("weekStart");
      expect(milestone.weekStart).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Array.isArray(milestone.data)).toBe(true);
      expect(milestone.data.length).toBeGreaterThan(0);
    });
  });

  it("each community milestone item has required properties", () => {
    communityMilestones.forEach((milestone) => {
      milestone.data.forEach((item) => {
        expect(item).toHaveProperty("name");
        expect(typeof item.name).toBe("string");

        expect(item).toHaveProperty("structure");
        expect(typeof item.structure).toBe("string");

        expect(item).toHaveProperty("icon");
        expect(typeof item.icon).toBe("string");

        expect(item).toHaveProperty("extendedDescription");
        expect(typeof item.extendedDescription).toBe("string");

        // xp can be null for community milestones
        expect(item).toHaveProperty("xp");
      });
    });
  });
});
