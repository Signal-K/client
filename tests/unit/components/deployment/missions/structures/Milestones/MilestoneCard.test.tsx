import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import MilestoneCard from "@/src/components/deployment/missions/structures/Milestones/MilestoneCard";

const mockUseSession = vi.hoisted(() => vi.fn());

vi.mock("@/src/lib/auth/session-context", () => ({
  useSession: mockUseSession,
}));

vi.mock("@/src/components/ui/button", () => ({
  Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
}));

vi.mock("@/src/components/ui/tabs", () => ({
  Tabs: ({ children }: any) => <div>{children}</div>,
  TabsContent: ({ children }: any) => <div>{children}</div>,
  TabsList: ({ children }: any) => <div>{children}</div>,
  TabsTrigger: ({ children, value }: any) => <button data-value={value}>{children}</button>,
}));

beforeEach(() => {
  mockUseSession.mockReturnValue(null);
  vi.stubGlobal("fetch", vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          playerMilestones: [],
          communityMilestones: [],
        }),
    })
  ));
});

describe("MilestoneCard", () => {
  it("renders without crashing", () => {
    const { container } = render(<MilestoneCard />);
    expect(container).toBeDefined();
  });

  it("renders loading state initially", () => {
    render(<MilestoneCard />);
    // Multiple "Loading" texts appear while data is fetching
    expect(screen.getAllByText(/Loading/i).length).toBeGreaterThanOrEqual(1);
  });

  it("renders Yours and Community tab triggers", () => {
    render(<MilestoneCard />);
    expect(screen.getByText("Yours")).toBeDefined();
    expect(screen.getByText("Community")).toBeDefined();
  });
});
