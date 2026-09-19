import { describe, expect, it } from "vitest";
import type { ProjectType } from "../onboarding/hubState";
import { assertNaming } from "./catalog";
import {
  applyProjectRoster,
  ARCHIVE_STRUCTURE_INVENTORY_ITEM_IDS,
  AUTOMATON_STRUCTURE_NAMES,
  buildStructure,
  defaultGardenState,
  GARDEN_STORAGE_KEY,
  hydrateGardenState,
  isPristineGarden,
  isUntouchedLegacyGarden,
  projectsForStructures,
  seedOwnedStructures,
  shouldAskForProjectRoster,
  structuresForProjects,
  structuresFromAutomatons,
  structuresFromInventoryItems,
} from "./gardenLogic";

describe("garden catalog naming", () => {
  it("still passes with build costs on science structures", () => {
    expect(assertNaming()).toBeGreaterThan(0);
  });
});

describe("project roster", () => {
  it("maps selected projects onto the instruments they need", () => {
    const interests: ProjectType[] = ["planet-hunting", "cloud-tracking", "solar-monitoring"];
    expect(structuresForProjects(interests)).toEqual([
      "ssc.structure.telescope",
      "ssc.structure.satellite",
      "ssc.structure.solar",
    ]);
  });

  it("only arms plots for the chosen projects", () => {
    const next = applyProjectRoster(defaultGardenState(), ["planet-hunting"]);
    expect(next.structures["ssc.structure.telescope"].buildable).toBe(true);
    expect(next.structures["ssc.structure.telescope"].locked).toBe(true);
    expect(next.structures["ssc.structure.satellite"].buildable).toBe(false);
    expect(next.structures["ssc.structure.habitat"].locked).toBe(false);
  });
});

describe("building structures", () => {
  it("starts science instruments locked so they must be bought", () => {
    const state = defaultGardenState();
    expect(state.structures["ssc.structure.telescope"].locked).toBe(true);
    expect(state.structures["ssc.structure.satellite"].locked).toBe(true);
    expect(state.structures["ssc.structure.solar"].locked).toBe(true);
    expect(state.structures["ssc.structure.pad"].locked).toBe(false);
    expect(state.credits).toBe(80);
  });

  it("spends credits to raise a selected plot", () => {
    const armed = applyProjectRoster(defaultGardenState(), ["planet-hunting"]);
    const result = buildStructure(armed, "ssc.structure.telescope", 2);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.state.credits).toBe(80 - 24);
    expect(result.state.structures["ssc.structure.telescope"].locked).toBe(false);
    expect(result.state.structures["ssc.structure.telescope"].tier).toBe(1);
    expect(result.state.structures["ssc.structure.telescope"].slot).toBe(2);
  });

  it("places instruments on distinct, valid slots only", () => {
    const armed = applyProjectRoster(defaultGardenState(), ["planet-hunting", "cloud-tracking"]);
    const first = buildStructure(armed, "ssc.structure.telescope", 1);
    expect(first.ok).toBe(true);
    if (!first.ok) return;
    const taken = buildStructure(first.state, "ssc.structure.satellite", 1);
    expect(taken.ok).toBe(false);
    if (!taken.ok) expect(taken.reason).toBe("slot");
    for (const bad of [-1, 5, 1.5, Number.NaN]) {
      const result = buildStructure(armed, "ssc.structure.satellite", bad);
      expect(result.ok).toBe(false);
    }
    expect(buildStructure(first.state, "ssc.structure.satellite", 0).ok).toBe(true);
  });

  it("refuses to build an unlisted plot or one the player cannot afford", () => {
    const fresh = defaultGardenState();
    const blocked = buildStructure(fresh, "ssc.structure.telescope", 0);
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) expect(blocked.reason).toBe("locked");
    const poor = applyProjectRoster({ ...defaultGardenState(), credits: 5 }, ["planet-hunting"]);
    const unaffordable = buildStructure(poor, "ssc.structure.telescope", 0);
    expect(unaffordable.ok).toBe(false);
    if (!unaffordable.ok) expect(unaffordable.reason).toBe("credits");
  });

  it("seeds owned inventory without charging again", () => {
    const seeded = seedOwnedStructures(defaultGardenState(), ["ssc.structure.telescope"]);
    expect(seeded.credits).toBe(80);
    expect(seeded.structures["ssc.structure.telescope"].locked).toBe(false);
    expect(seeded.structures["ssc.structure.rover"].locked).toBe(true);
  });
});

describe("account recovery", () => {
  it("maps legacy inventory and automaton rows onto garden ids", () => {
    expect(structuresFromInventoryItems([3103, 24, 23])).toEqual([
      "ssc.structure.satellite",
      "ssc.structure.rover",
    ]);
    expect(structuresFromAutomatons(["Telescope", "TelescopeSolar"])).toEqual([
      "ssc.structure.telescope",
      "ssc.structure.solar",
    ]);
    expect(ARCHIVE_STRUCTURE_INVENTORY_ITEM_IDS).not.toContain(3103);
    expect(AUTOMATON_STRUCTURE_NAMES).toContain("TelescopePlanet");
    expect(GARDEN_STORAGE_KEY).toBe("ssc.garden.v3");
    expect(projectsForStructures(["ssc.structure.telescope", "ssc.structure.solar"])).toEqual([
      "planet-hunting",
      "solar-monitoring",
    ]);
  });

  it("discards a default v1 garden that never spent credits or classified", () => {
    const untouched = defaultGardenState();
    untouched.structures["ssc.structure.telescope"] = {
      ...untouched.structures["ssc.structure.telescope"],
      locked: false,
      tier: 1,
    };
    expect(isUntouchedLegacyGarden(untouched)).toBe(true);
    expect(isUntouchedLegacyGarden({ ...untouched, credits: 56 })).toBe(false);
  });

  it("does not treat a spent or built garden as a disposable leftover", () => {
    expect(isPristineGarden(defaultGardenState())).toBe(true);
    const spent = { ...defaultGardenState(), credits: 56 };
    expect(isPristineGarden(spent)).toBe(false);
    expect(isPristineGarden(hydrateGardenState({ credits: 80, structures: {} }))).toBe(true);
  });

  it("asks a pristine garden for a roster once account state has loaded", () => {
    expect(shouldAskForProjectRoster({ prefsLoading: false, accountLoading: true, gardenPristine: true })).toBe(false);
    expect(shouldAskForProjectRoster({ prefsLoading: true, accountLoading: false, gardenPristine: true })).toBe(false);
    expect(shouldAskForProjectRoster({ prefsLoading: false, accountLoading: false, gardenPristine: true })).toBe(true);
    expect(shouldAskForProjectRoster({ prefsLoading: false, accountLoading: false, gardenPristine: false })).toBe(false);
  });
});
