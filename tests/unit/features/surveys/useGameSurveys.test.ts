import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  useSearchParams: vi.fn(() => ({ get: vi.fn(() => null) })),
}));

import { useGameSurveys } from "@/features/surveys/hooks/useGameSurveys";
import { surveyStorageKey } from "@/features/surveys/mechanic-surveys";

describe("useGameSurveys", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns null activeSurvey initially", () => {
    const { result } = renderHook(() => useGameSurveys("user-1"));
    expect(result.current.activeSurvey).toBeNull();
  });

  it("returns null activeSurvey when no userId", () => {
    const { result } = renderHook(() => useGameSurveys());
    act(() => { vi.runAllTimers(); });
    expect(result.current.activeSurvey).toBeNull();
  });

  it("exposes dismissSurvey and completeSurvey functions", () => {
    const { result } = renderHook(() => useGameSurveys("user-1"));
    expect(typeof result.current.dismissSurvey).toBe("function");
    expect(typeof result.current.completeSurvey).toBe("function");
  });

  it("dismissSurvey is a no-op when no active survey", () => {
    const { result } = renderHook(() => useGameSurveys("user-1"));
    expect(() => act(() => { result.current.dismissSurvey(); })).not.toThrow();
    expect(result.current.activeSurvey).toBeNull();
  });

  it("completeSurvey is a no-op when no active survey", () => {
    const { result } = renderHook(() => useGameSurveys("user-1"));
    expect(() => act(() => { result.current.completeSurvey(); })).not.toThrow();
    expect(result.current.activeSurvey).toBeNull();
  });

  it("does not show survey if already completed in localStorage", async () => {
    const { useSearchParams } = await import("next/navigation");
    vi.mocked(useSearchParams).mockReturnValue({ get: () => "telescope" } as any);

    const key = surveyStorageKey("mechanic_telescope_loop_v1", "user-1");
    localStorage.setItem(key, "completed");

    const { result } = renderHook(() => useGameSurveys("user-1"));
    act(() => { vi.runAllTimers(); });

    expect(result.current.activeSurvey).toBeNull();
  });

  it("does not show survey if already dismissed in localStorage", async () => {
    const { useSearchParams } = await import("next/navigation");
    vi.mocked(useSearchParams).mockReturnValue({ get: () => "rover" } as any);

    const key = surveyStorageKey("mechanic_rover_loop_v1", "user-1");
    localStorage.setItem(key, "dismissed");

    const { result } = renderHook(() => useGameSurveys("user-1"));
    act(() => { vi.runAllTimers(); });

    expect(result.current.activeSurvey).toBeNull();
  });

  it("shows survey after delay when view matches and not yet completed", async () => {
    const { useSearchParams } = await import("next/navigation");
    vi.mocked(useSearchParams).mockReturnValue({ get: () => "telescope" } as any);

    const { result } = renderHook(() => useGameSurveys("user-1"));
    expect(result.current.activeSurvey).toBeNull();

    act(() => { vi.runAllTimers(); });

    expect(result.current.activeSurvey?.id).toBe("mechanic_telescope_loop_v1");
  });
});
