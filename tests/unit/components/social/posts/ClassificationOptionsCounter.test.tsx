import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockUseSession = vi.hoisted(() => vi.fn());

vi.mock("@/src/lib/auth/session-context", () => ({
  useSession: mockUseSession,
}));

vi.mock("@/src/components/ui/styles/sci-fi/panel", () => ({
  SciFiPanel: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
}));

import ClassificationOptionsCounter from "@/src/components/social/posts/ClassificationOptionsCounter";

describe("ClassificationOptionsCounter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSession.mockReturnValue(null);
  });

  it("shows loading state while fetching", () => {
    mockUseSession.mockReturnValue({ user: { id: "user-1" } });
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {})); // never resolves
    render(<ClassificationOptionsCounter />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders classification option counts after fetch", async () => {
    mockUseSession.mockReturnValue({ user: { id: "user-1" } });
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        counts: { 1: 10, 2: 20, 3: 5, 4: 15 },
        totalClassifications: 50,
      }),
    } as any);

    render(<ClassificationOptionsCounter />);
    await waitFor(() => {
      expect(screen.getByText("Option 1")).toBeInTheDocument();
      expect(screen.getByText("Option 2")).toBeInTheDocument();
      expect(screen.getByText("Option 3")).toBeInTheDocument();
      expect(screen.getByText("Option 4")).toBeInTheDocument();
    });
  });

  it("renders total classifications count", async () => {
    mockUseSession.mockReturnValue({ user: { id: "user-1" } });
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        counts: { 1: 3, 2: 7, 3: 2, 4: 4 },
        totalClassifications: 99,
      }),
    } as any);

    render(<ClassificationOptionsCounter />);
    await waitFor(() => {
      expect(screen.getByText("99")).toBeInTheDocument();
    });
  });

  it("does not fetch when session has no user", () => {
    mockUseSession.mockReturnValue({ user: null });
    global.fetch = vi.fn();
    render(<ClassificationOptionsCounter />);
    expect(fetch).not.toHaveBeenCalled();
  });
});
