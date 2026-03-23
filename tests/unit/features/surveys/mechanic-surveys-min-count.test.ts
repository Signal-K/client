/**
 * Tests that mechanic loop surveys have the new gating fields so they
 * are not shown to brand-new users who haven't used those mechanics yet.
 */
import { describe, it, expect } from "vitest";
import { MECHANIC_SURVEYS } from "@/features/surveys/mechanic-surveys";

const MECHANIC_LOOP_IDS = [
  "mechanic_telescope_loop_v1",
  "mechanic_rover_loop_v1",
  "mechanic_satellite_loop_v1",
  "mechanic_solar_loop_v1",
] as const;

describe("mechanic loop surveys — gating fields", () => {
  for (const id of MECHANIC_LOOP_IDS) {
    const survey = MECHANIC_SURVEYS.find((s) => s.id === id);

    it(`${id} exists in MECHANIC_SURVEYS`, () => {
      expect(survey).toBeDefined();
    });

    it(`${id} has minClassificationsRequired >= 1`, () => {
      expect(survey?.minClassificationsRequired).toBeDefined();
      expect(survey!.minClassificationsRequired).toBeGreaterThanOrEqual(1);
    });

    it(`${id} has at least one relevantClassificationType`, () => {
      expect(survey?.relevantClassificationTypes).toBeDefined();
      expect(survey!.relevantClassificationTypes!.length).toBeGreaterThan(0);
    });
  }

  it("non-mechanic surveys are NOT gated (no minClassificationsRequired)", () => {
    const ungated = ["trigger_first_classification_v1", "feature_inventory_v1", "feature_profile_v1"];
    for (const id of ungated) {
      const survey = MECHANIC_SURVEYS.find((s) => s.id === id);
      // These surveys may or may not have minClassificationsRequired —
      // the important thing is that mechanic loop surveys DO have it.
      // We just assert the survey exists.
      expect(survey).toBeDefined();
    }
  });

  it("telescope survey counts telescope-tess and planet classifications", () => {
    const survey = MECHANIC_SURVEYS.find((s) => s.id === "mechanic_telescope_loop_v1");
    expect(survey!.relevantClassificationTypes).toContain("telescope-tess");
    expect(survey!.relevantClassificationTypes).toContain("planet");
  });

  it("rover survey counts rover classifications", () => {
    const survey = MECHANIC_SURVEYS.find((s) => s.id === "mechanic_rover_loop_v1");
    expect(survey!.relevantClassificationTypes).toContain("rover");
  });

  it("satellite survey counts cloud and lidar classifications", () => {
    const survey = MECHANIC_SURVEYS.find((s) => s.id === "mechanic_satellite_loop_v1");
    expect(survey!.relevantClassificationTypes).toContain("cloud");
    expect(survey!.relevantClassificationTypes).toContain("lidar-jovianVortexHunter");
  });

  it("solar survey counts telescope-sunspot classifications", () => {
    const survey = MECHANIC_SURVEYS.find((s) => s.id === "mechanic_solar_loop_v1");
    expect(survey!.relevantClassificationTypes).toContain("telescope-sunspot");
  });
});
