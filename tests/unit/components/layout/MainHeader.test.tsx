import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks ────────────────────────────────────────────────────────────────────

const mockSignOut = vi.fn().mockResolvedValue({ error: null });
const mockUseAuthUser = vi.hoisted(() => vi.fn());
const mockUseUserPreferences = vi.hoisted(() => vi.fn());

vi.mock("@/src/hooks/useAuthUser", () => ({ useAuthUser: mockUseAuthUser }));
vi.mock("@/src/hooks/useUserPreferences", () => ({
  useUserPreferences: mockUseUserPreferences,
  ProjectType: {},
}));
vi.mock("next/link", () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));
vi.mock("@/src/components/social/activity/RecentActivity", () => ({
  default: () => <div data-testid="recent-activity" />,
}));
vi.mock("@/src/components/profile/auth/ConvertAnonymousAccount", () => ({
  default: ({ onCancel }: any) => (
    <button onClick={onCancel} data-testid="convert-cancel">Cancel</button>
  ),
}));
vi.mock("@/src/components/onboarding/ProjectPreferencesModal", () => ({
  default: ({ isOpen, onClose }: any) =>
    isOpen ? (
      <div data-testid="project-prefs-modal">
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

import MainHeader from "@/src/components/layout/Header/MainHeader";

const defaultProps = {
  isDark: false,
  onThemeToggle: vi.fn(),
  notificationsOpen: false,
  onToggleNotifications: vi.fn(),
  activityFeed: [],
  otherClassifications: [],
};

describe("MainHeader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuthUser.mockReturnValue({
      user: { id: "user-1", email: "test@example.com", is_anonymous: false },
      supabase: { auth: { signOut: mockSignOut } },
    });
    mockUseUserPreferences.mockReturnValue({
      preferences: { projectInterests: [] },
      savePreferences: vi.fn(),
    });
  });

  it("renders the Star Sailors brand link", () => {
    render(<MainHeader {...defaultProps} />);
    expect(screen.getByText("Star Sailors")).toBeInTheDocument();
  });

  it("renders theme toggle switch", () => {
    render(<MainHeader {...defaultProps} />);
    expect(screen.getByRole("switch")).toBeInTheDocument();
  });

  it("renders notification bell button", () => {
    render(<MainHeader {...defaultProps} />);
    expect(screen.getByLabelText("Toggle notifications")).toBeInTheDocument();
  });

  it("calls onToggleNotifications when bell is clicked", () => {
    const onToggle = vi.fn();
    render(<MainHeader {...defaultProps} onToggleNotifications={onToggle} />);
    fireEvent.click(screen.getByLabelText("Toggle notifications"));
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it("calls onThemeToggle when switch is changed", () => {
    const onToggle = vi.fn();
    render(<MainHeader {...defaultProps} onThemeToggle={onToggle} />);
    fireEvent.click(screen.getByRole("switch"));
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it("shows notification panel when notificationsOpen is true", () => {
    render(<MainHeader {...defaultProps} notificationsOpen={true} />);
    expect(screen.getByTestId("recent-activity")).toBeInTheDocument();
  });

  it("hides notification panel when notificationsOpen is false", () => {
    render(<MainHeader {...defaultProps} notificationsOpen={false} />);
    expect(screen.queryByTestId("recent-activity")).not.toBeInTheDocument();
  });

  it("shows notification dot when activityFeed is non-empty", () => {
    const feed = [
      { type: "comment" as const, created_at: "2024-01-01", classification_id: 1 },
    ];
    const { container } = render(<MainHeader {...defaultProps} activityFeed={feed} />);
    const dots = container.querySelectorAll(".animate-ping");
    expect(dots.length).toBeGreaterThan(0);
  });

  it("shows Guest Account badge for anonymous users", () => {
    mockUseAuthUser.mockReturnValue({
      user: { id: "anon-1", email: null, is_anonymous: true },
      supabase: { auth: { signOut: mockSignOut } },
    });
    render(<MainHeader {...defaultProps} />);
    expect(screen.getAllByText(/Guest/i).length).toBeGreaterThan(0);
  });

  it("does not show Guest badge for authenticated users", () => {
    render(<MainHeader {...defaultProps} />);
    expect(screen.queryByText(/Guest Account/i)).not.toBeInTheDocument();
  });

  it("shows Invite Crew link", () => {
    render(<MainHeader {...defaultProps} />);
    expect(screen.getByText("Invite Crew")).toBeInTheDocument();
  });
});
