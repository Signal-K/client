import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

vi.mock("@/src/components/layout/Tes", () => ({
  default: () => <nav data-testid="game-navbar">Navbar</nav>,
}));
vi.mock("@/src/components/layout/Header/MainHeader", () => ({
  default: () => <nav data-testid="game-navbar">Navbar</nav>,
}));
vi.mock("@/src/components/classification/telescope/telescope-background", () => ({
  TelescopeBackground: () => <div data-testid="setup-background" />,
}));
vi.mock("@/src/shared/hooks/useDarkMode", () => ({
  default: () => ({ isDark: true, toggleDarkMode: vi.fn() }),
}));

import { SetupScaffold, SetupCard } from "@/src/features/setup/components/SetupScaffold";

describe("SetupScaffold", () => {
  it("renders the navbar", () => {
    render(
      <SetupScaffold title="Setup" subtitle="Configure your station">
        <div>Content</div>
      </SetupScaffold>
    );
    expect(screen.getByTestId("game-navbar")).toBeInTheDocument();
  });

  it("renders title", () => {
    render(
      <SetupScaffold title="My Setup Title" subtitle="Sub text">
        <div>Body</div>
      </SetupScaffold>
    );
    expect(screen.getByText("My Setup Title")).toBeInTheDocument();
  });

  it("renders subtitle", () => {
    render(
      <SetupScaffold title="Title" subtitle="This is a subtitle">
        <div>Body</div>
      </SetupScaffold>
    );
    expect(screen.getByText("This is a subtitle")).toBeInTheDocument();
  });

  it("renders children", () => {
    render(
      <SetupScaffold title="T" subtitle="S">
        <p>Child paragraph</p>
      </SetupScaffold>
    );
    expect(screen.getByText("Child paragraph")).toBeInTheDocument();
  });
});

describe("SetupCard", () => {
  it("renders the card title", () => {
    render(
      <SetupCard title="Card Title">
        <span>Card body</span>
      </SetupCard>
    );
    expect(screen.getByText("Card Title")).toBeInTheDocument();
  });

  it("renders children inside the card", () => {
    render(
      <SetupCard title="Test">
        <button>Action</button>
      </SetupCard>
    );
    expect(screen.getByText("Action")).toBeInTheDocument();
  });

  it("renders title as an h2 heading", () => {
    render(
      <SetupCard title="Heading">
        <div />
      </SetupCard>
    );
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Heading");
  });
});
