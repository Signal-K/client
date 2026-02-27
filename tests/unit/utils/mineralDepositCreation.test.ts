import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  selectCloudMineral,
  selectJovianMineral,
  selectPlanetFourMineral,
  attemptMineralDepositCreation,
} from "@/utils/mineralDepositCreation";

describe("selectCloudMineral", () => {
  it("returns a valid mineral config", () => {
    const result = selectCloudMineral();
    expect(result).toHaveProperty("type");
    expect(result).toHaveProperty("amount");
    expect(result).toHaveProperty("purity");
    expect(result).toHaveProperty("metadata");
  });

  it("type is either water-ice or co2-ice", () => {
    // Run multiple times to cover both paths
    const types = new Set<string>();
    for (let i = 0; i < 50; i++) {
      types.add(selectCloudMineral().type);
    }
    types.forEach((t) => {
      expect(["water-ice", "co2-ice"]).toContain(t);
    });
  });

  it("amount is between 50 and 150", () => {
    for (let i = 0; i < 20; i++) {
      const result = selectCloudMineral();
      expect(result.amount).toBeGreaterThanOrEqual(50);
      expect(result.amount).toBeLessThan(150);
    }
  });

  it("purity is between 0.7 and 1.0", () => {
    for (let i = 0; i < 20; i++) {
      const result = selectCloudMineral();
      expect(result.purity).toBeGreaterThanOrEqual(0.7);
      expect(result.purity).toBeLessThan(1.0);
    }
  });

  it("metadata has cloud-classification source", () => {
    const result = selectCloudMineral();
    expect(result.metadata?.source).toBe("cloud-classification");
    expect(result.metadata?.discoveryMethod).toBe("spectral-analysis");
  });

  it("returns water-ice when random < 0.5", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.0);
    const result = selectCloudMineral();
    expect(result.type).toBe("water-ice");
    vi.restoreAllMocks();
  });

  it("returns co2-ice when random >= 0.5", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.99);
    const result = selectCloudMineral();
    expect(result.type).toBe("co2-ice");
    vi.restoreAllMocks();
  });
});

describe("selectJovianMineral", () => {
  it("returns a valid mineral config", () => {
    const result = selectJovianMineral();
    expect(result).toHaveProperty("type");
    expect(result).toHaveProperty("amount");
    expect(result).toHaveProperty("purity");
    expect(result).toHaveProperty("metadata");
  });

  it("type is one of the jovian minerals", () => {
    const validTypes = ["metallic-hydrogen", "metallic-helium", "methane", "ammonia"];
    for (let i = 0; i < 50; i++) {
      expect(validTypes).toContain(selectJovianMineral().type);
    }
  });

  it("amount is between 100 and 600", () => {
    for (let i = 0; i < 20; i++) {
      const result = selectJovianMineral();
      expect(result.amount).toBeGreaterThanOrEqual(100);
      expect(result.amount).toBeLessThan(600);
    }
  });

  it("purity is between 0.6 and 1.0", () => {
    for (let i = 0; i < 20; i++) {
      const result = selectJovianMineral();
      expect(result.purity).toBeGreaterThanOrEqual(0.6);
      expect(result.purity).toBeLessThan(1.0);
    }
  });

  it("metadata has jovian source", () => {
    const result = selectJovianMineral();
    expect(result.metadata?.source).toBe("jovian-vortex-analysis");
    expect(result.metadata).toHaveProperty("atmosphericPressure");
    expect(result.metadata).toHaveProperty("depth");
  });

  it("returns metallic-hydrogen when roll < 0.50", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.1);
    const result = selectJovianMineral();
    expect(result.type).toBe("metallic-hydrogen");
    vi.restoreAllMocks();
  });

  it("returns metallic-helium when roll 0.50-0.75", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.6);
    const result = selectJovianMineral();
    expect(result.type).toBe("metallic-helium");
    vi.restoreAllMocks();
  });

  it("returns methane when roll 0.75-0.90", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.8);
    const result = selectJovianMineral();
    expect(result.type).toBe("methane");
    vi.restoreAllMocks();
  });

  it("returns ammonia when roll >= 0.90", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.95);
    const result = selectJovianMineral();
    expect(result.type).toBe("ammonia");
    vi.restoreAllMocks();
  });
});

describe("selectPlanetFourMineral", () => {
  it("returns a valid mineral config", () => {
    const result = selectPlanetFourMineral();
    expect(result).toHaveProperty("type");
    expect(result).toHaveProperty("amount");
    expect(result).toHaveProperty("purity");
    expect(result).toHaveProperty("metadata");
  });

  it("type is one of the Mars surface minerals", () => {
    const validTypes = ["soil", "dust", "water-vapour"];
    for (let i = 0; i < 50; i++) {
      expect(validTypes).toContain(selectPlanetFourMineral().type);
    }
  });

  it("amount is between 20 and 100", () => {
    for (let i = 0; i < 20; i++) {
      const result = selectPlanetFourMineral();
      expect(result.amount).toBeGreaterThanOrEqual(20);
      expect(result.amount).toBeLessThan(100);
    }
  });

  it("purity is between 0.5 and 1.0", () => {
    for (let i = 0; i < 20; i++) {
      const result = selectPlanetFourMineral();
      expect(result.purity).toBeGreaterThanOrEqual(0.5);
      expect(result.purity).toBeLessThan(1.0);
    }
  });

  it("metadata has surface-analysis source", () => {
    const result = selectPlanetFourMineral();
    expect(result.metadata?.source).toBe("surface-analysis");
  });

  it("returns dust when roll < 0.40", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.1);
    const result = selectPlanetFourMineral();
    expect(result.type).toBe("dust");
    vi.restoreAllMocks();
  });

  it("returns soil when roll 0.40-0.70", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const result = selectPlanetFourMineral();
    expect(result.type).toBe("soil");
    vi.restoreAllMocks();
  });

  it("returns water-vapour when roll >= 0.70", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.8);
    const result = selectPlanetFourMineral();
    expect(result.type).toBe("water-vapour");
    vi.restoreAllMocks();
  });

  it("sets surfaceType to polar for water-vapour", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.8);
    const result = selectPlanetFourMineral();
    expect(result.metadata?.surfaceType).toBe("polar");
    vi.restoreAllMocks();
  });

  it("sets surfaceType to equatorial for non-water-vapour", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.1);
    const result = selectPlanetFourMineral();
    expect(result.metadata?.surfaceType).toBe("equatorial");
    vi.restoreAllMocks();
  });

  it("preserves annotations in metadata", () => {
    const annotations = [{ x: 1, y: 2 }];
    vi.spyOn(Math, "random").mockReturnValue(0.1);
    const result = selectPlanetFourMineral(annotations);
    expect(result.metadata?.annotations).toEqual(annotations);
    vi.restoreAllMocks();
  });

  it("defaults annotations to empty array", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.1);
    const result = selectPlanetFourMineral();
    expect(result.metadata?.annotations).toEqual([]);
    vi.restoreAllMocks();
  });
});

describe("attemptMineralDepositCreation", () => {
  const baseParams = {
    userId: "user-1",
    anomalyId: 99,
    classificationId: 10,
    mineralConfig: { type: "soil" as const },
  };

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("returns false when user has no mineral research", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    } as Response);

    
    const result = await attemptMineralDepositCreation(baseParams);
    expect(result).toBe(false);
  });

  it("returns false when hasMineralResearch throws", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockRejectedValueOnce(new Error("network error"));

    
    const result = await attemptMineralDepositCreation(baseParams);
    expect(result).toBe(false);
  });

  it("returns false when planet is not compatible (no classifications)", async () => {
    const fetchMock = vi.mocked(fetch);
    // hasMineralResearch → true
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ inventory: [{ id: 1 }] }),
    } as Response);
    // isPlanetCompatible – classification fetch (for classificationId)
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ classifications: [] }),
    } as Response);
    // isPlanetCompatible – planet classifications
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ classifications: [] }),
    } as Response);

    
    const result = await attemptMineralDepositCreation(baseParams);
    expect(result).toBe(false);
  });

  it("returns false when roll fails (> 1/3)", async () => {
    const fetchMock = vi.mocked(fetch);
    // hasMineralResearch
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ inventory: [{ id: 1 }] }),
    } as Response);
    // isPlanetCompatible – classification fetch
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ classifications: [] }),
    } as Response);
    // isPlanetCompatible – planet classifications (has stats)
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        classifications: [{ classificationConfiguration: { planet_mass: "5.0", planet_radius: "1.2" } }],
      }),
    } as Response);

    vi.spyOn(Math, "random").mockReturnValue(0.9); // > 1/3 → roll fails

    
    const result = await attemptMineralDepositCreation(baseParams);
    expect(result).toBe(false);
  });

  it("returns true when research + compatible planet + roll succeeds + deposit created", async () => {
    const fetchMock = vi.mocked(fetch);
    // hasMineralResearch
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ inventory: [{ id: 1 }] }),
    } as Response);
    // isPlanetCompatible – classification fetch
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ classifications: [] }),
    } as Response);
    // isPlanetCompatible – planet classifications (has stats)
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        classifications: [{ classificationConfiguration: { planet_mass: "5.0", planet_radius: "1.2" } }],
      }),
    } as Response);
    // createMineralDeposit
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 42 }),
    } as Response);

    vi.spyOn(Math, "random").mockReturnValue(0.1); // < 1/3 → roll succeeds

    
    const result = await attemptMineralDepositCreation(baseParams);
    expect(result).toBe(true);
  });
});
