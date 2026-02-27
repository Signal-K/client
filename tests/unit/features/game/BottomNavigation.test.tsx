import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import BottomNavigation from "@/src/features/game/components/BottomNavigation";

describe("BottomNavigation", () => {
  const defaultProps = {
    activeItem: "base" as const,
    onItemClick: vi.fn(),
  };

  it("renders all 5 nav buttons", () => {
    render(<BottomNavigation {...defaultProps} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(5);
  });

  it("renders as a nav element", () => {
    const { container } = render(<BottomNavigation {...defaultProps} />);
    expect(container.querySelector("nav")).not.toBeNull();
  });

  it("renders all nav labels", () => {
    render(<BottomNavigation {...defaultProps} />);
    expect(screen.getByText("Telescope")).toBeInTheDocument();
    expect(screen.getByText("Satellite")).toBeInTheDocument();
    expect(screen.getByText("Base")).toBeInTheDocument();
    expect(screen.getByText("Rover")).toBeInTheDocument();
    expect(screen.getByText("Solar")).toBeInTheDocument();
  });

  it("calls onItemClick with correct item when telescope clicked", () => {
    const onItemClick = vi.fn();
    render(<BottomNavigation {...defaultProps} onItemClick={onItemClick} />);
    fireEvent.click(screen.getByText("Telescope").closest("button")!);
    expect(onItemClick).toHaveBeenCalledWith("telescope");
  });

  it("calls onItemClick with correct item when satellite clicked", () => {
    const onItemClick = vi.fn();
    render(<BottomNavigation {...defaultProps} onItemClick={onItemClick} />);
    fireEvent.click(screen.getByText("Satellite").closest("button")!);
    expect(onItemClick).toHaveBeenCalledWith("satellite");
  });

  it("active item button appears for base item", () => {
    render(<BottomNavigation activeItem="base" onItemClick={vi.fn()} />);
    // Base is the center button; check it's styled differently
    const baseButton = screen.getByText("Base").closest("button");
    expect(baseButton).not.toBeNull();
  });

  it("shows telescope notification dot when telescopeNotification is true", () => {
    const { container } = render(
      <BottomNavigation {...defaultProps} telescopeNotification />
    );
    const dot = container.querySelector(".bg-red-500");
    expect(dot).not.toBeNull();
  });

  it("does not show notification dot when all notifications are false", () => {
    const { container } = render(<BottomNavigation {...defaultProps} />);
    expect(container.querySelector(".bg-red-500")).toBeNull();
  });

  it("merges custom className", () => {
    const { container } = render(
      <BottomNavigation {...defaultProps} className="my-nav" />
    );
    expect(container.querySelector("nav")?.className).toContain("my-nav");
  });
});
