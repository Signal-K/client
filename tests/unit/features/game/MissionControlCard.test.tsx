import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import MissionControlCard from "@/src/features/game/components/MissionControlCard";

const defaultProps = {
  icon: <span>🚀</span>,
  title: "Mission Control",
  subtitle: "All systems nominal",
};

describe("MissionControlCard", () => {
  it("renders the title", () => {
    render(<MissionControlCard {...defaultProps} />);
    expect(screen.getByText("Mission Control")).toBeInTheDocument();
  });

  it("renders the subtitle", () => {
    render(<MissionControlCard {...defaultProps} />);
    expect(screen.getByText("All systems nominal")).toBeInTheDocument();
  });

  it("renders the icon", () => {
    render(<MissionControlCard {...defaultProps} />);
    expect(screen.getByText("🚀")).toBeInTheDocument();
  });

  it("renders action button for action variant", () => {
    render(
      <MissionControlCard
        {...defaultProps}
        variant="action"
        actionLabel="Launch"
        onAction={vi.fn()}
      />
    );
    expect(screen.getByRole("button", { name: /Launch/i })).toBeInTheDocument();
  });

  it("calls onAction when action button is clicked", () => {
    const onAction = vi.fn();
    render(
      <MissionControlCard
        {...defaultProps}
        variant="action"
        actionLabel="Launch"
        onAction={onAction}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /Launch/i }));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it("does not render action button for status variant", () => {
    render(
      <MissionControlCard {...defaultProps} variant="status" actionLabel="Go" onAction={vi.fn()} />
    );
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("renders progress bar for progress variant with progress value", () => {
    const { container } = render(
      <MissionControlCard {...defaultProps} variant="progress" progress={60} />
    );
    const progressBar = container.querySelector(".bg-gradient-to-r");
    expect(progressBar).not.toBeNull();
    expect((progressBar as HTMLElement)?.style.width).toBe("60%");
  });

  it("does not render progress bar when variant is not progress", () => {
    const { container } = render(
      <MissionControlCard {...defaultProps} variant="status" progress={60} />
    );
    expect(container.querySelector(".bg-gradient-to-r")).toBeNull();
  });

  it("merges custom className", () => {
    const { container } = render(
      <MissionControlCard {...defaultProps} className="my-card" />
    );
    expect(container.firstElementChild?.className).toContain("my-card");
  });
});
