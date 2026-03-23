/**
 * Focused tests for the classification-count gate added to useGameSurveys.
 * Verifies that mechanic surveys are suppressed for new users and only
 * fire once the required classification threshold is met.
 *
 * NOTE: classifications must be stable references (constants defined outside
 * the renderHook factory) so the useEffect dependency array does not change
 * on each re-render — which would clear the survey back to null.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  useSearchParams: vi.fn(() => ({ get: vi.fn(() => null) })),
}));

import { useGameSurveys } from "@/features/surveys/hooks/useGameSurveys";
import { surveyStorageKey } from "@/features/surveys/mechanic-surveys";

// Stable classification fixtures
const NO_CLASSIFICATIONS: { classificationtype: string | null | undefined }[] = [];

const TELESCOPE_2 = [
  { classificationtype: "telescope-tess" },
  { classificationtype: "planet" },
]; // below threshold (min = 3)

const TELESCOPE_3 = [
  { classificationtype: "telescope-tess" },
  { classificationtype: "planet" },
  { classificationtype: "telescope-tess" },
]; // meets threshold

const ROVER_3 = [
  { classificationtype: "rover" },
  { classificationtype: "rover" },
  { classificationtype: "rover" },
];

const SATELLITE_3 = [
  { classificationtype: "cloud" },
  { classificationtype: "lidar-jovianVortexHunter" },
  { classificationtype: "cloud" },
];

const SOLAR_3 = [
  { classificationtype: "telescope-sunspot" },
  { classificationtype: "telescope-sunspot" },
  { classificationtype: "telescope-sunspot" },
];

const ROVER_3_WRONG_TYPE = [
  // 3 rover classifications — irrelevant for the telescope survey
  { classificationtype: "rover" },
  { classificationtype: "rover" },
  { classificationtype: "rover" },
];

const WITH_NULLS = [
  { classificationtype: null },
  { classificationtype: undefined },
  { classificationtype: "telescope-tess" }, // only 1 relevant
];

// Helper — sets useSearchParams to return the given view
async function mockView(view: string) {
  const { useSearchParams } = await import("next/navigation");
  vi.mocked(useSearchParams).mockReturnValue({ get: () => view } as any);
}

describe("useGameSurveys — classification gate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ── Telescope ──────────────────────────────────────────────────────────────

  it("suppresses telescope survey for a brand-new user (0 classifications)", async () => {
    await mockView("telescope");
    const { result } = renderHook(() => useGameSurveys("new-user", NO_CLASSIFICATIONS));
    act(() => { vi.runAllTimers(); });
    expect(result.current.activeSurvey).toBeNull();
  });

  it("suppresses telescope survey when count is below threshold (2 of 3)", async () => {
    await mockView("telescope");
    const { result } = renderHook(() => useGameSurveys("user-1", TELESCOPE_2));
    act(() => { vi.runAllTimers(); });
    expect(result.current.activeSurvey).toBeNull();
  });

  it("shows telescope survey once threshold is reached (3 classifications)", async () => {
    await mockView("telescope");
    const { result } = renderHook(() => useGameSurveys("user-1", TELESCOPE_3));
    expect(result.current.activeSurvey).toBeNull();
    act(() => { vi.runAllTimers(); });
    expect(result.current.activeSurvey?.id).toBe("mechanic_telescope_loop_v1");
  });

  it("ignores irrelevant classification types for telescope threshold", async () => {
    await mockView("telescope");
    // 3 rover classifications — don't count toward telescope threshold
    const { result } = renderHook(() => useGameSurveys("user-1", ROVER_3_WRONG_TYPE));
    act(() => { vi.runAllTimers(); });
    expect(result.current.activeSurvey).toBeNull();
  });

  // ── Rover ──────────────────────────────────────────────────────────────────

  it("suppresses rover survey for a brand-new user", async () => {
    await mockView("rover");
    const { result } = renderHook(() => useGameSurveys("new-user", NO_CLASSIFICATIONS));
    act(() => { vi.runAllTimers(); });
    expect(result.current.activeSurvey).toBeNull();
  });

  it("shows rover survey once threshold is reached", async () => {
    await mockView("rover");
    const { result } = renderHook(() => useGameSurveys("user-1", ROVER_3));
    expect(result.current.activeSurvey).toBeNull();
    act(() => { vi.runAllTimers(); });
    expect(result.current.activeSurvey?.id).toBe("mechanic_rover_loop_v1");
  });

  // ── Satellite ──────────────────────────────────────────────────────────────

  it("suppresses satellite survey for a brand-new user", async () => {
    await mockView("satellite");
    const { result } = renderHook(() => useGameSurveys("new-user", NO_CLASSIFICATIONS));
    act(() => { vi.runAllTimers(); });
    expect(result.current.activeSurvey).toBeNull();
  });

  it("shows satellite survey once threshold is reached", async () => {
    await mockView("satellite");
    const { result } = renderHook(() => useGameSurveys("user-1", SATELLITE_3));
    expect(result.current.activeSurvey).toBeNull();
    act(() => { vi.runAllTimers(); });
    expect(result.current.activeSurvey?.id).toBe("mechanic_satellite_loop_v1");
  });

  // ── Solar ──────────────────────────────────────────────────────────────────

  it("suppresses solar survey for a brand-new user", async () => {
    await mockView("solar");
    const { result } = renderHook(() => useGameSurveys("new-user", NO_CLASSIFICATIONS));
    act(() => { vi.runAllTimers(); });
    expect(result.current.activeSurvey).toBeNull();
  });

  it("shows solar survey once threshold is reached", async () => {
    await mockView("solar");
    const { result } = renderHook(() => useGameSurveys("user-1", SOLAR_3));
    expect(result.current.activeSurvey).toBeNull();
    act(() => { vi.runAllTimers(); });
    expect(result.current.activeSurvey?.id).toBe("mechanic_solar_loop_v1");
  });

  // ── null / undefined classificationtype ───────────────────────────────────

  it("handles null/undefined classificationtype gracefully", async () => {
    await mockView("telescope");
    // Only 1 relevant entry — still below threshold of 3
    const { result } = renderHook(() => useGameSurveys("user-1", WITH_NULLS));
    act(() => { vi.runAllTimers(); });
    expect(result.current.activeSurvey).toBeNull();
  });

  // ── localStorage persistence ───────────────────────────────────────────────

  it("does not re-show survey after dismiss even if classifications exceed threshold", async () => {
    await mockView("telescope");
    localStorage.setItem(surveyStorageKey("mechanic_telescope_loop_v1", "user-1"), "dismissed");
    const { result } = renderHook(() => useGameSurveys("user-1", TELESCOPE_3));
    act(() => { vi.runAllTimers(); });
    expect(result.current.activeSurvey).toBeNull();
  });

  it("does not re-show survey after complete even if classifications exceed threshold", async () => {
    await mockView("rover");
    localStorage.setItem(surveyStorageKey("mechanic_rover_loop_v1", "user-1"), "completed");
    const { result } = renderHook(() => useGameSurveys("user-1", ROVER_3));
    act(() => { vi.runAllTimers(); });
    expect(result.current.activeSurvey).toBeNull();
  });
});
