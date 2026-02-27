import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

vi.mock("@/src/components/scenes/deploy/Telescope/TelescopeSection", () => ({
  default: () => <div data-testid="telescope-section">TelescopeSection</div>,
}));

import TelescopeTab from "@/src/components/tabs/TelescopeTab";

describe("TelescopeTab", () => {
  it("renders without crashing", () => {
    const { container } = render(<TelescopeTab />);
    expect(container.firstChild).not.toBeNull();
  });

  it("renders the TelescopeViewportSection", () => {
    render(<TelescopeTab />);
    expect(screen.getByTestId("telescope-section")).toBeInTheDocument();
  });

  it("wraps content in a space-y-4 div", () => {
    const { container } = render(<TelescopeTab />);
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper?.className).toContain("space-y-4");
  });
});
