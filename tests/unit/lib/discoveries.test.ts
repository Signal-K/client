import { describe, it, expect, vi } from "vitest";

// Mock supabase before importing discoveries
vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        in: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => ({
              data: [],
              error: null,
            })),
          })),
        })),
      })),
    })),
  },
}));

import {
  getDiscoveryTypeLabel,
  getDiscoveryDescription,
} from "@/lib/discoveries";

describe("getDiscoveryTypeLabel", () => {
  it.each([
    ["planet", "New Exoplanet Discovered"],
    ["telescope-minorPlanet", "New Asteroid Detected"],
    ["cloud", "New Cloud Formation on Mars"],
    [null, "New Discovery"],
    ["unknown-type", "New Discovery"],
    ["", "New Discovery"],
  ])("maps %s to %s", (input, expected) => {
    expect(getDiscoveryTypeLabel(input)).toBe(expected);
  });
});

describe("getDiscoveryDescription", () => {
  it.each([
    ["planet", null, "Potentially habitable world identified."],
    ["telescope-minorPlanet", null, "Near-Earth object cataloged."],
    ["cloud", null, "Atmospheric activity monitored."],
    [null, null, ""],
    ["unknown-type", null, ""],
    ["planet", "some content", "Potentially habitable world identified."],
  ] as [string | null, string | null, string][])(
    "maps type=%s to correct description",
    (type, content, expected) => {
      expect(getDiscoveryDescription(type, content)).toBe(expected);
    }
  );

  it("ignores content parameter", () => {
    // Content is accepted but not used in the description
    const result1 = getDiscoveryDescription("planet", "detailed content");
    const result2 = getDiscoveryDescription("planet", null);
    expect(result1).toBe(result2);
  });
});
