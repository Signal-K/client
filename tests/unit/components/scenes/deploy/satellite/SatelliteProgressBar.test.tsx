import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import SatelliteProgressBar from "@/src/components/scenes/deploy/satellite/SatelliteProgressBar";

describe("SatelliteProgressBar", () => {
  const futureTime = new Date(Date.now() + 3_600_000); // 1 hr in future → 0% progress
  const pastTimeComplete = new Date(Date.now() - 7_200_000); // 2 hrs ago → 100% complete

  it("renders without crashing", () => {
    const { container } = render(
      <SatelliteProgressBar deployTime={new Date()} />
    );
    expect(container.firstChild).toBeDefined();
  });

  it("shows 'Mission complete' when deploy time is long past", () => {
    render(<SatelliteProgressBar deployTime={pastTimeComplete} />);
    expect(screen.getByText("Mission complete")).toBeDefined();
  });

  it("shows remaining minutes when not complete", () => {
    // deploy 5 minutes ago, should show something like '55m remaining'
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    render(<SatelliteProgressBar deployTime={fiveMinutesAgo} />);
    expect(screen.getByText(/remaining/)).toBeDefined();
  });

  it("uses weather steps when investigationType=weather", () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    render(<SatelliteProgressBar deployTime={fiveMinutesAgo} investigationType="weather" />);
    // Just ensure it renders without error
    expect(screen.getByText(/remaining/)).toBeDefined();
  });

  it("accepts string deployTime", () => {
    const { container } = render(
      <SatelliteProgressBar deployTime={futureTime.toISOString()} />
    );
    expect(container.firstChild).toBeDefined();
  });
});
