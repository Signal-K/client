import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useAchievements } from "@/hooks/useAchievements";

describe("useAchievements", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with loading state", () => {
    global.fetch = vi.fn();
    const { result } = renderHook(() => useAchievements());

    expect(result.current.loading).toBe(true);
    expect(result.current.achievements).toBe(null);
    expect(result.current.error).toBe(null);
  });

  it("should fetch achievements on mount", async () => {
    const mockAchievements = {
      total: 10,
      completed: 5,
      milestones: [],
    };

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockAchievements),
      })
    ) as any;

    const { result } = renderHook(() => useAchievements());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.achievements).toEqual(mockAchievements);
    expect(result.current.error).toBe(null);
  });

  it("should handle fetch errors", async () => {
    const errorMessage = "Failed to fetch achievements";

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: errorMessage }),
      })
    ) as any;

    const { result } = renderHook(() => useAchievements());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.achievements).toBe(null);
  });

  it("should allow manual refetch", async () => {
    const mockAchievements = {
      total: 10,
      completed: 5,
      milestones: [],
    };

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockAchievements),
      })
    ) as any;

    const { result } = renderHook(() => useAchievements());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);

    // Refetch
    result.current.refetch();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });
});
