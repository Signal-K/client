import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/hooks/usePageData", () => ({
  usePageData: vi.fn(),
}));

vi.mock("@/src/components/classification/tools/inventory-viewport", () => ({
  default: () => <div data-testid="inventory-viewport">InventoryViewport</div>,
}));

import { usePageData } from "@/hooks/usePageData";
import InventoryTab from "@/src/components/tabs/InventoryTab";

describe("InventoryTab", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows empty state when hasRoverMineralDeposits is false", () => {
    vi.mocked(usePageData).mockReturnValue({
      hasRoverMineralDeposits: false,
      linkedAnomalies: [],
    } as any);
    render(<InventoryTab />);
    expect(screen.getByText("No mineral deposits found yet.")).toBeInTheDocument();
    expect(screen.getByText(/Deploy your rover/i)).toBeInTheDocument();
  });

  it("renders InventoryViewport when hasRoverMineralDeposits is true", () => {
    vi.mocked(usePageData).mockReturnValue({
      hasRoverMineralDeposits: true,
      linkedAnomalies: [],
    } as any);
    render(<InventoryTab />);
    expect(screen.getByTestId("inventory-viewport")).toBeInTheDocument();
  });
});
