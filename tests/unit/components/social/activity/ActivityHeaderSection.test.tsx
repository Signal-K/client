import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ActivityHeaderSection from "@/src/components/social/activity/ActivityHeaderSection";

vi.mock("@/src/components/scenes/deploy/ActivityHeader", () => ({
  default: (props: any) => <div data-testid="activity-header" />,
}));

vi.mock("@/src/components/discovery/achievements/AchievementsModal", () => ({
  AchievementsModal: ({ isOpen, onClose }: any) =>
    isOpen ? <div data-testid="achievements-modal"><button onClick={onClose}>Close Modal</button></div> : null,
}));

describe("ActivityHeaderSection", () => {
  const defaultProps = {
    classificationsCount: 5,
    landmarksExpanded: false,
    onToggleLandmarks: vi.fn(),
  };

  it("renders the Achievements button", () => {
    render(<ActivityHeaderSection {...defaultProps} />);
    expect(screen.getByText("Achievements")).toBeDefined();
  });

  it("renders welcome text", () => {
    render(<ActivityHeaderSection {...defaultProps} />);
    expect(screen.getByText("Welcome to Star Sailors")).toBeDefined();
  });

  it("renders ActivityHeader", () => {
    render(<ActivityHeaderSection {...defaultProps} />);
    expect(screen.getByTestId("activity-header")).toBeDefined();
  });

  it("opens achievements modal on button click", () => {
    render(<ActivityHeaderSection {...defaultProps} />);
    fireEvent.click(screen.getByText("Achievements"));
    expect(screen.getByTestId("achievements-modal")).toBeDefined();
  });

  it("closes achievements modal via onClose callback", () => {
    render(<ActivityHeaderSection {...defaultProps} />);
    // Open the modal first
    fireEvent.click(screen.getByText("Achievements"));
    expect(screen.getByTestId("achievements-modal")).toBeDefined();
    // Close through the onClose callback
    fireEvent.click(screen.getByText("Close Modal"));
    expect(screen.queryByTestId("achievements-modal")).toBeNull();
  });
});
