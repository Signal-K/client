import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

vi.mock("@/src/components/deployment/missions/structures/Stardust/Total", () => ({
  default: ({ type }: { type?: string }) => (
    <span data-testid={`total-points-${type ?? "default"}`}>100</span>
  ),
}));

vi.mock("@/src/components/deployment/missions/structures/Milestones/Completed", () => ({
  default: () => <div data-testid="milestone-history">Milestones</div>,
}));

import { StardustDropdown } from "@/src/components/layout/Navigation/StardustDropdown";

describe("StardustDropdown", () => {
  it("renders the star icon trigger area", () => {
    render(<StardustDropdown />);
    // Should render TotalPoints or mobile button
    const totalPoints = screen.getAllByTestId(/total-points/);
    expect(totalPoints.length).toBeGreaterThan(0);
  });

  it("renders TotalPoints component", () => {
    render(<StardustDropdown />);
    expect(screen.getByTestId("total-points-default")).toBeInTheDocument();
  });

  it("renders desktop popover trigger button", () => {
    // jsdom window.innerWidth defaults to 1024 (desktop)
    Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: 1024 });
    render(<StardustDropdown />);
    // Desktop: Popover trigger button should be present
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });
});
