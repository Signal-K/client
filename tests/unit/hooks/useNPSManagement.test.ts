import { act, renderHook } from "@testing-library/react"
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest"
import { useNPSManagement } from "@/hooks/useNPSManagement"
import { useSession, useSupabaseClient } from "@/src/lib/auth/session-context"

vi.mock("@/src/lib/auth/session-context", () => ({
  useSession: vi.fn(),
  useSupabaseClient: vi.fn(),
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
    const query = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: [{ id: 1 }], error: null }),
    }
    const npsQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: [], error: null }),
    }
    const supabase = {
      from: vi.fn((table: string) => (table === "classifications" ? query : npsQuery)),
    }

    vi.mocked(useSupabaseClient).mockReturnValue(supabase as any)
    vi.mocked(useSession).mockReturnValue({ user: { id: "user-1" } } as any)

    const { result } = renderHook(() => useNPSManagement())

    await act(async () => {
      await vi.runOnlyPendingTimersAsync()
    })

    expect(query.limit).toHaveBeenCalledWith(1)
    expect(npsQuery.eq).toHaveBeenCalledWith("user_id", "user-1")

    expect(result.current.handleCloseNps).toBeTypeOf("function")
  })
})
