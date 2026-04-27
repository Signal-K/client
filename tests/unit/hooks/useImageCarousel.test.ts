import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useImageCarousel } from "@/src/hooks/useImageCarousel";

const images = ["img1.png", "img2.png", "img3.png"];

describe("useImageCarousel", () => {
  it("starts at index 0", () => {
    const { result } = renderHook(() => useImageCarousel(images));
    expect(result.current.currentIndex).toBe(0);
  });

  it("next advances to next index", () => {
    const { result } = renderHook(() => useImageCarousel(images));
    act(() => result.current.next());
    expect(result.current.currentIndex).toBe(1);
  });

  it("next wraps around from last to first", () => {
    const { result } = renderHook(() => useImageCarousel(images));
    act(() => result.current.next());
    act(() => result.current.next());
    act(() => result.current.next());
    expect(result.current.currentIndex).toBe(0);
  });

  it("prev goes to previous index", () => {
    const { result } = renderHook(() => useImageCarousel(images));
    act(() => result.current.next());
    act(() => result.current.prev());
    expect(result.current.currentIndex).toBe(0);
  });

  it("prev wraps from first to last", () => {
    const { result } = renderHook(() => useImageCarousel(images));
    act(() => result.current.prev());
    expect(result.current.currentIndex).toBe(2);
  });

  it("goTo sets specific index", () => {
    const { result } = renderHook(() => useImageCarousel(images));
    act(() => result.current.goTo(2));
    expect(result.current.currentIndex).toBe(2);
  });

  it("works with a single-image array", () => {
    const { result } = renderHook(() => useImageCarousel(["single.png"]));
    act(() => result.current.next());
    expect(result.current.currentIndex).toBe(0);
    act(() => result.current.prev());
    expect(result.current.currentIndex).toBe(0);
  });

  it("works with empty array without crashing", () => {
    const { result } = renderHook(() => useImageCarousel([]));
    expect(result.current.currentIndex).toBe(0);
  });
});
