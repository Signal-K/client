import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import TelescopeIcon from "@/src/components/icons/TelescopeIcon";

describe("TelescopeIcon", () => {
  it("renders an SVG element", () => {
    const { container } = render(<TelescopeIcon deployed={false} hasDiscoveries={false} />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("uses grey body fill when not deployed", () => {
    const { container } = render(<TelescopeIcon deployed={false} hasDiscoveries={false} />);
    const svg = container.querySelector("svg");
    expect(svg!.innerHTML).toContain("#d1d5db");
  });

  it("uses blue fill when deployed without discoveries", () => {
    const { container } = render(<TelescopeIcon deployed={true} hasDiscoveries={false} />);
    const svg = container.querySelector("svg");
    expect(svg!.innerHTML).toContain("#3b82f6");
  });

  it("uses green fill when deployed with discoveries", () => {
    const { container } = render(<TelescopeIcon deployed={true} hasDiscoveries={true} />);
    const svg = container.querySelector("svg");
    expect(svg!.innerHTML).toContain("#10b981");
  });

  it("renders pulsing discovery circle when hasDiscoveries is true", () => {
    const { container } = render(<TelescopeIcon deployed={true} hasDiscoveries={true} />);
    const svg = container.querySelector("svg");
    // There should be an animate element for the pulsing circle
    const animate = svg!.querySelector("animate");
    expect(animate).toBeInTheDocument();
  });

  it("does not render pulsing circle when no discoveries", () => {
    const { container } = render(<TelescopeIcon deployed={true} hasDiscoveries={false} />);
    const svg = container.querySelector("svg");
    const animate = svg!.querySelector("animate");
    expect(animate).toBeNull();
  });
});
