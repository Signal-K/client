import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

vi.mock("@/src/components/scenes/deploy/Rover/RoverSection", () => ({
  default: () => <div data-testid="rover-section">RoverSection</div>,
}));

import RoverTab from "@/src/components/tabs/RoverTab";

describe("RoverTab", () => {
  it("renders without crashing", () => {
    const { container } = render(<RoverTab />);
    expect(container.firstChild).not.toBeNull();
  });

  it("renders the RoverViewportSection", () => {
    render(<RoverTab />);
    expect(screen.getByTestId("rover-section")).toBeInTheDocument();
  });

  it("wraps content in a space-y-4 div", () => {
    const { container } = render(<RoverTab />);
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper?.className).toContain("space-y-4");
  });
});
