import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import StructureCard from "@/src/features/game/components/StructureCard";

const defaultProps = {
  icon: <span>🏠</span>,
  name: "Base Station",
};

describe("StructureCard", () => {
  it("renders the card name", () => {
    render(<StructureCard {...defaultProps} />);
    expect(screen.getByText("Base Station")).toBeInTheDocument();
  });

  it("renders as a button element", () => {
    render(<StructureCard {...defaultProps} />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("renders the icon", () => {
    render(<StructureCard {...defaultProps} />);
    expect(screen.getByText("🏠")).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const handler = vi.fn();
    render(<StructureCard {...defaultProps} onClick={handler} />);
    fireEvent.click(screen.getByRole("button"));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("is disabled when disabled prop is true", () => {
    render(<StructureCard {...defaultProps} disabled />);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("renders status text when provided", () => {
    render(<StructureCard {...defaultProps} status="Online" />);
    expect(screen.getByText("Online")).toBeInTheDocument();
  });

  it("does not render status when not provided", () => {
    render(<StructureCard {...defaultProps} />);
    const button = screen.getByRole("button");
    // No extra text beyond name
    expect(button.textContent).not.toContain("Online");
  });

  it("shows notification dot when hasNotification is true", () => {
    const { container } = render(
      <StructureCard {...defaultProps} hasNotification />
    );
    const notificationDot = container.querySelector(".animate-pulse");
    expect(notificationDot).not.toBeNull();
  });

  it("does not show notification dot when hasNotification is false", () => {
    const { container } = render(
      <StructureCard {...defaultProps} hasNotification={false} />
    );
    expect(container.querySelector(".animate-pulse")).toBeNull();
  });

  it("applies opacity class when disabled", () => {
    const { container } = render(<StructureCard {...defaultProps} disabled />);
    expect(container.querySelector("button")?.className).toContain("opacity-50");
  });
});
