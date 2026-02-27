import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import GameHeader from "@/src/features/game/components/GameHeader";

const { mockSignOut, mockSavePreferences, mockUseAuthUser } = vi.hoisted(() => ({
  mockSignOut: vi.fn().mockResolvedValue({ error: null }),
  mockSavePreferences: vi.fn(),
  mockUseAuthUser: vi.fn(() => ({
    user: { id: "user-1", email: "test@test.com", is_anonymous: false },
    supabase: { auth: { signOut: vi.fn().mockResolvedValue({ error: null }) } },
  })),
}));

vi.mock("@/src/hooks/useAuthUser", () => ({
  useAuthUser: mockUseAuthUser,
}));

vi.mock("@/src/hooks/useUserPreferences", () => ({
  useUserPreferences: () => ({
    preferences: { projectInterests: ["planets", "clouds"] },
    savePreferences: mockSavePreferences,
  }),
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

vi.mock("@/src/components/profile/auth/ConvertAnonymousAccount", () => ({
  default: ({ onSuccess }: any) => (
    <button data-testid="convert-btn" onClick={onSuccess}>
      Convert
    </button>
  ),
}));

vi.mock("@/src/components/onboarding/ProjectPreferencesModal", () => ({
  default: ({ isOpen, onClose, onSave, initialInterests }: any) =>
    isOpen ? (
      <div data-testid="project-preferences-modal">
        <button data-testid="close-modal" onClick={onClose}>
          Close
        </button>
        <button data-testid="save-modal" onClick={() => onSave(["planets"])}>
          Save
        </button>
      </div>
    ) : null,
}));

vi.mock("@/src/shared/utils", () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(" "),
}));

vi.mock("@/src/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: any) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: any) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: any) => <div>{children}</div>,
  DropdownMenuItem: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
  DropdownMenuLabel: ({ children }: any) => <div>{children}</div>,
  DropdownMenuSeparator: () => <hr />,
}));

vi.mock("@/src/components/ui/dialog", () => ({
  Dialog: ({ children, open }: any) => open ? <div>{children}</div> : null,
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <div>{children}</div>,
}));

describe("GameHeader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignOut.mockResolvedValue({ error: null });
    mockUseAuthUser.mockReturnValue({
      user: { id: "user-1", email: "test@test.com", is_anonymous: false },
      supabase: { auth: { signOut: mockSignOut } },
    });
  });

  it("renders without crashing", () => {
    render(<GameHeader />);
    expect(screen.getByText("Star Sailors")).toBeDefined();
  });

  it("displays stardust count", () => {
    render(<GameHeader stardust={1234} />);
    expect(screen.getByText("1,234")).toBeDefined();
  });

  it("calls onNotificationsClick when bell button clicked (onClick handler)", () => {
    const onNotificationsClick = vi.fn();
    render(<GameHeader hasNotifications={true} onNotificationsClick={onNotificationsClick} />);
    const bellBtn = screen.getByLabelText("Notifications");
    fireEvent.click(bellBtn);
    expect(onNotificationsClick).toHaveBeenCalled();
  });

  it("opens project preferences modal on Project Preferences click (onClick handler)", async () => {
    render(<GameHeader />);
    const prefBtn = screen.getByText("Project Preferences");
    fireEvent.click(prefBtn);
    await waitFor(() => {
      expect(screen.getByTestId("project-preferences-modal")).toBeDefined();
    });
  });

  it("closes project preferences modal on close (onClose callback)", async () => {
    render(<GameHeader />);
    fireEvent.click(screen.getByText("Project Preferences"));
    await waitFor(() => expect(screen.getByTestId("project-preferences-modal")).toBeDefined());
    fireEvent.click(screen.getByTestId("close-modal"));
    await waitFor(() => {
      expect(screen.queryByTestId("project-preferences-modal")).toBeNull();
    });
  });

  it("calls savePreferences when project preferences saved (handleProjectPreferencesSave)", async () => {
    render(<GameHeader />);
    fireEvent.click(screen.getByText("Project Preferences"));
    await waitFor(() => expect(screen.getByTestId("project-preferences-modal")).toBeDefined());
    fireEvent.click(screen.getByTestId("save-modal"));
    expect(mockSavePreferences).toHaveBeenCalledWith({ projectInterests: ["planets"] });
  });

  it("calls signOut on Sign out click (handleLogout)", async () => {
    render(<GameHeader />);
    await act(async () => {
      fireEvent.click(screen.getByText("Sign out"));
    });
    expect(mockSignOut).toHaveBeenCalled();
  });

  it("logs error when signOut returns an error", async () => {
    mockSignOut.mockResolvedValue({ error: { message: "sign out error" } });
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(<GameHeader />);
    await act(async () => {
      fireEvent.click(screen.getByText("Sign out"));
    });
    expect(consoleSpy).toHaveBeenCalledWith("Error signing out:", "sign out error");
    consoleSpy.mockRestore();
  });
});

describe("GameHeader anonymous user", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuthUser.mockReturnValue({
      user: { id: "anon-1", email: undefined, is_anonymous: true },
      supabase: { auth: { signOut: mockSignOut } },
    });
  });

  it("renders Guest badge for anonymous user", () => {
    render(<GameHeader />);
    expect(screen.getByText("Guest")).toBeDefined();
  });

  it("opens upgrade modal on Upgrade Account click (onClick handler)", async () => {
    render(<GameHeader />);
    const upgradeBtn = screen.getByText("Upgrade Account");
    fireEvent.click(upgradeBtn);
    await waitFor(() => {
      expect(screen.getByTestId("convert-btn")).toBeDefined();
    });
  });

  it("closes upgrade modal when ConvertAnonymousAccount calls onSuccess", async () => {
    render(<GameHeader />);
    fireEvent.click(screen.getByText("Upgrade Account"));
    await waitFor(() => expect(screen.getByTestId("convert-btn")).toBeDefined());
    fireEvent.click(screen.getByTestId("convert-btn"));
    await waitFor(() => {
      expect(screen.queryByTestId("convert-btn")).toBeNull();
    });
  });
});

