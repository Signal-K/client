import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AchievementsModal } from "@/src/components/discovery/achievements/AchievementsModal";

vi.mock("@/src/hooks/useAchievements", () => ({
  useAchievements: () => ({
    loading: false,
    error: null,
    achievements: {
      totalUnlocked: 3,
      totalAchievements: 12,
      classifications: [
        {
          type: "classification",
          classificationType: "planet",
          count: 4,
          milestones: [
            { tier: 1, isUnlocked: true },
            { tier: 5, isUnlocked: false },
            { tier: 10, isUnlocked: false },
            { tier: 25, isUnlocked: false },
          ],
        },
      ],
      mineralDeposits: {
        type: "mineral-deposit",
        count: 2,
        milestones: [
          { tier: 1, isUnlocked: true },
          { tier: 5, isUnlocked: false },
          { tier: 10, isUnlocked: false },
          { tier: 25, isUnlocked: false },
        ],
      },
      planetCompletions: {
        type: "planet-completion",
        count: 1,
        milestones: [
          { tier: 1, isUnlocked: true },
          { tier: 5, isUnlocked: false },
          { tier: 10, isUnlocked: false },
          { tier: 25, isUnlocked: false },
        ],
      },
    },
  }),
}));

describe("AchievementsModal", () => {
  it("renders sections and progress when open", () => {
    render(<AchievementsModal isOpen onClose={() => {}} />);
    expect(screen.getByText("Achievements")).toBeInTheDocument();
    expect(screen.getByText(/3 \/ 12 Unlocked/i)).toBeInTheDocument();
    expect(screen.getByText("Classification Achievements")).toBeInTheDocument();
  });

  it("opens details when a badge is clicked", () => {
    render(<AchievementsModal isOpen onClose={() => {}} />);
    fireEvent.click(screen.getAllByRole("button", { name: /1 achievement/i })[0]);
    expect(screen.getByText("Planet Hunter")).toBeInTheDocument();
  });

  it("calls onClose when clicking backdrop", () => {
    const onClose = vi.fn();
    render(<AchievementsModal isOpen onClose={onClose} />);
    const backdrop = document.querySelector('[role="presentation"]');
    expect(backdrop).toBeTruthy();
    fireEvent.click(backdrop as Element);
    expect(onClose).toHaveBeenCalled();
  });
});
