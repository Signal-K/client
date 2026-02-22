import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchUserUpgrades, hasUpgrade } from "@/utils/userUpgrades";

// Create mock Supabase client factory
function createMockSupabase(data: any[] | null = [], error: any = null) {
  const mockResult = { data, error };
  return {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          // For chained .eq().eq().limit()
          eq: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve(mockResult)),
          })),
          ilike: vi.fn(() => Promise.resolve(mockResult)),
        })),
      })),
    })),
  } as any;
}

describe("fetchUserUpgrades", () => {
  it("returns default upgrades when data is null", async () => {
    const supabase = createMockSupabase(null, { message: "error" });
    const result = await fetchUserUpgrades(supabase, "user-1");
    expect(result).toEqual({
      telescopeUpgrade: false,
      telescopeReceptors: 1,
      satelliteCount: 1,
      roverLevel: 1,
      roverWaypoints: 4,
      findMinerals: false,
      p4FindMinerals: false,
      spectroscopy: false,
    });
  });

  it("returns default upgrades when error occurs", async () => {
    const supabase = createMockSupabase(null, { message: "db error" });
    const result = await fetchUserUpgrades(supabase, "user-1");
    expect(result.telescopeUpgrade).toBe(false);
    expect(result.satelliteCount).toBe(1);
    expect(result.roverLevel).toBe(1);
  });

  it("detects telescope receptor upgrades", async () => {
    const data = [
      { tech_type: "probereceptor", tech_id: 1, created_at: "2025-01-01" },
      { tech_type: "probereceptors", tech_id: 2, created_at: "2025-01-02" },
    ];
    // Need a different mock that returns data directly from the chain
    const mockSupabase = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ data, error: null })),
        })),
      })),
    } as any;
    const result = await fetchUserUpgrades(mockSupabase, "user-1");
    expect(result.telescopeUpgrade).toBe(true);
    expect(result.telescopeReceptors).toBe(3); // 1 + 2 upgrades
  });

  it("counts satellite upgrades", async () => {
    const data = [
      { tech_type: "satellite-1", tech_id: 1, created_at: "2025-01-01" },
      { tech_type: "satellite-2", tech_id: 2, created_at: "2025-01-02" },
      { tech_type: "satellite-3", tech_id: 3, created_at: "2025-01-03" },
    ];
    const mockSupabase = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ data, error: null })),
        })),
      })),
    } as any;
    const result = await fetchUserUpgrades(mockSupabase, "user-1");
    expect(result.satelliteCount).toBe(4); // 1 base + 3
  });

  it("detects findMinerals upgrade", async () => {
    const data = [{ tech_type: "findminerals", tech_id: 1, created_at: "2025-01-01" }];
    const mockSupabase = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ data, error: null })),
        })),
      })),
    } as any;
    const result = await fetchUserUpgrades(mockSupabase, "user-1");
    expect(result.findMinerals).toBe(true);
  });

  it("detects p4 minerals upgrade", async () => {
    const data = [{ tech_type: "p4minerals", tech_id: 1, created_at: "2025-01-01" }];
    const mockSupabase = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ data, error: null })),
        })),
      })),
    } as any;
    const result = await fetchUserUpgrades(mockSupabase, "user-1");
    expect(result.p4FindMinerals).toBe(true);
  });

  it("detects spectroscopy upgrade", async () => {
    const data = [{ tech_type: "spectroscopy", tech_id: 1, created_at: "2025-01-01" }];
    const mockSupabase = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ data, error: null })),
        })),
      })),
    } as any;
    const result = await fetchUserUpgrades(mockSupabase, "user-1");
    expect(result.spectroscopy).toBe(true);
  });

  it("detects rover waypoint upgrades", async () => {
    const data = [
      { tech_type: "roverwaypoints", tech_id: 1, created_at: "2025-01-01" },
      { tech_type: "roverwaypoint", tech_id: 2, created_at: "2025-01-02" },
    ];
    const mockSupabase = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ data, error: null })),
        })),
      })),
    } as any;
    const result = await fetchUserUpgrades(mockSupabase, "user-1");
    expect(result.roverLevel).toBe(2);
    expect(result.roverWaypoints).toBe(8); // 4 + (2 * 2)
  });

  it("returns defaults with empty data array", async () => {
    const mockSupabase = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
    } as any;
    const result = await fetchUserUpgrades(mockSupabase, "user-1");
    expect(result.telescopeUpgrade).toBe(false);
    expect(result.telescopeReceptors).toBe(1);
    expect(result.satelliteCount).toBe(1);
    expect(result.roverLevel).toBe(1);
    expect(result.roverWaypoints).toBe(4);
    expect(result.findMinerals).toBe(false);
    expect(result.p4FindMinerals).toBe(false);
    expect(result.spectroscopy).toBe(false);
  });
});

describe("hasUpgrade", () => {
  it("returns true when upgrade exists", async () => {
    const mockSupabase = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              limit: vi.fn(() => Promise.resolve({ data: [{ tech_type: "satellite" }], error: null })),
            })),
          })),
        })),
      })),
    } as any;
    const result = await hasUpgrade(mockSupabase, "user-1", "satellite");
    expect(result).toBe(true);
  });

  it("returns false when upgrade does not exist", async () => {
    const mockSupabase = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
            })),
          })),
        })),
      })),
    } as any;
    const result = await hasUpgrade(mockSupabase, "user-1", "satellite");
    expect(result).toBe(false);
  });

  it("returns false on error", async () => {
    const mockSupabase = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              limit: vi.fn(() => Promise.resolve({ data: null, error: { message: "error" } })),
            })),
          })),
        })),
      })),
    } as any;
    const result = await hasUpgrade(mockSupabase, "user-1", "satellite");
    expect(result).toBe(false);
  });
});
