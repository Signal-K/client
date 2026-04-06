import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { StationCard } from "@/src/features/game/components/station/StationCard";

const defaultProps = {
  stationId: "TELE-01",
  icon: <span>📡</span>,
  label: "Telescope",
  status: "online" as const,
  statusText: "Active",
  onClick: vi.fn(),
};

describe("StationCard", () => {
  describe("rendering", () => {
    it("renders the station label", () => {
      render(<StationCard {...defaultProps} />);
      expect(screen.getByText("Telescope")).toBeInTheDocument();
    });

    it("renders the station id", () => {
      render(<StationCard {...defaultProps} />);
      expect(screen.getByText("TELE-01")).toBeInTheDocument();
    });

    it("renders status text", () => {
      render(<StationCard {...defaultProps} />);
      expect(screen.getByText("Active")).toBeInTheDocument();
    });

    it("renders the icon", () => {
      render(<StationCard {...defaultProps} />);
      expect(screen.getByText("📡")).toBeInTheDocument();
    });

    it("renders as a button", () => {
      render(<StationCard {...defaultProps} />);
      expect(screen.getByRole("button")).toBeInTheDocument();
    });
  });

  describe("status variants", () => {
    it.each(["online", "alert", "standby", "locked"] as const)(
      "renders without error for status %s",
      (status) => {
        render(<StationCard {...defaultProps} status={status} statusText={status} />);
        expect(screen.getByText(status)).toBeInTheDocument();
      }
    );

    it("shows signal segments when status is online", () => {
      const { container } = render(
        <StationCard {...defaultProps} status="online" signalCount={3} />
      );
      // Signal segments container — 5 divs
      const segments = container.querySelectorAll(".w-1\\.5.rounded-sm");
      expect(segments.length).toBe(5);
    });

    it("shows signal segments when status is alert", () => {
      const { container } = render(
        <StationCard {...defaultProps} status="alert" signalCount={2} />
      );
      const segments = container.querySelectorAll(".w-1\\.5.rounded-sm");
      expect(segments.length).toBe(5);
    });

    it("does not show signal segments when status is standby", () => {
      const { container } = render(
        <StationCard {...defaultProps} status="standby" signalCount={3} />
      );
      // isActive = false for standby, so signal segments should not render
      const segments = container.querySelectorAll(".w-1\\.5.rounded-sm");
      expect(segments.length).toBe(0);
    });

    it("does not show signal segments when status is locked", () => {
      const { container } = render(
        <StationCard {...defaultProps} status="locked" signalCount={3} />
      );
      const segments = container.querySelectorAll(".w-1\\.5.rounded-sm");
      expect(segments.length).toBe(0);
    });
  });

  describe("signalCount", () => {
    it("shows numeric signal count badge when signalCount > 0", () => {
      render(<StationCard {...defaultProps} signalCount={4} />);
      expect(screen.getByText("4")).toBeInTheDocument();
    });

    it("does not show numeric badge when signalCount is 0", () => {
      render(<StationCard {...defaultProps} signalCount={0} />);
      expect(screen.queryByText("0")).toBeNull();
    });

    it("does not show numeric badge when signalCount is undefined", () => {
      render(<StationCard {...defaultProps} />);
      // Only the stationId "TELE-01" and label should be in text
      expect(screen.queryByText(/^\d+$/)).toBeNull();
    });
  });

  describe("accentColor", () => {
    it.each(["teal", "amber", "sky", "violet", "muted"] as const)(
      "renders without error for accentColor %s",
      (accentColor) => {
        render(<StationCard {...defaultProps} accentColor={accentColor} />);
        expect(screen.getByText("Telescope")).toBeInTheDocument();
      }
    );

    it("defaults to teal accent when accentColor is not provided", () => {
      const { container } = render(<StationCard {...defaultProps} />);
      const button = container.querySelector("button");
      expect(button?.className).toContain("hover:border-teal-500/40");
    });
  });

  describe("interaction", () => {
    it("calls onClick when clicked", () => {
      const handler = vi.fn();
      render(<StationCard {...defaultProps} onClick={handler} />);
      fireEvent.click(screen.getByRole("button"));
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });
});
