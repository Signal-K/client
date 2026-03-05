import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

// We need to mock window.matchMedia before importing the hook
const matchMediaMock = vi.fn().mockReturnValue({
  matches: false,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
});
Object.defineProperty(window, "matchMedia", {
  value: matchMediaMock,
  writable: true,
});

import UseDarkMode from "@/shared/hooks/useDarkMode";

describe("UseDarkMode", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    document.documentElement.classList.remove("dark");
    matchMediaMock.mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
  });

  it("defaults to light mode when no saved preference", () => {
    const { result } = renderHook(() => UseDarkMode());
    expect(result.current.isDark).toBe(false);
  });

  it("reads saved dark preference from localStorage", () => {
    localStorage.setItem("star-sailors-theme", "dark");
    const { result } = renderHook(() => UseDarkMode());
    expect(result.current.isDark).toBe(true);
  });

  it("reads saved light preference from localStorage", () => {
    localStorage.setItem("star-sailors-theme", "light");
    const { result } = renderHook(() => UseDarkMode());
    expect(result.current.isDark).toBe(false);
  });

  it("uses system preference when no saved preference", () => {
    matchMediaMock.mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    const { result } = renderHook(() => UseDarkMode());
    expect(result.current.isDark).toBe(true);
  });

  it("toggleDarkMode switches from light to dark", () => {
    const { result } = renderHook(() => UseDarkMode());
    expect(result.current.isDark).toBe(false);

    act(() => {
      result.current.toggleDarkMode();
    });

    expect(result.current.isDark).toBe(true);
    expect(localStorage.getItem("star-sailors-theme")).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("toggleDarkMode switches from dark to light", () => {
    localStorage.setItem("star-sailors-theme", "dark");
    const { result } = renderHook(() => UseDarkMode());
    expect(result.current.isDark).toBe(true);

    act(() => {
      result.current.toggleDarkMode();
    });

    expect(result.current.isDark).toBe(false);
    expect(localStorage.getItem("star-sailors-theme")).toBe("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("returns isDark and toggleDarkMode", () => {
    const { result } = renderHook(() => UseDarkMode());
    expect(result.current).toHaveProperty("isDark");
    expect(result.current).toHaveProperty("toggleDarkMode");
    expect(typeof result.current.toggleDarkMode).toBe("function");
  });

  it("does not crash when localStorage.getItem throws (private mode)", () => {
    vi.spyOn(window.localStorage, "getItem").mockImplementation(() => {
      throw new DOMException("Access denied", "SecurityError");
    });
    // Should not throw; falls back to system preference (false)
    expect(() => renderHook(() => UseDarkMode())).not.toThrow();
  });

  it("does not crash when localStorage.setItem throws (private mode)", () => {
    vi.spyOn(window.localStorage, "setItem").mockImplementation(() => {
      throw new DOMException("Access denied", "SecurityError");
    });
    const { result } = renderHook(() => UseDarkMode());
    expect(() => {
      act(() => {
        result.current.toggleDarkMode();
      });
    }).not.toThrow();
  });
});
