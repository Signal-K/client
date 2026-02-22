import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { useTheme } from "@/hooks/useTheme"

describe("useTheme", () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.className = ""
  })

  it("initializes dark mode from saved localStorage", () => {
    localStorage.setItem("star-sailors-theme", "dark")
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockReturnValue({ matches: false }),
    })

    const { result } = renderHook(() => useTheme())

    expect(result.current.isDark).toBe(true)
    expect(document.documentElement.classList.contains("dark")).toBe(true)
  })

  it("falls back to system preference and toggles", () => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockReturnValue({ matches: true }),
    })

    const { result } = renderHook(() => useTheme())

    expect(result.current.isDark).toBe(true)

    act(() => {
      result.current.toggleTheme()
    })

    expect(result.current.isDark).toBe(false)
    expect(localStorage.getItem("star-sailors-theme")).toBe("light")
    expect(document.documentElement.classList.contains("dark")).toBe(false)
  })
})
