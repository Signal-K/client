import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Progress, JournalProgressBar } from "@/src/components/ui/progress";

describe("Progress", () => {
  it("renders without crashing", () => {
    const { container } = render(<Progress />);
    expect(container.firstChild).not.toBeNull();
  });

  it("renders with a given value", () => {
    const { container } = render(<Progress value={50} />);
    expect(container.firstChild).not.toBeNull();
  });

  it("indicator starts at translateX(-100%) when value is 0", () => {
    const { container } = render(<Progress value={0} />);
    const indicator = container.querySelector("[style]") as HTMLElement;
    expect(indicator?.style.transform).toBe("translateX(-100%)");
  });

  it("indicator is at translateX(0%) when value is 100", () => {
    const { container } = render(<Progress value={100} />);
    const indicator = container.querySelector("[style]") as HTMLElement;
    expect(indicator?.style.transform).toBe("translateX(-0%)");
  });

  it("indicator is at translateX(-50%) when value is 50", () => {
    const { container } = render(<Progress value={50} />);
    const indicator = container.querySelector("[style]") as HTMLElement;
    expect(indicator?.style.transform).toBe("translateX(-50%)");
  });

  it("applies custom className to root", () => {
    const { container } = render(<Progress className="my-progress" />);
    expect(container.firstElementChild?.className).toContain("my-progress");
  });
});

describe("JournalProgressBar", () => {
  it("renders without crashing", () => {
    const { container } = render(<JournalProgressBar progress={3} total={10} />);
    expect(container.firstChild).not.toBeNull();
  });

  it("shows correct width for 50% progress", () => {
    const { container } = render(<JournalProgressBar progress={5} total={10} />);
    const bar = container.querySelector("[style]") as HTMLElement;
    expect(bar?.style.width).toBe("50%");
  });

  it("shows percentage text when showPercentage=true", () => {
    render(<JournalProgressBar progress={7} total={10} showPercentage />);
    expect(screen.getByText("70% complete")).toBeInTheDocument();
  });

  it("does not show percentage text when showPercentage=false (default)", () => {
    const { queryByText } = render(<JournalProgressBar progress={5} total={10} />);
    expect(queryByText(/complete/)).toBeNull();
  });
});
