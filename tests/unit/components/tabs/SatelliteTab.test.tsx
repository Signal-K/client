import React from "react";
import { render } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/hooks/usePageData", () => ({
  usePageData: vi.fn(),
}));

vi.mock("@/src/components/scenes/deploy/satellite/SatellitePosition", () => ({
  default: ({ satellites }: { satellites: any[] }) => (
    <div data-testid="satellite-position" data-count={satellites.length}>
      SatellitePosition
    </div>
  ),
}));

import { usePageData } from "@/hooks/usePageData";
import SatelliteTab from "@/src/components/tabs/SatelliteTab";

describe("SatelliteTab", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders without crashing", () => {
    vi.mocked(usePageData).mockReturnValue({ linkedAnomalies: [] } as any);
    const { container } = render(<SatelliteTab />);
    expect(container.firstChild).not.toBeNull();
  });

  it("passes empty satellites array when no WeatherSatellite anomaly", () => {
    vi.mocked(usePageData).mockReturnValue({
      linkedAnomalies: [
        { automaton: "OtherType", id: "1", anomaly: { id: 100 } },
      ],
    } as any);
    const { getByTestId } = render(<SatelliteTab />);
    expect(getByTestId("satellite-position").getAttribute("data-count")).toBe("0");
  });

  it("passes populated satellite when WeatherSatellite anomaly exists", () => {
    vi.mocked(usePageData).mockReturnValue({
      linkedAnomalies: [
        { automaton: "WeatherSatellite", id: "2", anomaly: { id: 55 } },
      ],
    } as any);
    const { getByTestId } = render(<SatelliteTab />);
    expect(getByTestId("satellite-position").getAttribute("data-count")).toBe("1");
  });
});
