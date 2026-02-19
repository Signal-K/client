import { describe, expect, it } from "vitest"
import { useGroupedClassifications } from "@/hooks/usePageData"

describe("useGroupedClassifications", () => {
  it("groups by classification type and extracts annotation options", () => {
    const result = useGroupedClassifications([
      {
        id: 1,
        classificationtype: "planet",
        content: "planet-a",
        created_at: "2026-02-19T00:00:00Z",
        anomaly: { content: "A" },
        classificationConfiguration: {
          annotationOptions: ["radius", "mass"],
        },
      },
      {
        id: 2,
        classificationtype: null,
        content: "unknown",
        created_at: "2026-02-19T00:00:00Z",
        anomaly: { content: "B" },
        classificationConfiguration: {},
      },
    ])

    expect(result).toHaveLength(2)
    expect(result.find((group) => group.type === "planet")?.entries[0].annotationOptions).toEqual([
      "radius",
      "mass",
    ])
    expect(result.find((group) => group.type === "unknown")?.entries[0].annotationOptions).toEqual([])
  })
})
