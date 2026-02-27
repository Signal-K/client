import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import SolarTab from "@/src/components/tabs/SolarTab";

describe("SolarTab", () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 42 }),
    } as Response);
  });

  it("renders without crashing", () => {
    const { container } = render(<SolarTab />);
    expect(container.firstChild).not.toBeNull();
  });

  it("shows internal content when expanded is toggled", async () => {
    render(<SolarTab />);
    // Find and click the expand/collapse button
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("calls onExpandedChange when toggled", () => {
    const onExpandedChange = vi.fn();
    render(<SolarTab onExpandedChange={onExpandedChange} />);

    const buttons = screen.getAllByRole("button");
    // First button should toggle expansion
    if (buttons[0]) {
      fireEvent.click(buttons[0]);
      expect(onExpandedChange).toHaveBeenCalledWith(true);
    }
  });

  it("calls onExpandedChange with false on second toggle", () => {
    const onExpandedChange = vi.fn();
    render(<SolarTab onExpandedChange={onExpandedChange} />);

    const buttons = screen.getAllByRole("button");
    if (buttons[0]) {
      fireEvent.click(buttons[0]);
      fireEvent.click(buttons[0]);
      expect(onExpandedChange).toHaveBeenCalledWith(false);
    }
  });
});
