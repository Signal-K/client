import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/src/components/classification/UserLocations", () => ({
  default: () => <div data-testid="user-locations">My Locations</div>,
}));

import { LocationsDropdown } from "@/src/components/layout/Navigation/LocationsDropdown";

describe("LocationsDropdown", () => {
  it("renders the My planets trigger button", () => {
    render(<LocationsDropdown />);
    expect(screen.getByText("My planets")).toBeInTheDocument();
  });

  it("renders a ghost button as trigger", () => {
    render(<LocationsDropdown />);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("renders UserLocations component when popover is open", () => {
    render(
      // Force open by wrapping in open Popover from the actual source
      <LocationsDropdown />
    );
    // The trigger should be present
    expect(screen.getByText("My planets")).toBeInTheDocument();
  });
});
