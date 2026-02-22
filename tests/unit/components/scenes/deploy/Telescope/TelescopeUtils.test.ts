import { describe, it, expect, vi } from "vitest";
import {
  seededRandom1,
  generateAnomalyFromDBFactory,
} from "@/components/scenes/deploy/Telescope/TelescopeUtils";
import type { DatabaseAnomaly } from "@/components/scenes/deploy/Telescope/TelescopeUtils";

describe("seededRandom1", () => {
  it("returns a value between 0 and 1", () => {
    for (let i = 0; i < 100; i++) {
      const val = seededRandom1(i, i * 7);
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(1);
    }
  });

  it("is deterministic", () => {
    expect(seededRandom1(42, 0)).toBe(seededRandom1(42, 0));
    expect(seededRandom1(100, 5)).toBe(seededRandom1(100, 5));
  });

  it("defaults salt to 0", () => {
    expect(seededRandom1(42)).toBe(seededRandom1(42, 0));
  });

  it("produces different values for different seeds", () => {
    expect(seededRandom1(1)).not.toBe(seededRandom1(2));
  });

  it("produces different values for different salts", () => {
    expect(seededRandom1(42, 0)).not.toBe(seededRandom1(42, 1));
  });
});

describe("generateAnomalyFromDBFactory", () => {
  const makeDbAnomaly = (overrides: Partial<DatabaseAnomaly> = {}): DatabaseAnomaly => ({
    id: 1,
    content: "Test Anomaly",
    anomalytype: "planet",
    avatar_url: null,
    created_at: "2025-01-01T00:00:00Z",
    configuration: {},
    parentAnomaly: null,
    anomalySet: null,
    ...overrides,
  });

  it("returns a function", () => {
    const factory = generateAnomalyFromDBFactory("stellar");
    expect(typeof factory).toBe("function");
  });

  it("generates anomaly with correct id format", () => {
    const gen = generateAnomalyFromDBFactory("stellar");
    const anomaly = gen(makeDbAnomaly({ id: 42 }), 0, 0);
    expect(anomaly.id).toBe("db-42");
  });

  it("uses content as name when available", () => {
    const gen = generateAnomalyFromDBFactory("stellar");
    const anomaly = gen(makeDbAnomaly({ content: "My Planet" }), 0, 0);
    expect(anomaly.name).toBe("My Planet");
  });

  it("generates name from deployment type when content is null (stellar)", () => {
    const gen = generateAnomalyFromDBFactory("stellar");
    const anomaly = gen(makeDbAnomaly({ id: 5, content: null }), 0, 0);
    expect(anomaly.name).toBe("DSK-005");
  });

  it("generates name from deployment type when content is null (planetary)", () => {
    const gen = generateAnomalyFromDBFactory("planetary");
    const anomaly = gen(makeDbAnomaly({ id: 5, content: null }), 0, 0);
    expect(anomaly.name).toBe("TESS-005");
  });

  it("maps telescope-minorPlanet to asteroid type", () => {
    const gen = generateAnomalyFromDBFactory("stellar");
    const anomaly = gen(makeDbAnomaly({ anomalySet: "telescope-minorPlanet" }), 0, 0);
    expect(anomaly.type).toBe("asteroid");
    expect(anomaly.color).toBe("#f2c572");
    expect(anomaly.shape).toBe("triangle");
    expect(anomaly.project).toBe("daily-minor-planet");
  });

  it("maps diskDetective to sunspot type", () => {
    const gen = generateAnomalyFromDBFactory("stellar");
    const anomaly = gen(makeDbAnomaly({ anomalySet: "diskDetective" }), 0, 0);
    expect(anomaly.type).toBe("sunspot");
    expect(anomaly.color).toBe("#ff6b6b");
    expect(anomaly.shape).toBe("star");
    expect(anomaly.project).toBe("disk-detective");
  });

  it("maps superwasp-variable to sunspot type", () => {
    const gen = generateAnomalyFromDBFactory("stellar");
    const anomaly = gen(makeDbAnomaly({ anomalySet: "superwasp-variable" }), 0, 0);
    expect(anomaly.type).toBe("sunspot");
    expect(anomaly.project).toBe("superwasp-variable");
  });

  it("maps telescope-superwasp-variable to sunspot type", () => {
    const gen = generateAnomalyFromDBFactory("stellar");
    const anomaly = gen(makeDbAnomaly({ anomalySet: "telescope-superwasp-variable" }), 0, 0);
    expect(anomaly.type).toBe("sunspot");
    expect(anomaly.project).toBe("superwasp-variable");
  });

  it("maps telescope-tess to planet-hunters project", () => {
    const gen = generateAnomalyFromDBFactory("stellar");
    const anomaly = gen(makeDbAnomaly({ anomalySet: "telescope-tess" }), 0, 0);
    expect(anomaly.type).toBe("planet");
    expect(anomaly.project).toBe("planet-hunters");
  });

  it("maps active-asteroids to asteroid type", () => {
    const gen = generateAnomalyFromDBFactory("stellar");
    const anomaly = gen(makeDbAnomaly({ anomalySet: "active-asteroids" }), 0, 0);
    expect(anomaly.type).toBe("asteroid");
    expect(anomaly.project).toBe("active-asteroids");
  });

  it("defaults to planet type for unmapped anomalySet", () => {
    const gen = generateAnomalyFromDBFactory("stellar");
    const anomaly = gen(makeDbAnomaly({ anomalySet: null }), 0, 0);
    expect(anomaly.type).toBe("planet");
    expect(anomaly.project).toBe("planet-hunters");
  });

  it("generates valid coordinate ranges", () => {
    const gen = generateAnomalyFromDBFactory("stellar");
    const anomaly = gen(makeDbAnomaly(), 5, 5);
    expect(anomaly.x).toBeGreaterThanOrEqual(10);
    expect(anomaly.x).toBeLessThanOrEqual(90);
    expect(anomaly.y).toBeGreaterThanOrEqual(10);
    expect(anomaly.y).toBeLessThanOrEqual(90);
  });

  it("generates valid brightness/size/pulse/glow ranges", () => {
    const gen = generateAnomalyFromDBFactory("stellar");
    const anomaly = gen(makeDbAnomaly(), 0, 0);
    expect(anomaly.brightness).toBeGreaterThanOrEqual(0.5);
    expect(anomaly.brightness).toBeLessThanOrEqual(1.2);
    expect(anomaly.size).toBeGreaterThanOrEqual(0.6);
    expect(anomaly.size).toBeLessThanOrEqual(1.4);
    expect(anomaly.pulseSpeed).toBeGreaterThanOrEqual(1);
    expect(anomaly.pulseSpeed).toBeLessThanOrEqual(3);
    expect(anomaly.glowIntensity).toBeGreaterThanOrEqual(0.3);
    expect(anomaly.glowIntensity).toBeLessThanOrEqual(0.8);
  });

  it("attaches dbData to the output", () => {
    const gen = generateAnomalyFromDBFactory("stellar");
    const db = makeDbAnomaly({ id: 99 });
    const anomaly = gen(db, 0, 0);
    expect(anomaly.dbData).toEqual(db);
  });

  it("is deterministic for same inputs", () => {
    const gen = generateAnomalyFromDBFactory("stellar");
    const db = makeDbAnomaly({ id: 10 });
    const a1 = gen(db, 3, 4);
    const a2 = gen(db, 3, 4);
    expect(a1.x).toBe(a2.x);
    expect(a1.y).toBe(a2.y);
    expect(a1.name).toBe(a2.name);
  });
});
