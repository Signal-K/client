import { renderHook, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import useDeploymentStatus from "@/hooks/useDeploymentStatus"

describe("useDeploymentStatus", () => {
  it("hydrates deployment status and planet targets from API", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        deploymentStatus: {
          telescope: { deployed: true, unclassifiedCount: 2 },
          satellites: { deployed: true, unclassifiedCount: 1, available: true },
          rover: { deployed: false, unclassifiedCount: 0 },
        },
        planetTargets: [{ id: 42, name: "Kepler-42b" }],
      }),
    } as Response)

    const { result } = renderHook(() => useDeploymentStatus())

    await waitFor(() => {
      expect(result.current.deploymentStatus.telescope.deployed).toBe(true)
      expect(result.current.planetTargets).toEqual([{ id: 42, name: "Kepler-42b" }])
    })

    expect(fetchSpy).toHaveBeenCalledWith("/api/gameplay/deploy/status", { cache: "no-store" })
  })

  it("keeps defaults when API fails", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      json: async () => ({ error: "boom" }),
    } as Response)

    const { result } = renderHook(() => useDeploymentStatus())

    await waitFor(() => {
      expect(result.current.deploymentStatus).toEqual({
        telescope: { deployed: false, unclassifiedCount: 0 },
        satellites: { deployed: false, unclassifiedCount: 0, available: false },
        rover: { deployed: false, unclassifiedCount: 0 },
      })
    })
  })

  it("uses fallback defaults when payload has no deploymentStatus or planetTargets", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({}),
    } as Response)

    const { result } = renderHook(() => useDeploymentStatus())

    await waitFor(() => {
      expect(result.current.deploymentStatus).toEqual({
        telescope: { deployed: false, unclassifiedCount: 0 },
        satellites: { deployed: false, unclassifiedCount: 0, available: false },
        rover: { deployed: false, unclassifiedCount: 0 },
      })
      expect(result.current.planetTargets).toEqual([])
    })
  })
})
