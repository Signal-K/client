import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { useUserPreferences } from "@/src/hooks/useUserPreferences";

const STORAGE_KEY = "star-sailors-preferences";

describe("useUserPreferences", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("starts with isLoading=true then becomes false", async () => {
    const { result } = renderHook(() => useUserPreferences());
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it("returns default preferences when no stored data", async () => {
    const { result } = renderHook(() => useUserPreferences());
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.preferences.hasCompletedOnboarding).toBe(false);
    expect(result.current.preferences.projectInterests).toEqual([]);
  });

  it("needsPreferencesPrompt is true when no stored preferences", async () => {
    const { result } = renderHook(() => useUserPreferences());
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.needsPreferencesPrompt).toBe(true);
  });

  it("loads stored preferences from localStorage", async () => {
    const stored = {
      projectInterests: ["planet-hunting"],
      hasCompletedOnboarding: true,
      hasSeenStructureGuide: false,
      hasSeenDeploymentTutorial: false,
      hasSeenMineralGuide: false,
      completedTutorials: {},
      structureOrder: ["telescope", "satellite", "rover", "solar"],
      telescopeFocus: null,
      lastPreferencesAsked: null,
      deviceId: "device-test",
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    localStorage.setItem("star-sailors-device-id", "device-test");

    const { result } = renderHook(() => useUserPreferences());
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.preferences.hasCompletedOnboarding).toBe(true);
    expect(result.current.preferences.projectInterests).toContain("planet-hunting");
  });

  it("markTutorialComplete marks tutorial as complete", async () => {
    const { result } = renderHook(() => useUserPreferences());
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    act(() => {
      result.current.markTutorialComplete("welcome-tour");
    });
    expect(result.current.hasTutorialCompleted("welcome-tour")).toBe(true);
  });

  it("hasTutorialCompleted returns false for uncompleted tutorial", async () => {
    const { result } = renderHook(() => useUserPreferences());
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.hasTutorialCompleted("telescope-intro")).toBe(false);
  });

  it("completeOnboarding sets hasCompletedOnboarding to true", async () => {
    const { result } = renderHook(() => useUserPreferences());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => {
      result.current.completeOnboarding();
    });
    expect(result.current.preferences.hasCompletedOnboarding).toBe(true);
  });

  it("detects new device when stored deviceId differs from current", async () => {
    const stored = {
      projectInterests: ["planet-hunting"],
      hasCompletedOnboarding: true,
      hasSeenStructureGuide: false,
      hasSeenDeploymentTutorial: false,
      hasSeenMineralGuide: false,
      completedTutorials: {},
      structureOrder: ["telescope", "satellite", "rover", "solar"],
      telescopeFocus: null,
      lastPreferencesAsked: null,
      deviceId: "old-device-id",
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    // current device ID will be different (not set, so a new one is generated)
    // or we set a different one:
    localStorage.setItem("star-sailors-device-id", "new-device-id");

    const { result } = renderHook(() => useUserPreferences());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    // Should prompt because it's a new device
    expect(result.current.needsPreferencesPrompt).toBe(true);
  });

  it("sets needsPreferencesPrompt when stored preferences have empty projectInterests", async () => {
    const stored = {
      projectInterests: [],
      hasCompletedOnboarding: false,
      hasSeenStructureGuide: false,
      hasSeenDeploymentTutorial: false,
      hasSeenMineralGuide: false,
      completedTutorials: {},
      structureOrder: ["telescope", "satellite", "rover", "solar"],
      telescopeFocus: null,
      lastPreferencesAsked: null,
      deviceId: "",
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    // Don't set a device id - so the empty string matches empty generated

    const { result } = renderHook(() => useUserPreferences());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.needsPreferencesPrompt).toBe(true);
  });

  it("handles corrupted localStorage data gracefully", async () => {
    localStorage.setItem(STORAGE_KEY, "not-valid-json{{{");

    const { result } = renderHook(() => useUserPreferences());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    // Falls back to defaults
    expect(result.current.preferences.hasCompletedOnboarding).toBe(false);
    expect(result.current.needsPreferencesPrompt).toBe(true);
  });

  it("isProjectInterested returns true for matching project when interests are set", async () => {
    const stored = {
      projectInterests: ["planet-hunting", "cloud-tracking"],
      hasCompletedOnboarding: true,
      hasSeenStructureGuide: false,
      hasSeenDeploymentTutorial: false,
      hasSeenMineralGuide: false,
      completedTutorials: {},
      structureOrder: ["telescope", "satellite", "rover", "solar"],
      telescopeFocus: null,
      lastPreferencesAsked: null,
      deviceId: "d-1",
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    localStorage.setItem("star-sailors-device-id", "d-1");

    const { result } = renderHook(() => useUserPreferences());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isProjectInterested("planet-hunting")).toBe(true);
    expect(result.current.isProjectInterested("asteroid-hunting")).toBe(false);
  });

  it("isProjectInterested returns true for all when no preferences set (empty interests)", async () => {
    const { result } = renderHook(() => useUserPreferences());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isProjectInterested("planet-hunting")).toBe(true);
  });
});
