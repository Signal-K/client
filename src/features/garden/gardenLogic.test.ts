import { describe, expect, it } from "vitest";
import type { ProjectType } from "../onboarding/hubState";
import { assertNaming, hopById, hopRail } from "./catalog";
import {
  applyProjectRoster,
  ARCHIVE_STRUCTURE_INVENTORY_ITEM_IDS,
  AUTOMATON_STRUCTURE_NAMES,
  buildStructure,
  defaultGardenState,
  gardenLesson,
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

  it("exposes garden, landnam, and spectra hops", () => {
    expect(hopById("ssc.hop.landnam")?.href).toContain("playlandnam.space");
    expect(hopById("ssc.hop.garden")?.href).toContain("starsailors.space/game");
    expect(hopRail().map((hop) => hop.id)).toEqual([
      "ssc.hop.garden",
      "ssc.hop.landnam",
      "ssc.hop.spectra",
    ]);
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

  it("collapses asteroid and ice onto the same instruments without a second sprite", () => {
    expect(structuresForProjects(["asteroid-hunting", "ice-tracking"])).toEqual([
      "ssc.structure.telescope",
      "ssc.structure.satellite",
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
    expect(state.structures["ssc.structure.rover"].locked).toBe(true);
    expect(state.structures["ssc.structure.pad"].locked).toBe(false);
    expect(state.credits).toBe(80);
  });

  it("spends credits to raise a selected plot", () => {
    const armed = applyProjectRoster(defaultGardenState(), ["planet-hunting"]);
    const result = buildStructure(armed, "ssc.structure.telescope");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.state.credits).toBe(80 - 24);
    expect(result.state.structures["ssc.structure.telescope"].locked).toBe(false);
    expect(result.state.structures["ssc.structure.telescope"].tier).toBe(1);
  });

  it("refuses to build an unlisted plot or one the player cannot afford", () => {
    const fresh = defaultGardenState();
    const blocked = buildStructure(fresh, "ssc.structure.telescope");
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) expect(blocked.reason).toBe("locked");
    const poor = applyProjectRoster({ ...defaultGardenState(), credits: 5 }, ["planet-hunting"]);
    const unaffordable = buildStructure(poor, "ssc.structure.telescope");
    expect(unaffordable.ok).toBe(false);
    if (!unaffordable.ok) expect(unaffordable.reason).toBe("credits");
  });

  it("seeds owned inventory without charging again", () => {
    const seeded = seedOwnedStructures(defaultGardenState(), ["ssc.structure.telescope"]);
    expect(seeded.credits).toBe(80);
    expect(seeded.structures["ssc.structure.telescope"].locked).toBe(false);
    expect(seeded.structures["ssc.structure.rover"].locked).toBe(true);
  });

  it("raises a rover from owned inventory and spends CR for a rover plot", () => {
    const seeded = seedOwnedStructures(defaultGardenState(), ["ssc.structure.rover"]);
    expect(seeded.structures["ssc.structure.rover"].locked).toBe(false);
    const armed = applyProjectRoster(defaultGardenState(), ["rover-training"]);
    const result = buildStructure(armed, "ssc.structure.rover");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.state.credits).toBe(80 - 20);
    expect(result.state.structures["ssc.structure.rover"].locked).toBe(false);
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

  it("does not flash the roster while account state is loading or the player is returning", () => {
    expect(
      shouldAskForProjectRoster({
        prefsLoading: false,
        accountLoading: true,
        needsPreferencesPrompt: true,
        returning: false,
      })
    ).toBe(false);
    expect(
      shouldAskForProjectRoster({
        prefsLoading: false,
        accountLoading: false,
        needsPreferencesPrompt: true,
        returning: true,
        hasInterests: true,
      })
    ).toBe(false);
    expect(
      shouldAskForProjectRoster({
        prefsLoading: false,
        accountLoading: false,
        needsPreferencesPrompt: true,
        returning: true,
        hasInterests: false,
        hasRaisedInstrument: false,
      })
    ).toBe(false);
    expect(
      shouldAskForProjectRoster({
        prefsLoading: false,
        accountLoading: false,
        needsPreferencesPrompt: true,
        returning: false,
      })
    ).toBe(true);
  });

  it("teaches raise then classify then hop", () => {
    const fresh = defaultGardenState();
    expect(
      gardenLesson({ state: fresh, coachDone: false, classifiedThisVisit: false, classificationCount: 0 })
    ).toBe("raise");
    const armed = applyProjectRoster(fresh, ["planet-hunting"]);
    const built = buildStructure(armed, "ssc.structure.telescope");
    expect(built.ok).toBe(true);
    if (!built.ok) return;
    expect(
      gardenLesson({
        state: built.state,
        coachDone: false,
        classifiedThisVisit: false,
        classificationCount: 0,
      })
    ).toBe("classify");
    expect(
      gardenLesson({
        state: built.state,
        coachDone: false,
        classifiedThisVisit: true,
        classificationCount: 0,
      })
    ).toBe("hop");
    expect(
      gardenLesson({
        state: built.state,
        coachDone: true,
        classifiedThisVisit: true,
        classificationCount: 4,
      })
    ).toBe(null);
  });
});
