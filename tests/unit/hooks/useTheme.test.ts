import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
Object.defineProperty(window, "matchMedia", {
  writable: true,
  configurable: true,
  value: vi.fn((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
import { useTheme } from "@/src/hooks/useTheme";

describe("useTheme", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
  });

  it("initialises with isDark=false when no saved theme and no system preference", () => {
    // matchMedia defaults to not matching in jsdom
    const { result } = renderHook(() => useTheme());
    expect(result.current.isDark).toBe(false);
  });

  it("initialises with isDark=true when saved theme is dark", () => {
    localStorage.setItem("star-sailors-theme", "dark");
    const { result } = renderHook(() => useTheme());
    expect(result.current.isDark).toBe(true);
  });

  it("initialises with isDark=false when saved theme is light", () => {
    localStorage.setItem("star-sailors-theme", "light");
    const { result } = renderHook(() => useTheme());
    expect(result.current.isDark).toBe(false);
  });

  it("toggleTheme switches isDark from false to true", () => {
    const { result } = renderHook(() => useTheme());
    act(() => {
      result.current.toggleTheme();
    });
    expect(result.current.isDark).toBe(true);
  });

  it("toggleTheme persists to localStorage", () => {
    const { result } = renderHook(() => useTheme());
    act(() => {
      result.current.toggleTheme();
    });
    expect(localStorage.getItem("star-sailors-theme")).toBe("dark");
  });

  it("toggleTheme adds dark class to documentElement", () => {
    const { result } = renderHook(() => useTheme());
    act(() => {
      result.current.toggleTheme();
    });
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("double toggle restores to light", () => {
    const { result } = renderHook(() => useTheme());
    act(() => {
      result.current.toggleTheme();
    });
    act(() => {
      result.current.toggleTheme();
    });
    expect(result.current.isDark).toBe(false);
    expect(localStorage.getItem("star-sailors-theme")).toBe("light");
  });
});
