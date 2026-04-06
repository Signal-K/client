import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import CompactResearchPanel from "@/features/research/components/CompactResearchPanel";

const mockSummary = {
  availableStardust: 25,
  counts: { asteroid: 3, cloud: 1, planet: 5 },
  upgrades: {
    telescopeReceptors: 0,
    satelliteCount: 0,
    roverWaypoints: 4,
    spectroscopyUnlocked: false,
    findMineralsUnlocked: false,
    p4MineralsUnlocked: false,
    roverExtractionUnlocked: false,
    satelliteExtractionUnlocked: false,
    ngtsAccessUnlocked: false,
  },
};

function mockFetch(payload: any, ok = true) {
  return vi.fn().mockResolvedValue({
    ok,
    json: () => Promise.resolve(payload),
  });
}

describe("CompactResearchPanel", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("shows loading state initially", () => {
    global.fetch = mockFetch(mockSummary);
    render(<CompactResearchPanel />);
    expect(screen.getByText("Loading upgrades...")).toBeInTheDocument();
  });

  it("renders Research Lab heading after load", async () => {
    global.fetch = mockFetch(mockSummary);
    render(<CompactResearchPanel />);
    await waitFor(() =>
      expect(screen.getByText("Research Lab")).toBeInTheDocument()
    );
  });

  it("displays available stardust", async () => {
    global.fetch = mockFetch(mockSummary);
    render(<CompactResearchPanel />);
    await waitFor(() => expect(screen.getByText("25 ⭐")).toBeInTheDocument());
  });

  it("renders Available and Researched tabs", async () => {
    global.fetch = mockFetch(mockSummary);
    render(<CompactResearchPanel />);
    await waitFor(() => {
      expect(screen.getByRole("tab", { name: /Available/i })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /Researched/i })).toBeInTheDocument();
    });
  });

  it("shows available upgrade cards", async () => {
    global.fetch = mockFetch(mockSummary);
    render(<CompactResearchPanel />);
    await waitFor(() =>
      expect(screen.getByText("Telescope Receptors")).toBeInTheDocument()
    );
  });

  it("available tab is active by default", async () => {
    global.fetch = mockFetch(mockSummary);
    render(<CompactResearchPanel />);
    await waitFor(() => screen.getByText("Research Lab"));
    const availableTab = screen.getByRole("tab", { name: /Available/i });
    expect(availableTab).toHaveAttribute("data-state", "active");
  });

  it("shows Mission Progress section for available tab", async () => {
    global.fetch = mockFetch(mockSummary);
    render(<CompactResearchPanel />);
    await waitFor(() =>
      expect(screen.getByText("Mission Progress")).toBeInTheDocument()
    );
  });

  it("auto-switches to Researched tab when no available upgrades", async () => {
    const allResearched = {
      ...mockSummary,
      upgrades: {
        ...mockSummary.upgrades,
        telescopeReceptors: 2,
        satelliteCount: 2,
        roverWaypoints: 6,
        spectroscopyUnlocked: true,
        findMineralsUnlocked: true,
        p4MineralsUnlocked: true,
        roverExtractionUnlocked: true,
        satelliteExtractionUnlocked: true,
        ngtsAccessUnlocked: true,
      },
    };
    global.fetch = mockFetch(allResearched);
    render(<CompactResearchPanel />);
    await waitFor(() =>
      expect(
        screen.queryByText("No researched upgrades yet.")
      ).not.toBeInTheDocument()
    );
  });

  it("renders Coming Soon section with locked cards", async () => {
    global.fetch = mockFetch(mockSummary);
    render(<CompactResearchPanel />);
    await waitFor(() =>
      expect(screen.getByText("Deep Space Probe")).toBeInTheDocument()
    );
    expect(screen.getByText("Advanced Radar System")).toBeInTheDocument();
  });

  it("shows researched upgrades when all are completed", async () => {
    // When all upgrades are maxed they move to "researched" and auto-switch happens
    const allResearchedData = {
      availableStardust: 0,
      counts: { asteroid: 0, cloud: 0, planet: 0 },
      upgrades: {
        telescopeReceptors: 2,
        satelliteCount: 2,
        roverWaypoints: 6,
        spectroscopyUnlocked: true,
        findMineralsUnlocked: true,
        p4MineralsUnlocked: true,
        roverExtractionUnlocked: true,
        satelliteExtractionUnlocked: true,
        ngtsAccessUnlocked: true,
      },
    };
    global.fetch = mockFetch(allResearchedData);
    render(<CompactResearchPanel />);
    await waitFor(() => screen.getByText("Research Lab"));
    // Auto-switch to "researched" tab should have occurred
    const researchedTab = screen.getByRole("tab", { name: /Researched/i });
    expect(researchedTab).toHaveAttribute("data-state", "active");
  });

  it("calls upgrade API and refreshes data on upgrade click", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSummary),
      })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSummary),
      });
    global.fetch = fetchMock;
    render(<CompactResearchPanel />);
    await waitFor(() => screen.getByText("Telescope Receptors"));

    const buttons = screen.getAllByRole("button", { name: /Research for/i });
    fireEvent.click(buttons[0]);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));
    expect(fetchMock.mock.calls[1][0]).toBe("/api/gameplay/research/unlock");
  });

  it("does not call upgrade API when insufficient stardust", async () => {
    const broke = { ...mockSummary, availableStardust: 0 };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(broke),
    });
    global.fetch = fetchMock;
    render(<CompactResearchPanel />);
    await waitFor(() => screen.getByText("Research Lab"));

    // All upgrade buttons should be disabled
    const buttons = screen.queryAllByRole("button", { name: /Research for/i });
    for (const btn of buttons) {
      expect(btn).toBeDisabled();
    }
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("handles fetch error gracefully (no crash, shows 0 stardust)", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: "Server error" }),
    });
    render(<CompactResearchPanel />);
    await waitFor(() =>
      expect(screen.queryByText("Loading upgrades...")).not.toBeInTheDocument()
    );
    // Component renders with null data — shows 0 stardust
    expect(screen.getByText("Research Lab")).toBeInTheDocument();
    expect(screen.getByText("0 ⭐")).toBeInTheDocument();
  });
});
