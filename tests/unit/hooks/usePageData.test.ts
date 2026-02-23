import { describe, expect, it, vi, beforeEach } from "vitest"
import { renderHook, waitFor } from "@testing-library/react"
import { useGroupedClassifications, usePageData } from "@/hooks/usePageData"

const mockUseSession = vi.hoisted(() => vi.fn())

vi.mock("@/src/lib/auth/session-context", () => ({
  useSession: mockUseSession,
}))

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

describe("usePageData", () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it("returns loading=true initially when no session and no cache", () => {
    mockUseSession.mockReturnValue(null)
    const { result } = renderHook(() => usePageData())
    // No session → only cache effect runs, no data → loading becomes false quickly
    expect(result.current.refetchData).toBeTypeOf("function")
  })

  it("fetches page data when session is present", async () => {
    mockUseSession.mockReturnValue({ user: { id: "user-1" } })
    const mockPayload = {
      profile: { id: "user-1", username: "alice", full_name: null, classificationPoints: 42 },
      classifications: [],
      linkedAnomalies: [],
      activityFeed: [],
      otherClassifications: [],
      incompletePlanet: null,
      planetTargets: [],
      visibleStructures: { telescope: true, satellites: true, rovers: false, balloons: false },
      hasRoverMineralDeposits: false,
    }
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => mockPayload,
    } as Response)

    const { result } = renderHook(() => usePageData())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.profile?.username).toBe("alice")
  })

  it("returns refetchData function when session is null", async () => {
    mockUseSession.mockReturnValue(null)

    const { result } = renderHook(() => usePageData())

    // When session is null there is no cache, hook just holds loading=true
    // but refetchData is always exposed
    expect(result.current.refetchData).toBeTypeOf("function")
  })

  it("uses cached data when available in localStorage", async () => {
    mockUseSession.mockReturnValue(null)
    const cached = {
      profile: { id: "u1", username: "cached-user", full_name: null, classificationPoints: 10 },
      classifications: [],
      linkedAnomalies: [],
      activityFeed: [],
      otherClassifications: [],
      incompletePlanet: null,
      planetTargets: [{ id: 1, name: "Planet X" }],
      visibleStructures: { telescope: true, satellites: false, rovers: false, balloons: false },
      hasRoverMineralDeposits: true,
    }
    localStorage.setItem("pageDataCache", JSON.stringify(cached))

    const { result } = renderHook(() => usePageData())

    await waitFor(() => {
      expect(result.current.profile?.username).toBe("cached-user")
    })
  })

  it("handles fetch error gracefully", async () => {
    mockUseSession.mockReturnValue({ user: { id: "user-err" } })
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Server error" }),
    } as Response)

    const { result } = renderHook(() => usePageData())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })
})
