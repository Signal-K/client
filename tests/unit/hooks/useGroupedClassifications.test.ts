import { describe, it, expect } from "vitest";
import { useGroupedClassifications } from "@/hooks/useGroupedClassifications";

describe("useGroupedClassifications", () => {
  it("groups classifications by type", () => {
    const classifications = [
      { classificationtype: "planet", id: 1 },
      { classificationtype: "asteroid", id: 2 },
      { classificationtype: "planet", id: 3 },
    ];
    const result = useGroupedClassifications(classifications);
    expect(result).toHaveLength(2);

    const planetGroup = result.find((g) => g.type === "planet");
    expect(planetGroup?.entries).toHaveLength(2);

    const asteroidGroup = result.find((g) => g.type === "asteroid");
    expect(asteroidGroup?.entries).toHaveLength(1);
  });

  it("uses 'unknown' for null classificationtype", () => {
    const classifications = [
      { classificationtype: null, id: 1 },
      { classificationtype: null, id: 2 },
    ];
    const result = useGroupedClassifications(classifications);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe("unknown");
    expect(result[0].entries).toHaveLength(2);
  });

  it("returns empty array for empty input", () => {
    const result = useGroupedClassifications([]);
    expect(result).toEqual([]);
  });

  it("extracts annotationOptions from classificationConfiguration", () => {
    const classifications = [
      {
        classificationtype: "planet",
        classificationConfiguration: {
          annotationOptions: ["option1", "option2"],
        },
      },
    ];
    const result = useGroupedClassifications(classifications);
    expect(result[0].entries[0].annotationOptions).toEqual(["option1", "option2"]);
  });

  it("defaults annotationOptions to empty array when not present", () => {
    const classifications = [
      { classificationtype: "planet" },
    ];
    const result = useGroupedClassifications(classifications);
    expect(result[0].entries[0].annotationOptions).toEqual([]);
  });

  it("defaults annotationOptions to empty array when not an array", () => {
    const classifications = [
      {
        classificationtype: "planet",
        classificationConfiguration: {
          annotationOptions: "not-an-array" as any,
        },
      },
    ];
    const result = useGroupedClassifications(classifications);
    expect(result[0].entries[0].annotationOptions).toEqual([]);
  });

  it("preserves original properties on entries", () => {
    const classifications = [
      {
        classificationtype: "star",
        id: 42,
        name: "Betelgeuse",
        classificationConfiguration: { annotationOptions: ["bright"] },
      },
    ];
    const result = useGroupedClassifications(classifications);
    expect(result[0].entries[0].id).toBe(42);
    expect(result[0].entries[0].name).toBe("Betelgeuse");
  });

  it("handles mixed types correctly", () => {
    const classifications = [
      { classificationtype: "planet", id: 1 },
      { classificationtype: null, id: 2 },
      { classificationtype: "planet", id: 3 },
      { classificationtype: "star", id: 4 },
      { classificationtype: null, id: 5 },
    ];
    const result = useGroupedClassifications(classifications);
    expect(result).toHaveLength(3);

    const types = result.map((g) => g.type).sort();
    expect(types).toEqual(["planet", "star", "unknown"]);
  });
});
