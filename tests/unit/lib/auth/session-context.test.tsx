import { render, screen, waitFor } from "@testing-library/react";
import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetSession = vi.hoisted(() => vi.fn());
const mockOnAuthStateChange = vi.hoisted(() => vi.fn());
const mockGetSupabaseBrowserClient = vi.hoisted(() => vi.fn());

vi.mock("@/lib/supabase/browser", () => ({
  getSupabaseBrowserClient: mockGetSupabaseBrowserClient,
}));

mockGetSupabaseBrowserClient.mockReturnValue({
  auth: {
    getSession: mockGetSession,
    onAuthStateChange: mockOnAuthStateChange,
  },
});

import { SessionContextProvider, useSession, useSessionContext, useSupabaseClient } from "@/src/lib/auth/session-context";

describe("SessionContextProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null });
    mockOnAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } });
  });

  it("renders children", () => {
    render(
      <SessionContextProvider>
        <p>Session child</p>
      </SessionContextProvider>
    );
    expect(screen.getByText("Session child")).toBeInTheDocument();
  });

  it("provides session after auth resolves", async () => {
    const mockSession = { user: { id: "u1", email: "test@test.com" } } as any;
    mockGetSession.mockResolvedValue({ data: { session: mockSession }, error: null });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <SessionContextProvider>{children}</SessionContextProvider>
    );

    const { result } = renderHook(() => useSession(), { wrapper });

    await waitFor(() => {
      expect(result.current).toEqual(mockSession);
    });
  });

  it("returns null session when not authenticated", async () => {
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <SessionContextProvider>{children}</SessionContextProvider>
    );

    const { result } = renderHook(() => useSession(), { wrapper });

    await waitFor(() => {
      expect(result.current).toBeNull();
    });
  });

  it("useSessionContext returns isLoading initially", () => {
    mockGetSession.mockReturnValue(new Promise(() => {})); // never resolves

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <SessionContextProvider>{children}</SessionContextProvider>
    );

    const { result } = renderHook(() => useSessionContext(), { wrapper });
    expect(result.current.isLoading).toBe(true);
  });

  it("useSessionContext isLoading becomes false after session loads", async () => {
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <SessionContextProvider>{children}</SessionContextProvider>
    );

    const { result } = renderHook(() => useSessionContext(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it("sets error when getSession returns an auth error", async () => {
    const authError = new Error("Auth failed");
    mockGetSession.mockResolvedValue({ data: { session: null }, error: authError });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <SessionContextProvider>{children}</SessionContextProvider>
    );

    const { result } = renderHook(() => useSessionContext(), { wrapper });

    await waitFor(() => {
      expect(result.current.error).toEqual(authError);
    });
  });

  it("sets error when getSession rejects", async () => {
    mockGetSession.mockRejectedValue(new Error("Network error"));

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <SessionContextProvider>{children}</SessionContextProvider>
    );

    const { result } = renderHook(() => useSessionContext(), { wrapper });

    await waitFor(() => {
      expect(result.current.error).toBeInstanceOf(Error);
    });
  });

  it("sets error from non-Error rejection as generic message", async () => {
    mockGetSession.mockRejectedValue("string-error");

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <SessionContextProvider>{children}</SessionContextProvider>
    );

    const { result } = renderHook(() => useSessionContext(), { wrapper });

    await waitFor(() => {
      expect(result.current.error?.message).toBe("Failed to load session");
    });
  });
});

describe("useSupabaseClient", () => {
  it("returns the supabase browser client", () => {
    const client = useSupabaseClient();
    expect(client).toBeDefined();
    expect(client.auth).toBeDefined();
  });
});
