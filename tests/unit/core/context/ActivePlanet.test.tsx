import { render, screen, waitFor } from "@testing-library/react";
import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockUseSession = vi.hoisted(() => vi.fn());

vi.mock("@/src/lib/auth/session-context", () => ({
  useSession: mockUseSession,
}));

import { ActivePlanetProvider, useActivePlanet } from "@/src/core/context/ActivePlanet";

describe("ActivePlanetProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSession.mockReturnValue(null);
  });

  it("renders children", () => {
    render(
      <ActivePlanetProvider>
        <div>Child Content</div>
      </ActivePlanetProvider>
    );
    expect(screen.getByText("Child Content")).toBeInTheDocument();
  });

  it("starts with activePlanet as null", () => {
    const { result } = renderHook(() => useActivePlanet(), {
      wrapper: ({ children }) => (
        <ActivePlanetProvider>{children}</ActivePlanetProvider>
      ),
    });
    expect(result.current.activePlanet).toBeNull();
  });

  it("starts with empty classifications", () => {
    const { result } = renderHook(() => useActivePlanet(), {
      wrapper: ({ children }) => (
        <ActivePlanetProvider>{children}</ActivePlanetProvider>
      ),
    });
    expect(result.current.classifications).toEqual([]);
  });

  it("fetches planet data when session has user id", async () => {
    mockUseSession.mockReturnValue({ user: { id: "user-123" } });
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        planet: { id: 1, name: "Mars" },
        classifications: [{ id: 10 }],
      }),
    } as any);

    const { result } = renderHook(() => useActivePlanet(), {
      wrapper: ({ children }) => (
        <ActivePlanetProvider>{children}</ActivePlanetProvider>
      ),
    });

    await waitFor(() => {
      expect(result.current.activePlanet).toEqual({ id: 1, name: "Mars" });
    });
  });

  it("does not fetch when session has no user id", () => {
    mockUseSession.mockReturnValue({ user: null });
    global.fetch = vi.fn();
    render(
      <ActivePlanetProvider>
        <div>Child</div>
      </ActivePlanetProvider>
    );
    expect(fetch).not.toHaveBeenCalled();
  });

  it("setActivePlanet updates the context value", () => {
    const { result } = renderHook(() => useActivePlanet(), {
      wrapper: ({ children }) => (
        <ActivePlanetProvider>{children}</ActivePlanetProvider>
      ),
    });
    act(() => {
      result.current.setActivePlanet({ id: 99, name: "Kepler-22b" });
    });
    expect(result.current.activePlanet).toEqual({ id: 99, name: "Kepler-22b" });
  });

  it("setClassifications updates the context value", () => {
    const { result } = renderHook(() => useActivePlanet(), {
      wrapper: ({ children }) => (
        <ActivePlanetProvider>{children}</ActivePlanetProvider>
      ),
    });
    act(() => {
      result.current.setClassifications([{ id: 1 }, { id: 2 }]);
    });
    expect(result.current.classifications).toHaveLength(2);
  });

  it("calls default no-op functions from context when no provider", () => {
    const { result } = renderHook(() => useActivePlanet());
    // These call the default () => {} functions from createContext
    expect(() => {
      result.current.setActivePlanet({ id: 99 });
      result.current.setClassifications([]);
      result.current.updatePlanetLocation(5);
    }).not.toThrow();
  });

  it("updatePlanetLocation posts location when session has userId", async () => {
    mockUseSession.mockReturnValue({ user: { id: "user-456" } });

    // Initial GET (fetchPlanetData)
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ planet: { id: 2, name: "Venus" }, classifications: [] }),
      })
      // updatePlanetLocation POST
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ planet: { id: 3, name: "Mars" }, classifications: [{ id: 55 }] }),
      });

    const { result } = renderHook(() => useActivePlanet(), {
      wrapper: ({ children }) => (
        <ActivePlanetProvider>{children}</ActivePlanetProvider>
      ),
    });

    await waitFor(() => {
      expect(result.current.activePlanet?.name).toBe("Venus");
    });

    await act(async () => {
      await result.current.updatePlanetLocation(42);
    });

    expect(result.current.activePlanet?.name).toBe("Mars");
  });

  it("handles fetch error in fetchPlanetData gracefully", async () => {
    mockUseSession.mockReturnValue({ user: { id: "user-789" } });
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Planet not found" }),
    } as any);

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <ActivePlanetProvider>
        <div>child</div>
      </ActivePlanetProvider>
    );

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Error fetching data"),
        expect.any(String)
      );
    });
    consoleSpy.mockRestore();
  });

  it("updatePlanetLocation returns early when no session userId", async () => {
    mockUseSession.mockReturnValue({ user: null });
    global.fetch = vi.fn();

    const { result } = renderHook(() => useActivePlanet(), {
      wrapper: ({ children }) => (
        <ActivePlanetProvider>{children}</ActivePlanetProvider>
      ),
    });

    await act(async () => {
      await result.current.updatePlanetLocation(10);
    });

    // Should not have made any fetch calls for the POST
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
