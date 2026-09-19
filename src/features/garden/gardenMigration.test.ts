import { describe, expect, it } from "vitest";
import { defaultGardenState, GARDEN_GENERATION, hydrateGardenState, needsGardenOnboarding } from "./gardenLogic";
import { migrateHubRow } from "./gardenMigration";

const legacyGarden = () => {
  const garden = defaultGardenState();
  delete garden.generation;
  garden.credits = 312;
  garden.structures["ssc.structure.telescope"] = { ...garden.structures["ssc.structure.telescope"], locked: false, tier: 3, tendedAt: 5 };
  return garden;
};

describe("legacy account migration", () => {
  it("archives the old onboarding and garden verbatim and restarts with credits kept", () => {
    const garden = legacyGarden();
    const onboarding = { hasCompletedOnboarding: true, projectInterests: ["planet-hunting"] };
    const next = migrateHubRow({ onboarding, garden }, new Date("2026-09-19T00:00:00Z"))!;
    expect(next.legacyArchive).toEqual({
      archivedAt: "2026-09-19T00:00:00.000Z",
      fromGeneration: 0,
      onboarding,
      garden,
    });
    expect(next.onboarding.hasCompletedOnboarding).toBe(false);
    expect(next.garden.credits).toBe(312);
    expect(next.garden.generation).toBe(GARDEN_GENERATION);
    expect(needsGardenOnboarding(next.garden)).toBe(true);
    expect(next.garden.structures["ssc.structure.telescope"].locked).toBe(true);
  });

  it("is idempotent", () => {
    const first = migrateHubRow({ onboarding: {}, garden: legacyGarden() })!;
    expect(migrateHubRow({ onboarding: first.onboarding, garden: first.garden, legacyArchive: first.legacyArchive })).toBeNull();
    expect(migrateHubRow({ garden: first.garden })).toBeNull();
  });

  it("handles accounts that never had a garden", () => {
    const next = migrateHubRow({ onboarding: null, garden: null })!;
    expect(next.garden.credits).toBe(80);
    expect(next.legacyArchive.garden).toBeNull();
  });

  it("restarts a legacy garden at runtime too, keeping credits (e.g. stale localStorage)", () => {
    const restarted = hydrateGardenState(legacyGarden());
    expect(restarted.credits).toBe(312);
    expect(needsGardenOnboarding(restarted)).toBe(true);
  });

  it("keeps a current-generation garden untouched", () => {
    const garden = defaultGardenState();
    garden.credits = 41;
    garden.structures["ssc.structure.telescope"] = { ...garden.structures["ssc.structure.telescope"], locked: false, tier: 2 };
    expect(hydrateGardenState(garden).structures["ssc.structure.telescope"].tier).toBe(2);
    expect(needsGardenOnboarding(garden)).toBe(false);
  });
});
