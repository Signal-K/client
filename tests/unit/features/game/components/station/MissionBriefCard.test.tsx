import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MissionBriefCard } from "@/src/features/game/components/station/MissionBriefCard";

describe("MissionBriefCard", () => {
  describe("variant rendering", () => {
    it.each(["alert", "progress", "nominal", "boot"] as const)(
      "renders without error for variant %s",
      (variant) => {
        render(<MissionBriefCard variant={variant} title="Test Mission" />);
        expect(screen.getByText("Test Mission")).toBeInTheDocument();
      }
    );

    it('renders "INCOMING TRANSMISSION" label for alert variant', () => {
      render(<MissionBriefCard variant="alert" title="Alert Mission" />);
      expect(screen.getByText("INCOMING TRANSMISSION")).toBeInTheDocument();
    });

    it('renders "MISSION IN PROGRESS" label for progress variant', () => {
      render(<MissionBriefCard variant="progress" title="Progress Mission" />);
      expect(screen.getByText("MISSION IN PROGRESS")).toBeInTheDocument();
    });

    it('renders "SYSTEMS NOMINAL" label for nominal variant', () => {
      render(<MissionBriefCard variant="nominal" title="Nominal Mission" />);
      expect(screen.getByText("SYSTEMS NOMINAL")).toBeInTheDocument();
    });

    it('renders "AWAITING DEPLOYMENT" label for boot variant', () => {
      render(<MissionBriefCard variant="boot" title="Boot Mission" />);
      expect(screen.getByText("AWAITING DEPLOYMENT")).toBeInTheDocument();
    });
  });

  describe("title and subtitle", () => {
    it("renders the title", () => {
      render(<MissionBriefCard variant="nominal" title="My Mission Title" />);
      expect(screen.getByText("My Mission Title")).toBeInTheDocument();
    });

    it("renders subtitle when provided", () => {
      render(
        <MissionBriefCard
          variant="nominal"
          title="Title"
          subtitle="This is a subtitle"
        />
      );
      expect(screen.getByText("This is a subtitle")).toBeInTheDocument();
    });

    it("does not render subtitle when not provided", () => {
      render(<MissionBriefCard variant="nominal" title="Title" />);
      // No subtitle paragraph in DOM
      const paragraphs = document.querySelectorAll("p");
      const subtitleParagraphs = Array.from(paragraphs).filter(
        (p) => p.className.includes("muted-foreground")
      );
      expect(subtitleParagraphs.length).toBe(0);
    });
  });

  describe("progress bar", () => {
    it("renders progress bar when progress prop provided", () => {
      const { container } = render(
        <MissionBriefCard variant="progress" title="Mission" progress={60} />
      );
      expect(screen.getByText("60%")).toBeInTheDocument();
      expect(screen.getByText("PROGRESS")).toBeInTheDocument();
    });

    it("renders the progress fill at correct width", () => {
      const { container } = render(
        <MissionBriefCard variant="progress" title="Mission" progress={75} />
      );
      const fill = container.querySelector("[style*='width: 75%']");
      expect(fill).not.toBeNull();
    });

    it("clamps progress to 100 max", () => {
      const { container } = render(
        <MissionBriefCard variant="progress" title="Mission" progress={150} />
      );
      const fill = container.querySelector("[style*='width: 100%']");
      expect(fill).not.toBeNull();
    });

    it("clamps progress to 0 min", () => {
      const { container } = render(
        <MissionBriefCard variant="progress" title="Mission" progress={-10} />
      );
      const fill = container.querySelector("[style*='width: 0%']");
      expect(fill).not.toBeNull();
    });

    it("does not render progress bar when progress is not provided", () => {
      render(<MissionBriefCard variant="progress" title="Mission" />);
      expect(screen.queryByText("PROGRESS")).toBeNull();
    });
  });

  describe("action button", () => {
    it("renders action button when actionLabel and onAction are provided", () => {
      const handler = vi.fn();
      render(
        <MissionBriefCard
          variant="alert"
          title="Mission"
          actionLabel="Deploy Now"
          onAction={handler}
        />
      );
      expect(screen.getByRole("button", { name: /deploy now/i })).toBeInTheDocument();
    });

    it("calls onAction when button is clicked", () => {
      const handler = vi.fn();
      render(
        <MissionBriefCard
          variant="alert"
          title="Mission"
          actionLabel="Launch"
          onAction={handler}
        />
      );
      fireEvent.click(screen.getByRole("button", { name: /launch/i }));
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("does not render action button when actionLabel is missing", () => {
      render(<MissionBriefCard variant="nominal" title="Mission" onAction={vi.fn()} />);
      expect(screen.queryByRole("button")).toBeNull();
    });

    it("does not render action button when onAction is missing", () => {
      render(<MissionBriefCard variant="nominal" title="Mission" actionLabel="Go" />);
      expect(screen.queryByRole("button")).toBeNull();
    });
  });
});
