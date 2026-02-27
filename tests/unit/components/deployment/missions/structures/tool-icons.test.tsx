import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  TelescopeComplexIcon,
  SatelliteIcon,
  RoverIcon,
} from "@/src/components/deployment/missions/structures/tool-icons";

describe("TelescopeComplexIcon", () => {
  it("renders an SVG element", () => {
    const { container } = render(<TelescopeComplexIcon />);
    expect(container.querySelector("svg")).toBeDefined();
  });

  it("does not render visual telescope by default", () => {
    const { container } = render(<TelescopeComplexIcon />);
    const rects = container.querySelectorAll("rect");
    // No visual telescope rect when hasVisual is false
    expect(Array.from(rects).some((r) => r.getAttribute("x") === "38")).toBe(false);
  });

  it("renders visual telescope when hasVisual=true", () => {
    const { container } = render(<TelescopeComplexIcon hasVisual />);
    const rects = container.querySelectorAll("rect");
    expect(Array.from(rects).some((r) => r.getAttribute("x") === "38")).toBe(true);
  });
});

describe("SatelliteIcon", () => {
  it("renders an SVG element", () => {
    const { container } = render(<SatelliteIcon />);
    expect(container.querySelector("svg")).toBeDefined();
  });

  it("does not render count badge when count=1", () => {
    const { container } = render(<SatelliteIcon count={1} />);
    const circles = container.querySelectorAll("circle");
    // Only the antenna circle (cx=32), no badge circle (cx=48)
    expect(Array.from(circles).some((c) => c.getAttribute("cx") === "48")).toBe(false);
  });

  it("renders count badge when count>1", () => {
    const { container } = render(<SatelliteIcon count={3} />);
    expect(screen.getByText("3")).toBeDefined();
  });
});

describe("RoverIcon", () => {
  it("renders an SVG", () => {
    const { container } = render(<RoverIcon />);
    expect(container.querySelector("svg")).toBeDefined();
  });
});
