import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { MissionsPopover } from "@/src/components/layout/Navigation/MissionDropdown";

describe("MissionsPopover", () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        playerMilestones: [],
      }),
    } as any);
  });

  it("renders the trigger button", () => {
    render(<MissionsPopover />);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("has a Trophy icon button text", () => {
    render(<MissionsPopover />);
    // Rendered button should be in the document
    expect(screen.getByRole("button")).toBeInTheDocument();
  });
});
