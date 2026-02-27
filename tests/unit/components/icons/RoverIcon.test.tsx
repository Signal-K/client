import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import RoverIcon from "@/src/components/icons/RoverIcon";

describe("RoverIcon", () => {
  it("renders an SVG element", () => {
    const { container } = render(<RoverIcon deployed={false} hasDiscoveries={false} />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("uses grey body fill when not deployed", () => {
    const { container } = render(<RoverIcon deployed={false} hasDiscoveries={false} />);
    const svg = container.querySelector("svg");
    // The main body rect uses grey (#d1d5db) when not deployed
    expect(svg!.innerHTML).toContain("#d1d5db");
  });

  it("uses blue body fill when deployed without discoveries", () => {
    const { container } = render(<RoverIcon deployed={true} hasDiscoveries={false} />);
    const svg = container.querySelector("svg");
    expect(svg!.innerHTML).toContain("#3b82f6");
  });

  it("uses green body fill when deployed with discoveries", () => {
    const { container } = render(<RoverIcon deployed={true} hasDiscoveries={true} />);
    const svg = container.querySelector("svg");
    expect(svg!.innerHTML).toContain("#10b981");
  });

  it("renders solar panel grid lines only when deployed", () => {
    const { container: undeployed } = render(<RoverIcon deployed={false} hasDiscoveries={false} />);
    const { container: deployed } = render(<RoverIcon deployed={true} hasDiscoveries={false} />);
    // Grid lines are <line> elements rendered only when deployed
    expect(undeployed.querySelectorAll("line").length).toBe(0);
    expect(deployed.querySelectorAll("line").length).toBeGreaterThan(0);
  });
});
