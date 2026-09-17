import { describe, expect, it } from "vitest";
import { defaultGardenState, hydrateGardenState, isPristineGarden } from "../garden/gardenLogic";
import {
  applyHubStatePatch,
  defaultOnboarding,
  hasAccountOnboarding,
  mergeOnboarding,
  needsRosterPrompt,
  parseOnboarding,
} from "./hubState";

describe("hub onboarding parse", () => {
  it("returns defaults for empty input", () => {
    expect(parseOnboarding(null)).toEqual(defaultOnboarding());
    expect(parseOnboarding("nope")).toEqual(defaultOnboarding());
  });

  it("keeps known projects and drops unknown ones", () => {
    const parsed = parseOnboarding({
      projectInterests: ["planet-hunting", "not-a-project", "solar-monitoring"],
      hasCompletedOnboarding: true,
      inProgressStep: "structure-intro",
      inProgressProject: "planet-hunting",
      telescopeFocus: "planetary",
    });
    expect(parsed.projectInterests).toEqual(["planet-hunting", "solar-monitoring"]);
    expect(parsed.hasCompletedOnboarding).toBe(true);
    expect(parsed.inProgressStep).toBe("structure-intro");
    expect(parsed.inProgressProject).toBe("planet-hunting");
    expect(parsed.telescopeFocus).toBe("planetary");
  });

  it("treats completed onboarding or a roster as account state", () => {
    expect(hasAccountOnboarding(defaultOnboarding())).toBe(false);
    expect(needsRosterPrompt(defaultOnboarding())).toBe(true);
    expect(hasAccountOnboarding({ ...defaultOnboarding(), hasCompletedOnboarding: true })).toBe(true);
    expect(hasAccountOnboarding({ ...defaultOnboarding(), projectInterests: ["cloud-tracking"] })).toBe(true);
    expect(needsRosterPrompt({ ...defaultOnboarding(), projectInterests: ["cloud-tracking"] })).toBe(false);
  });
});

describe("hub onboarding merge", () => {
  it("replaces tutorial completions so a reset can drop a flag", () => {
    const base = parseOnboarding({
      completedTutorials: { "init-seen": true, "telescope-intro": true },
    });
    const merged = mergeOnboarding(base, { completedTutorials: { "init-seen": true } });
    expect(merged.completedTutorials).toEqual({ "init-seen": true });
  });

  it("keeps existing fields when a patch only updates progress", () => {
    const base = parseOnboarding({
      projectInterests: ["planet-hunting"],
      hasCompletedOnboarding: false,
    });
    const merged = mergeOnboarding(base, {
      inProgressStep: "project-selection",
      inProgressProject: "planet-hunting",
    });
    expect(merged.projectInterests).toEqual(["planet-hunting"]);
    expect(merged.inProgressStep).toBe("project-selection");
    expect(merged.hasCompletedOnboarding).toBe(false);
  });

  it("patches onboarding without clobbering garden", () => {
    const garden = defaultGardenState();
    garden.credits = 40;
    const next = applyHubStatePatch(
      { onboarding: defaultOnboarding(), garden },
      { onboarding: { hasCompletedOnboarding: true, projectInterests: ["solar-monitoring"] } }
    );
    expect(next.garden?.credits).toBe(40);
    expect(next.onboarding.hasCompletedOnboarding).toBe(true);
    expect(next.onboarding.projectInterests).toEqual(["solar-monitoring"]);
  });
});

describe("garden hydrate for hub state", () => {
  it("fills missing structures and treats a default camp as pristine", () => {
    expect(isPristineGarden(defaultGardenState())).toBe(true);
    const hydrated = hydrateGardenState({ credits: 56, structures: {} });
    expect(hydrated.credits).toBe(56);
    expect(hydrated.structures["ssc.structure.habitat"]).toBeTruthy();
    expect(isPristineGarden(hydrated)).toBe(false);
  });
});
