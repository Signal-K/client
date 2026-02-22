import { describe, it, expect, vi } from "vitest";
import { generateAnomalyProperties } from "@/components/classification/telescope/blocks/viewport/constants";

// Mock the sector-utils import
vi.mock("@/src/components/classification/telescope/utils/sector-utils", () => ({
  seededRandom: (seed: number, index: number) => {
    const x = Math.sin(seed + index) * 10000;
    return x - Math.floor(x);
  },
  generateSectorName: (x: number, y: number) => `Sector-${x}-${y}`,
}));

describe("generateAnomalyProperties", () => {
  const makeDbAnomaly = (overrides: any = {}) => ({
    id: 1,
    content: "Test Content",
    anomalytype: null,
    avatar_url: null,
    created_at: "2025-01-01",
    configuration: {},
    parentAnomaly: null,
    anomalySet: null,
    ...overrides,
  });

  it("returns anomaly with correct id format", () => {
    const result = generateAnomalyProperties(makeDbAnomaly({ id: 42 }));
    expect(result.id).toBe("db-42");
  });

  it("uses content as name when available", () => {
    const result = generateAnomalyProperties(makeDbAnomaly({ content: "My Star" }));
    expect(result.name).toBe("My Star");
  });

  it("generates name when content is null", () => {
    const result = generateAnomalyProperties(makeDbAnomaly({ id: 5, content: null }));
    expect(result.name).toContain("005");
  });

  it("normalizes planet to exoplanet", () => {
    const result = generateAnomalyProperties(makeDbAnomaly({ anomalySet: "planet" }));
    expect(result.type).toBe("exoplanet");
    expect(result.project).toBe("planet-hunters");
  });

  it("normalizes telescope-tess to exoplanet", () => {
    const result = generateAnomalyProperties(makeDbAnomaly({ anomalySet: "telescope-tess" }));
    expect(result.type).toBe("exoplanet");
  });

  it("normalizes telescope-minorPlanet to asteroid", () => {
    const result = generateAnomalyProperties(makeDbAnomaly({ anomalySet: "telescope-minorPlanet" }));
    expect(result.type).toBe("asteroid");
    expect(result.project).toBe("daily-minor-planet");
  });

  it("normalizes active-asteroids to asteroid", () => {
    const result = generateAnomalyProperties(makeDbAnomaly({ anomalySet: "active-asteroids" }));
    expect(result.type).toBe("asteroid");
  });

  it("normalizes diskDetective to accretion_disc", () => {
    const result = generateAnomalyProperties(makeDbAnomaly({ anomalySet: "diskDetective" }));
    expect(result.type).toBe("accretion_disc");
    expect(result.project).toBe("disk-detective");
  });

  it("normalizes telescope-awa to accretion_disc", () => {
    const result = generateAnomalyProperties(makeDbAnomaly({ anomalySet: "telescope-awa" }));
    expect(result.type).toBe("accretion_disc");
  });

  it("normalizes superwasp-variable to variable_star", () => {
    const result = generateAnomalyProperties(makeDbAnomaly({ anomalySet: "superwasp-variable" }));
    expect(result.type).toBe("variable_star");
    expect(result.project).toBe("superwasp-variable");
  });

  it("normalizes telescope-superwasp-variable to variable_star", () => {
    const result = generateAnomalyProperties(makeDbAnomaly({ anomalySet: "telescope-superwasp-variable" }));
    expect(result.type).toBe("variable_star");
  });

  it("normalizes sunspot to sunspot", () => {
    const result = generateAnomalyProperties(makeDbAnomaly({ anomalySet: "sunspot" }));
    expect(result.type).toBe("sunspot");
    expect(result.project).toBe("sunspots");
  });

  it("defaults unknown anomalySet to exoplanet", () => {
    const result = generateAnomalyProperties(makeDbAnomaly({ anomalySet: "unknown-set" }));
    expect(result.type).toBe("exoplanet");
  });

  it("defaults null anomalySet to exoplanet", () => {
    const result = generateAnomalyProperties(makeDbAnomaly({ anomalySet: null }));
    expect(result.type).toBe("exoplanet");
  });

  it("generates valid coordinate ranges", () => {
    const result = generateAnomalyProperties(makeDbAnomaly());
    expect(result.x).toBeGreaterThanOrEqual(10);
    expect(result.x).toBeLessThanOrEqual(90);
    expect(result.y).toBeGreaterThanOrEqual(10);
    expect(result.y).toBeLessThanOrEqual(90);
  });

  it("generates valid brightness range (0.5-1.2)", () => {
    const result = generateAnomalyProperties(makeDbAnomaly());
    expect(result.brightness).toBeGreaterThanOrEqual(0.5);
    expect(result.brightness).toBeLessThanOrEqual(1.2);
  });

  it("generates valid size range (0.6-1.4)", () => {
    const result = generateAnomalyProperties(makeDbAnomaly());
    expect(result.size).toBeGreaterThanOrEqual(0.6);
    expect(result.size).toBeLessThanOrEqual(1.4);
  });

  it("attaches dbData to result", () => {
    const db = makeDbAnomaly({ id: 99 });
    const result = generateAnomalyProperties(db);
    expect(result.dbData).toEqual(db);
  });

  it("is deterministic for same input", () => {
    const db = makeDbAnomaly({ id: 10 });
    const r1 = generateAnomalyProperties(db);
    const r2 = generateAnomalyProperties(db);
    expect(r1.x).toBe(r2.x);
    expect(r1.y).toBe(r2.y);
    expect(r1.color).toBe(r2.color);
  });

  it("has discoveryDate as a string", () => {
    const result = generateAnomalyProperties(makeDbAnomaly());
    expect(typeof result.discoveryDate).toBe("string");
  });

  it("color is a valid hex string from config", () => {
    const result = generateAnomalyProperties(makeDbAnomaly());
    expect(result.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });
});
