import { describe, it, expect } from "vitest";
import {
  UPGRADES_CONFIG,
  ResearchUpgrade,
  UpgradeCategory,
  UpgradeSubcategory,
} from "@/features/research/config/upgrades-config";

const mockUpgrades = {
  telescopeReceptors: 0,
  satelliteCount: 1,
  roverWaypoints: 4,
  spectroscopyUnlocked: false,
  findMineralsUnlocked: false,
  p4MineralsUnlocked: false,
  roverExtractionUnlocked: false,
  satelliteExtractionUnlocked: false,
  ngtsAccessUnlocked: true,
};

describe("UPGRADES_CONFIG", () => {
  it("exports a non-empty array", () => {
    expect(Array.isArray(UPGRADES_CONFIG)).toBe(true);
    expect(UPGRADES_CONFIG.length).toBeGreaterThan(0);
  });

  it("every upgrade has required fields", () => {
    for (const upgrade of UPGRADES_CONFIG) {
      expect(upgrade.id).toBeTruthy();
      expect(upgrade.techType).toBeTruthy();
      expect(upgrade.title).toBeTruthy();
      expect(upgrade.description).toBeTruthy();
      expect(["telescope", "satellite", "rover"]).toContain(upgrade.category);
      expect(["equipment", "project", "mining"]).toContain(upgrade.subcategory);
      expect(typeof upgrade.cost).toBe("number");
    }
  });

  it("has telescope-receptors upgrade", () => {
    const upgrade = UPGRADES_CONFIG.find((u) => u.id === "telescope-receptors");
    expect(upgrade).toBeDefined();
    expect(upgrade?.category).toBe("telescope");
    expect(upgrade?.subcategory).toBe("equipment");
    expect(upgrade?.max).toBe(2);
  });

  it("telescope-receptors getCurrent reads telescopeReceptors", () => {
    const upgrade = UPGRADES_CONFIG.find((u) => u.id === "telescope-receptors")!;
    expect(upgrade.getCurrent!(mockUpgrades)).toBe(0);
    expect(upgrade.getCurrent!({ ...mockUpgrades, telescopeReceptors: 2 })).toBe(2);
  });

  it("has satellite-count upgrade", () => {
    const upgrade = UPGRADES_CONFIG.find((u) => u.id === "satellite-count");
    expect(upgrade).toBeDefined();
    expect(upgrade?.category).toBe("satellite");
    expect(upgrade?.getCurrent!(mockUpgrades)).toBe(1);
  });

  it("has rover-waypoints upgrade", () => {
    const upgrade = UPGRADES_CONFIG.find((u) => u.id === "rover-waypoints");
    expect(upgrade).toBeDefined();
    expect(upgrade?.category).toBe("rover");
    expect(upgrade?.getCurrent!(mockUpgrades)).toBe(4);
  });

  it("spectroscopy isUnlocked reads spectroscopyUnlocked", () => {
    const upgrade = UPGRADES_CONFIG.find((u) => u.id === "spectroscopy")!;
    expect(upgrade.isUnlocked!(mockUpgrades)).toBe(false);
    expect(upgrade.isUnlocked!({ ...mockUpgrades, spectroscopyUnlocked: true })).toBe(true);
  });

  it("ngtsAccess isUnlocked reads ngtsAccessUnlocked", () => {
    const upgrade = UPGRADES_CONFIG.find((u) => u.id === "ngtsAccess")!;
    expect(upgrade.isUnlocked!(mockUpgrades)).toBe(true);
  });

  it("ngtsAccess getRequirement locks when planet count < 4", () => {
    const upgrade = UPGRADES_CONFIG.find((u) => u.id === "ngtsAccess")!;
    const data = { counts: { planet: 2 }, upgrades: mockUpgrades };
    const req = upgrade.getRequirement!(data);
    expect(req.isLocked).toBe(true);
    expect(req.text).toContain("2/4 planet classifications");
  });

  it("ngtsAccess getRequirement unlocks when planet count >= 4", () => {
    const upgrade = UPGRADES_CONFIG.find((u) => u.id === "ngtsAccess")!;
    const data = { counts: { planet: 4 }, upgrades: mockUpgrades };
    const req = upgrade.getRequirement!(data);
    expect(req.isLocked).toBe(false);
    expect(req.text).toBeUndefined();
  });

  it("findMinerals isUnlocked reads findMineralsUnlocked", () => {
    const upgrade = UPGRADES_CONFIG.find((u) => u.id === "findMinerals")!;
    expect(upgrade.isUnlocked!(mockUpgrades)).toBe(false);
    expect(upgrade.isUnlocked!({ ...mockUpgrades, findMineralsUnlocked: true })).toBe(true);
  });

  it("p4Minerals isUnlocked reads p4MineralsUnlocked", () => {
    const upgrade = UPGRADES_CONFIG.find((u) => u.id === "p4Minerals")!;
    expect(upgrade.isUnlocked!(mockUpgrades)).toBe(false);
  });

  it("roverExtraction getRequirement locks when findMinerals not unlocked", () => {
    const upgrade = UPGRADES_CONFIG.find((u) => u.id === "roverExtraction")!;
    const data = { upgrades: mockUpgrades, counts: {} };
    const req = upgrade.getRequirement!(data);
    expect(req.isLocked).toBe(true);
    expect(req.text).toBe("Requires Mineral Detection");
  });

  it("roverExtraction getRequirement unlocks when findMinerals unlocked", () => {
    const upgrade = UPGRADES_CONFIG.find((u) => u.id === "roverExtraction")!;
    const data = { upgrades: { ...mockUpgrades, findMineralsUnlocked: true }, counts: {} };
    const req = upgrade.getRequirement!(data);
    expect(req.isLocked).toBe(false);
    expect(req.text).toBeUndefined();
  });

  it("satelliteExtraction getRequirement locks when p4Minerals not unlocked", () => {
    const upgrade = UPGRADES_CONFIG.find((u) => u.id === "satelliteExtraction")!;
    const data = { upgrades: mockUpgrades, counts: {} };
    const req = upgrade.getRequirement!(data);
    expect(req.isLocked).toBe(true);
    expect(req.text).toBe("Requires Ice Detection");
  });

  it("satelliteExtraction getRequirement unlocks when p4Minerals unlocked", () => {
    const upgrade = UPGRADES_CONFIG.find((u) => u.id === "satelliteExtraction")!;
    const data = { upgrades: { ...mockUpgrades, p4MineralsUnlocked: true }, counts: {} };
    const req = upgrade.getRequirement!(data);
    expect(req.isLocked).toBe(false);
  });
});

describe("Type exports", () => {
  it("UpgradeCategory type accepts valid values", () => {
    const cat: UpgradeCategory = "telescope";
    expect(["telescope", "satellite", "rover"]).toContain(cat);
  });

  it("UpgradeSubcategory type accepts valid values", () => {
    const sub: UpgradeSubcategory = "mining";
    expect(["equipment", "project", "mining"]).toContain(sub);
  });

  it("ResearchUpgrade interface is satisfied by UPGRADES_CONFIG items", () => {
    const item: ResearchUpgrade = UPGRADES_CONFIG[0];
    expect(item.id).toBeTruthy();
  });
});
