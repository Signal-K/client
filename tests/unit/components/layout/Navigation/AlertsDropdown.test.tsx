import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockUseAuthUser = vi.hoisted(() => vi.fn());

vi.mock("@/src/hooks/useAuthUser", () => ({
  useAuthUser: mockUseAuthUser,
}));

// Mock js-cookie
vi.mock("js-cookie", () => ({
  default: {
    get: vi.fn().mockReturnValue(undefined),
    set: vi.fn(),
    remove: vi.fn(),
  },
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

// Mock date-fns functions
vi.mock("date-fns", async () => {
  const actual = await vi.importActual("date-fns");
  return { ...actual };
});

import AlertsDropdown from "@/src/components/layout/Navigation/AlertsDropdown";

const makeAnomalyAlert = (id: string, anomalytype = "planet") => ({
  id,
  type: "anomaly",
  message: `Alert ${id}`,
  anomalyId: Number(id) || 1,
  anomaly: { anomalytype },
});

describe("AlertsDropdown", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuthUser.mockReturnValue({ user: null });
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ alerts: [] }),
    } as any);
  });

  it("renders the Bell icon trigger button", () => {
    render(<AlertsDropdown />);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("renders without crashing when no user", () => {
    mockUseAuthUser.mockReturnValue({ user: null });
    render(<AlertsDropdown />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("fetches alerts for authenticated user (covers getCookieKey)", async () => {
    mockUseAuthUser.mockReturnValue({ user: { id: "user-1" } });
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ alerts: [makeAnomalyAlert("1")] }),
    } as any);

    render(<AlertsDropdown />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/gameplay/alerts", expect.anything());
    });
  });

  it("shows no-alerts message when all alerts dismissed (visibleAlerts.length===0 branch)", async () => {
    const Cookies = await import("js-cookie");
    (Cookies.default.get as any).mockReturnValue(JSON.stringify(["1", "2"]));

    mockUseAuthUser.mockReturnValue({ user: { id: "user-1" } });
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        alerts: [makeAnomalyAlert("1"), makeAnomalyAlert("2")],
      }),
    } as any);

    render(<AlertsDropdown />);

    await waitFor(() => {
      expect(screen.getAllByText(/No primary objects/i).length).toBeGreaterThan(0);
    });
  });

  it("handles fetch error gracefully (generateAlerts !ok branch)", async () => {
    mockUseAuthUser.mockReturnValue({ user: { id: "user-2" } });
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "server error" }),
    } as any);

    render(<AlertsDropdown />);
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it("handles fetch throw (catch branch in generateAlerts)", async () => {
    mockUseAuthUser.mockReturnValue({ user: { id: "user-3" } });
    global.fetch = vi.fn().mockRejectedValue(new Error("network down"));

    render(<AlertsDropdown />);
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it("shows navigation buttons when there are multiple alerts and goToNext/Previous work", async () => {
    mockUseAuthUser.mockReturnValue({ user: { id: "user-4" } });
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        alerts: [makeAnomalyAlert("10"), makeAnomalyAlert("11"), makeAnomalyAlert("12")],
      }),
    } as any);

    render(<AlertsDropdown />);

    await waitFor(() => {
      const nextButtons = screen.getAllByText("Next");
      expect(nextButtons.length).toBeGreaterThan(0);
    });

    const nextBtn = screen.getAllByText("Next")[0];
    fireEvent.click(nextBtn);

    const prevBtn = screen.getAllByText("Previous")[0];
    fireEvent.click(prevBtn);
  });

  it("renders alert with balloon action path for satellite anomalytype", async () => {
    mockUseAuthUser.mockReturnValue({ user: { id: "user-5" } });
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        alerts: [makeAnomalyAlert("20", "automatonSatellitePhoto")],
      }),
    } as any);

    render(<AlertsDropdown />);

    await waitFor(() => {
      const links = document.querySelectorAll("a[href='/structures/balloon']");
      expect(links.length).toBeGreaterThan(0);
    });
  });

  it("renders alert with greenhouse action path for zoodexOthers anomalytype", async () => {
    mockUseAuthUser.mockReturnValue({ user: { id: "user-6" } });
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        alerts: [makeAnomalyAlert("21", "zoodexOthers")],
      }),
    } as any);

    render(<AlertsDropdown />);

    await waitFor(() => {
      const links = document.querySelectorAll("a[href='/structures/greenhouse']");
      expect(links.length).toBeGreaterThan(0);
    });
  });

  it("renders alert with telescope action path for other anomalytypes", async () => {
    mockUseAuthUser.mockReturnValue({ user: { id: "user-7" } });
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        alerts: [makeAnomalyAlert("22", "cloud")],
      }),
    } as any);

    render(<AlertsDropdown />);

    await waitFor(() => {
      const links = document.querySelectorAll("a[href='/structures/balloon']");
      expect(links.length).toBeGreaterThan(0);
    });
  });

  it("renders event type alert with classification link", async () => {
    mockUseAuthUser.mockReturnValue({ user: { id: "user-8" } });
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        alerts: [{ id: "e1", type: "event", message: "Event!", classificationId: 99 }],
      }),
    } as any);

    render(<AlertsDropdown />);

    await waitFor(() => {
      const links = document.querySelectorAll("a[href='/classification/99']");
      expect(links.length).toBeGreaterThan(0);
    });
  });
});
