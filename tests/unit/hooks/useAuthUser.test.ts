import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetUser = vi.hoisted(() => vi.fn());
const mockGetSession = vi.hoisted(() => vi.fn());
const mockOnAuthStateChange = vi.hoisted(() => vi.fn());

vi.mock("@/lib/supabase/browser", () => {
  const client = {
    auth: {
      getSession: mockGetSession,
      getUser: mockGetUser,
      onAuthStateChange: mockOnAuthStateChange,
    },
  };
  return { getSupabaseBrowserClient: () => client };
});

import { useAuthUser } from "@/src/hooks/useAuthUser";

describe("useAuthUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null });
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
  });

  it("starts with isLoading=true", () => {
    mockGetSession.mockReturnValue(new Promise(() => {})); // never resolves
    const { result } = renderHook(() => useAuthUser());
    expect(result.current.isLoading).toBe(true);
  });

  it("starts with user=null", () => {
    mockGetSession.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useAuthUser());
    expect(result.current.user).toBeNull();
  });

  it("sets user when getUser resolves with a user", async () => {
    const mockUser = { id: "user-abc", email: "test@example.com" } as any;
    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });

    const { result } = renderHook(() => useAuthUser());

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
    });
  });

  it("sets user=null when getUser returns error", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: new Error("Auth failed"),
    });

    const { result } = renderHook(() => useAuthUser());

    await waitFor(() => {
      expect(result.current.user).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });
  });

  it("sets isLoading=false after getUser resolves", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    const { result } = renderHook(() => useAuthUser());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it("updates user when onAuthStateChange fires with a session", async () => {
    const mockUser = { id: "user-xyz", email: "auth@example.com" } as any;
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    let capturedCallback: ((event: string, session: any) => void) | null = null;
    mockOnAuthStateChange.mockImplementation((cb: any) => {
      capturedCallback = cb;
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });

    const { result } = renderHook(() => useAuthUser());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Fire the auth state change callback
    const { act } = await import("@testing-library/react");
    await act(async () => {
      capturedCallback?.("SIGNED_IN", { user: mockUser });
    });

    expect(result.current.user).toEqual(mockUser);
  });

  it("sets user to null when onAuthStateChange fires with null session", async () => {
    const mockUser = { id: "user-xyz" } as any;
    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    let capturedCallback: ((event: string, session: any) => void) | null = null;
    mockOnAuthStateChange.mockImplementation((cb: any) => {
      capturedCallback = cb;
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });

    const { result } = renderHook(() => useAuthUser());
    await waitFor(() => expect(result.current.user).toEqual(mockUser));

    const { act } = await import("@testing-library/react");
    await act(async () => {
      capturedCallback?.("SIGNED_OUT", null);
    });

    expect(result.current.user).toBeNull();
  });

  it("recovers when getSession rejects", async () => {
    mockGetSession.mockRejectedValue(new Error("session bootstrap failed"));

    const { result } = renderHook(() => useAuthUser());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.user).toBeNull();
    });
  });

  it("keeps session user when getUser throws after getSession success", async () => {
    const sessionUser = { id: "session-user", email: "session@example.com" } as any;
    mockGetSession.mockResolvedValue({ data: { session: { user: sessionUser } }, error: null });
    mockGetUser.mockRejectedValue(new Error("user endpoint failed"));

    const { result } = renderHook(() => useAuthUser());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.user).toEqual(sessionUser);
    });
  });
});
