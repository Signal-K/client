import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockLimit } = vi.hoisted(() => ({
  mockLimit: vi.fn().mockResolvedValue({ data: [], error: null }),
}));

// Mock supabase before importing discoveries
vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        in: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: mockLimit,
          })),
        })),
      })),
    })),
  },
}));

import {
  getDiscoveryTypeLabel,
  getDiscoveryDescription,
  getRecentDiscoveries,
} from "@/lib/discoveries";

describe("getRecentDiscoveries", () => {
  beforeEach(() => {
    mockLimit.mockReset();
  });

  it("returns empty array on success with no data", async () => {
    mockLimit.mockResolvedValueOnce({ data: [], error: null });
    const result = await getRecentDiscoveries();
    expect(result).toEqual([]);
  });

  it("transforms supabase data correctly", async () => {
    const raw = [
      {
        id: 1,
        created_at: "2026-01-01T00:00:00Z",
        content: "planet-x",
        author: "user-123",
        classificationtype: "planet",
        profiles: [{ username: "astro", full_name: "Astro User" }],
      },
    ];
    mockLimit.mockResolvedValueOnce({ data: raw, error: null });
    const result = await getRecentDiscoveries();
    expect(result).toHaveLength(1);
    expect(result[0].profiles).toEqual({ username: "astro", full_name: "Astro User" });
  });

  it("returns empty array when supabase returns an error", async () => {
    mockLimit.mockResolvedValueOnce({ data: null, error: { message: "DB error" } });
    const result = await getRecentDiscoveries();
    expect(result).toEqual([]);
  });

  it("returns empty array when supabase throws", async () => {
    mockLimit.mockRejectedValueOnce(new Error("network failure"));
    const result = await getRecentDiscoveries();
    expect(result).toEqual([]);
  });
});

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
