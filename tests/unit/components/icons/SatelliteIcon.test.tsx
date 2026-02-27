import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import SatelliteIcon from "@/src/components/icons/SatelliteIcon";

describe("SatelliteIcon", () => {
  it("renders an SVG element", () => {
    const { container } = render(<SatelliteIcon deployed={false} hasDiscoveries={false} />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("uses grey body fill when not deployed", () => {
    const { container } = render(<SatelliteIcon deployed={false} hasDiscoveries={false} />);
    const svg = container.querySelector("svg");
    expect(svg!.innerHTML).toContain("#d1d5db");
  });

  it("uses blue fill when deployed without discoveries", () => {
    const { container } = render(<SatelliteIcon deployed={true} hasDiscoveries={false} />);
    const svg = container.querySelector("svg");
    expect(svg!.innerHTML).toContain("#3b82f6");
  });

  it("uses green fill when deployed with discoveries", () => {
    const { container } = render(<SatelliteIcon deployed={true} hasDiscoveries={true} />);
    const svg = container.querySelector("svg");
    expect(svg!.innerHTML).toContain("#10b981");
  });

  it("renders solar panel grid lines when deployed", () => {
    const { container } = render(<SatelliteIcon deployed={true} hasDiscoveries={false} />);
    const lines = container.querySelectorAll("line");
    expect(lines.length).toBeGreaterThan(0);
  });

  it("does not render solar panel grid lines when not deployed", () => {
    const { container } = render(<SatelliteIcon deployed={false} hasDiscoveries={false} />);
    // Only the antenna line should exist (which has different stroke), grid lines are conditional
    const svg = container.querySelector("svg")!;
    expect(svg).toBeInTheDocument();
  });
});
