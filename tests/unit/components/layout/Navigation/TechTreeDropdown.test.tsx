import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockUseSession = vi.hoisted(() => vi.fn());

vi.mock("@/src/lib/auth/session-context", () => ({
  useSession: mockUseSession,
}));

import TechnologyPopover from "@/src/components/layout/Navigation/TechTreeDropdown";

describe("TechnologyPopover", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSession.mockReturnValue(null);
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        researchedTechTypes: ["probecount", "proberange"],
      }),
    } as any);
  });

  it("renders the trigger button", () => {
    render(<TechnologyPopover />);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("does not fetch when no session user", () => {
    mockUseSession.mockReturnValue(null);
    render(<TechnologyPopover />);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("fetches tech tree data when session user exists", async () => {
    mockUseSession.mockReturnValue({ user: { id: "u1" } });
    render(<TechnologyPopover />);
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/gameplay/research/summary",
        expect.any(Object)
      );
    });
  });
});
