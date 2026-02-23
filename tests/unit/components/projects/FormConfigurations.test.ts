import { describe, it, expect } from "vitest";
import type { ClassificationFormProps } from "@/src/components/projects/(classifications)/FormConfigurations";

describe("ClassificationFormProps interface", () => {
  it("accepts minimal required props", () => {
    const props: ClassificationFormProps = {
      anomalyType: "exoplanet",
      anomalyId: "anomaly-123",
      assetMentioned: "telescope",
    };
    expect(props.anomalyType).toBe("exoplanet");
    expect(props.anomalyId).toBe("anomaly-123");
  });

  it("accepts assetMentioned as array", () => {
    const props: ClassificationFormProps = {
      anomalyType: "sunspot",
      anomalyId: "ss-1",
      assetMentioned: ["sat-1", "sat-2"],
    };
    expect(Array.isArray(props.assetMentioned)).toBe(true);
  });

  it("accepts optional fields", () => {
    const props: ClassificationFormProps = {
      anomalyType: "cloud",
      anomalyId: "c-1",
      assetMentioned: "balloon",
      missionNumber: 3,
      parentPlanetLocation: "Mars",
      structureItemId: 7,
      parentClassificationId: 42,
    };
    expect(props.missionNumber).toBe(3);
    expect(props.structureItemId).toBe(7);
  });
});
