import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MilestoneDisplay } from "@/src/components/projects/(classifications)/results/MilestoneDisplay";

describe("MilestoneDisplay", () => {
  it("renders the milestones heading", () => {
    render(<MilestoneDisplay milestones={null} />);
    expect(screen.getByText("🎯 Milestones")).toBeInTheDocument();
  });

  it("shows loading text when milestones is null", () => {
    render(<MilestoneDisplay milestones={null} />);
    expect(screen.getByText("Checking milestones...")).toBeInTheDocument();
  });

  it("shows empty message when milestones array is empty", () => {
    render(<MilestoneDisplay milestones={[]} />);
    expect(
      screen.getByText("No related milestones for this classification type.")
    ).toBeInTheDocument();
  });

  it("renders milestone name", () => {
    render(
      <MilestoneDisplay
        milestones={[{ name: "Planet Pioneer", requiredCount: 5, currentCount: 3, achieved: false }]}
      />
    );
    expect(screen.getByText("Planet Pioneer")).toBeInTheDocument();
  });

  it("shows progress counts for unachieved milestone", () => {
    render(
      <MilestoneDisplay
        milestones={[{ name: "Pioneer", requiredCount: 5, currentCount: 3, achieved: false }]}
      />
    );
    expect(screen.getByText("3 / 5")).toBeInTheDocument();
  });

  it("shows achievement badge for achieved milestone", () => {
    render(
      <MilestoneDisplay
        milestones={[{ name: "Pioneer", requiredCount: 5, currentCount: 5, achieved: true }]}
      />
    );
    expect(screen.getByText("🎉 Milestone Achieved!")).toBeInTheDocument();
  });

  it("does not show progress bar for achieved milestone", () => {
    render(
      <MilestoneDisplay
        milestones={[{ name: "Pioneer", requiredCount: 5, currentCount: 5, achieved: true }]}
      />
    );
    expect(screen.queryByText("5 / 5")).not.toBeInTheDocument();
  });

  it("renders multiple milestones", () => {
    render(
      <MilestoneDisplay
        milestones={[
          { name: "Milestone A", requiredCount: 3, currentCount: 1, achieved: false },
          { name: "Milestone B", requiredCount: 10, currentCount: 10, achieved: true },
        ]}
      />
    );
    expect(screen.getByText("Milestone A")).toBeInTheDocument();
    expect(screen.getByText("Milestone B")).toBeInTheDocument();
    expect(screen.getByText("🎉 Milestone Achieved!")).toBeInTheDocument();
    expect(screen.getByText("1 / 3")).toBeInTheDocument();
  });

  it("applies achieved styling to achieved milestone", () => {
    const { container } = render(
      <MilestoneDisplay
        milestones={[{ name: "A", requiredCount: 5, currentCount: 5, achieved: true }]}
      />
    );
    const card = container.querySelector(".rounded-lg");
    expect(card?.className).toContain("bg-[#FFF3CD]");
  });

  it("applies unachieved styling to in-progress milestone", () => {
    const { container } = render(
      <MilestoneDisplay
        milestones={[{ name: "A", requiredCount: 5, currentCount: 2, achieved: false }]}
      />
    );
    const card = container.querySelector(".rounded-lg");
    expect(card?.className).toContain("bg-[#E3F2FD]");
  });
});
