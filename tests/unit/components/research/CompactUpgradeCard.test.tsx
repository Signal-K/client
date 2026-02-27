import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { CompactUpgradeCard } from "@/src/components/research/CompactUpgradeCard";

const defaults = {
  title: "Probe Range",
  description: "Extend your probe's detection range",
  category: "telescope" as const,
  current: 0,
  max: 3,
  cost: 50,
  available: true,
  onUpgrade: vi.fn(),
};

describe("CompactUpgradeCard", () => {
  it("renders title and description", () => {
    render(<CompactUpgradeCard {...defaults} />);
    expect(screen.getByText("Probe Range")).toBeInTheDocument();
    expect(screen.getByText("Extend your probe's detection range")).toBeInTheDocument();
  });

  it("renders telescope emoji icon by default for telescope category", () => {
    render(<CompactUpgradeCard {...defaults} />);
    expect(screen.getByText("🔭")).toBeInTheDocument();
  });

  it("renders satellite emoji for satellite category", () => {
    render(<CompactUpgradeCard {...defaults} category="satellite" />);
    expect(screen.getByText("🛰️")).toBeInTheDocument();
  });

  it("renders rover emoji for rover category", () => {
    render(<CompactUpgradeCard {...defaults} category="rover" />);
    expect(screen.getByText("🛞")).toBeInTheDocument();
  });

  it("renders the upgrade button when not completed or locked", () => {
    render(<CompactUpgradeCard {...defaults} />);
    expect(screen.getByRole("button", { name: /Research for 50/i })).toBeInTheDocument();
  });

  it("calls onUpgrade when button clicked", () => {
    const onUpgrade = vi.fn();
    render(<CompactUpgradeCard {...defaults} onUpgrade={onUpgrade} />);
    fireEvent.click(screen.getByRole("button", { name: /Research for 50/i }));
    expect(onUpgrade).toHaveBeenCalledOnce();
  });

  it("shows completed badge when current >= max", () => {
    render(<CompactUpgradeCard {...defaults} current={3} max={3} />);
    expect(screen.getByText("✓ Complete")).toBeInTheDocument();
  });

  it("shows locked badge when isLocked=true", () => {
    render(<CompactUpgradeCard {...defaults} isLocked={true} />);
    expect(screen.getByText("🔒 Locked")).toBeInTheDocument();
  });

  it("shows requirement text when locked", () => {
    render(
      <CompactUpgradeCard
        {...defaults}
        isLocked={true}
        requirementText="Requires Level 2 Telescope"
      />
    );
    expect(screen.getByText("Requires Level 2 Telescope")).toBeInTheDocument();
  });

  it("shows progress badge when max > 1", () => {
    render(<CompactUpgradeCard {...defaults} current={1} max={3} />);
    expect(screen.getByText("1/3")).toBeInTheDocument();
  });

  it("renders custom icon when provided", () => {
    render(
      <CompactUpgradeCard
        {...defaults}
        icon={<span data-testid="custom-icon">🌙</span>}
      />
    );
    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });

  it("disables upgrade button when not available", () => {
    render(<CompactUpgradeCard {...defaults} available={false} />);
    expect(screen.getByRole("button", { name: /Research for 50/i })).toBeDisabled();
  });
});
