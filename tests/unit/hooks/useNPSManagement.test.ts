import { act, renderHook } from "@testing-library/react"
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest"
import { useNPSManagement } from "@/hooks/useNPSManagement"
import { useSession } from "@/src/lib/auth/session-context"

vi.mock("@/src/lib/auth/session-context", () => ({
  useSession: vi.fn(),
}))

describe("useNPSManagement", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  it("shows NPS modal when user has classifications and no prior NPS response", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue({
        ok: true,
        json: async () => ({ shouldShowNps: true }),
      } as Response)
    vi.mocked(useSession).mockReturnValue({ user: { id: "user-1" } } as any)

    const { result } = renderHook(() => useNPSManagement())

    await act(async () => {
      await vi.runOnlyPendingTimersAsync()
    })

    expect(fetchSpy).toHaveBeenCalledWith("/api/gameplay/nps/status", { cache: "no-store" })
    expect(result.current.showNpsModal).toBe(true)
    expect(result.current.handleCloseNps).toBeTypeOf("function")
  })
})
