import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockUseSession = vi.hoisted(() => vi.fn());

vi.mock("@/src/lib/auth/session-context", () => ({
  useSession: mockUseSession,
}));

import StardustBalance from "@/src/components/stardust/StardustBalance";

describe("StardustBalance", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSession.mockReturnValue(null);
  });

  it("shows loading state initially when session exists", async () => {
    mockUseSession.mockReturnValue({ user: { id: "user-1" } });
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        counts: { all: 100 },
        researchedTechTypes: [],
        referralBonus: 0,
      }),
    } as any);

    render(<StardustBalance />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders stardust after fetch resolves", async () => {
    mockUseSession.mockReturnValue({ user: { id: "user-1" } });
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        counts: { all: 150 },
        researchedTechTypes: [],
        referralBonus: 0,
      }),
    } as any);

    render(<StardustBalance />);
    await waitFor(() => {
      expect(screen.getByText("150 Stardust")).toBeInTheDocument();
    });
  });

  it("applies referral bonus to total", async () => {
    mockUseSession.mockReturnValue({ user: { id: "user-1" } });
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        counts: { all: 100 },
        researchedTechTypes: [],
        referralBonus: 25,
      }),
    } as any);

    render(<StardustBalance />);
    await waitFor(() => {
      expect(screen.getByText("125 Stardust")).toBeInTheDocument();
    });
  });

  it("deducts research penalty from total", async () => {
    mockUseSession.mockReturnValue({ user: { id: "user-1" } });
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        counts: { all: 100 },
        // 2 paid upgrades = 20 penalty
        researchedTechTypes: ["probecount", "rovercount"],
        referralBonus: 0,
      }),
    } as any);

    render(<StardustBalance />);
    await waitFor(() => {
      expect(screen.getByText("80 Stardust")).toBeInTheDocument();
    });
  });

  it("calls onPointsUpdate with final total", async () => {
    mockUseSession.mockReturnValue({ user: { id: "user-1" } });
    const onPointsUpdate = vi.fn();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        counts: { all: 200 },
        researchedTechTypes: [],
        referralBonus: 0,
      }),
    } as any);

    render(<StardustBalance onPointsUpdate={onPointsUpdate} />);
    await waitFor(() => {
      expect(onPointsUpdate).toHaveBeenCalledWith(200);
    });
  });

  it("does not fetch when session has no user id", () => {
    mockUseSession.mockReturnValue({ user: null });
    global.fetch = vi.fn();
    render(<StardustBalance />);
    expect(fetch).not.toHaveBeenCalled();
  });
});
