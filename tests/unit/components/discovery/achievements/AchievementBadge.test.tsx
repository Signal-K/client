import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { AchievementBadge } from "@/src/components/discovery/achievements/AchievementBadge";

const mockIcon = <span data-testid="badge-icon">🌟</span>;

describe("AchievementBadge", () => {
  it("renders label text", () => {
    render(
      <AchievementBadge
        icon={mockIcon}
        count={5}
        label="Star Gazer"
        isUnlocked={true}
      />
    );
    expect(screen.getByText("Star Gazer")).toBeInTheDocument();
  });

  it("renders count", () => {
    render(
      <AchievementBadge
        icon={mockIcon}
        count={42}
        label="Classifier"
        isUnlocked={true}
      />
    );
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("renders icon", () => {
    render(
      <AchievementBadge
        icon={mockIcon}
        count={1}
        label="Explorer"
        isUnlocked={true}
      />
    );
    expect(screen.getByTestId("badge-icon")).toBeInTheDocument();
  });

  it("adds cursor-pointer class when onClick is provided", () => {
    const onClick = vi.fn();
    const { container } = render(
      <AchievementBadge
        icon={mockIcon}
        count={1}
        label="Clickable"
        isUnlocked={true}
        onClick={onClick}
      />
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain("cursor-pointer");
  });

  it("does not add cursor-pointer when no onClick", () => {
    const { container } = render(
      <AchievementBadge
        icon={mockIcon}
        count={1}
        label="Static"
        isUnlocked={false}
      />
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).not.toContain("cursor-pointer");
  });

  it("calls onClick when clicked", () => {
    const onClick = vi.fn();
    const { container } = render(
      <AchievementBadge
        icon={mockIcon}
        count={1}
        label="Click me"
        isUnlocked={true}
        onClick={onClick}
      />
    );
    fireEvent.click(container.firstChild as HTMLElement);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("uses gold color for milestone 10 in SVG", () => {
    const { container } = render(
      <AchievementBadge
        icon={mockIcon}
        count={10}
        label="Gold badge"
        isUnlocked={true}
        milestone={10}
      />
    );
    expect(container.innerHTML).toContain("#ffd700");
  });

  it("uses bronze color for milestone 1", () => {
    const { container } = render(
      <AchievementBadge
        icon={mockIcon}
        count={1}
        label="Bronze"
        isUnlocked={true}
        milestone={1}
      />
    );
    expect(container.innerHTML).toContain("#cd7f32");
  });

  it("renders as large size when size=lg", () => {
    const { container } = render(
      <AchievementBadge
        icon={mockIcon}
        count={5}
        label="Large"
        isUnlocked={true}
        size="lg"
      />
    );
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "112");
  });
});
