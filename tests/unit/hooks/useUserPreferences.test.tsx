import { act, renderHook, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it } from "vitest"
import { useUserPreferences } from "@/hooks/useUserPreferences"

describe("useUserPreferences", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("prompts when no stored preferences exist", async () => {
    const { result } = renderHook(() => useUserPreferences())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.needsPreferencesPrompt).toBe(true)
    expect(result.current.preferences.projectInterests).toEqual([])
  })

  it("stores project interests and marks prompt resolved", async () => {
    const { result } = renderHook(() => useUserPreferences())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    act(() => {
      result.current.setProjectInterests(["planet-hunting", "solar-monitoring"])
    })

    expect(result.current.preferences.projectInterests).toEqual([
      "planet-hunting",
      "solar-monitoring",
    ])
    expect(result.current.needsPreferencesPrompt).toBe(false)
    expect(result.current.isProjectInterested("planet-hunting")).toBe(true)
    expect(result.current.isProjectInterested("cloud-tracking")).toBe(false)
  })

  it("tracks tutorial completion lifecycle", async () => {
    const { result } = renderHook(() => useUserPreferences())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    act(() => {
      result.current.markTutorialComplete("welcome-tour")
    })
    expect(result.current.hasTutorialCompleted("welcome-tour")).toBe(true)

    act(() => {
      result.current.resetTutorial("welcome-tour")
    })
    expect(result.current.hasTutorialCompleted("welcome-tour")).toBe(false)
  })
})
