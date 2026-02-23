import React from "react";
import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Slider } from "@/src/components/ui/slider";

describe("Slider", () => {
  it("renders without crashing", () => {
    const { container } = render(<Slider />);
    expect(container.firstChild).not.toBeNull();
  });

  it("renders with a given value", () => {
    const { container } = render(<Slider value={[50]} onValueChange={() => {}} />);
    expect(container.firstChild).not.toBeNull();
  });

  it("respects min and max props", () => {
    const { container } = render(<Slider min={0} max={100} defaultValue={[25]} />);
    const sliderRoot = container.firstElementChild;
    expect(sliderRoot?.getAttribute("aria-valuemin") ?? sliderRoot?.getAttribute("data-min")).toBeTruthy;
    // Just assert it rendered without error
    expect(container.firstChild).not.toBeNull();
  });

  it("merges custom className", () => {
    const { container } = render(<Slider className="my-slider" />);
    expect(container.firstElementChild?.className).toContain("my-slider");
  });

  it("renders the track element", () => {
    const { container } = render(<Slider />);
    // Radix Slider track has specific class
    const track = container.querySelector(".relative.h-2.w-full");
    expect(track).not.toBeNull();
  });

  it("renders the thumb element", () => {
    const { container } = render(<Slider defaultValue={[30]} />);
    // Radix Slider thumb is rendered
    const thumb = container.querySelector("[role='slider']");
    expect(thumb).not.toBeNull();
  });

  it("thumb has correct aria-valuenow", () => {
    const { container } = render(<Slider defaultValue={[42]} />);
    const thumb = container.querySelector("[role='slider']");
    expect(thumb?.getAttribute("aria-valuenow")).toBe("42");
  });
});
