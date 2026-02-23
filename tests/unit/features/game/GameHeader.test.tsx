import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSignOut = vi.fn().mockResolvedValue({ error: null });

vi.mock("@/src/hooks/useAuthUser", () => ({
  useAuthUser: vi.fn(() => ({
    user: { id: "user-1", is_anonymous: false, email: "test@example.com" },
    supabase: { auth: { signOut: mockSignOut } },
  })),
}));

vi.mock("@/src/hooks/useUserPreferences", () => ({
  useUserPreferences: vi.fn(() => ({
    preferences: { projectInterests: [] },
    savePreferences: vi.fn(),
  })),
  ProjectType: {},
}));

vi.mock("@/src/components/profile/auth/ConvertAnonymousAccount", () => ({
  default: () => <div data-testid="convert-account">ConvertAnonymousAccount</div>,
}));

vi.mock("@/src/components/onboarding/ProjectPreferencesModal", () => ({
  default: () => <div data-testid="project-prefs-modal">ProjectPreferencesModal</div>,
}));

import GameHeader from "@/src/features/game/components/GameHeader";

describe("GameHeader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders a header element", () => {
    render(<GameHeader />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });

  it("renders stardust count when provided", () => {
    render(<GameHeader stardust={1250} />);
    expect(screen.getByText("1,250")).toBeInTheDocument();
  });

  it("renders 0 stardust by default", () => {
    render(<GameHeader />);
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("renders notification button", () => {
    render(<GameHeader hasNotifications />);
    // Bell icon button should be present
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("merges custom className", () => {
    render(<GameHeader className="my-header" />);
    const header = screen.getByRole("banner");
    expect(header.className).toContain("my-header");
  });
});
