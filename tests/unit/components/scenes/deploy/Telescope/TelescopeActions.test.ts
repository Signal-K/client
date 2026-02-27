import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  fetchAnomalies,
  checkDeployment,
  fetchSkillProgress,
  loadSector,
  handleDeployAction,
} from "@/src/components/scenes/deploy/Telescope/TelescopeActions";

vi.mock("@/src/components/classification/telescope/utils/sector-utils", () => ({
  generateStars: vi.fn(() => []),
}));

vi.mock("@/src/components/scenes/deploy/Telescope/TelescopeUtils", () => ({
  seededRandom1: (n: number) => 0.5,
}));

vi.mock("@/types/Structures/telescope", () => ({}));

const mockFetch = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", mockFetch);
  mockFetch.mockReset();
});

describe("fetchAnomalies", () => {
  it("returns early for non-stellar/planetary types", async () => {
    const setter = vi.fn();
    await fetchAnomalies("unknown", setter);
    expect(mockFetch).not.toHaveBeenCalled();
    expect(setter).not.toHaveBeenCalled();
  });

  it("calls fetch for stellar type", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ anomalies: [] }),
    });
    const setter = vi.fn();
    await fetchAnomalies("stellar", setter);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(setter).toHaveBeenCalledWith([]);
  });

  it("handles failed fetch gracefully", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: "Not found" }),
      statusText: "Not Found",
    });
    const setter = vi.fn();
    await fetchAnomalies("planetary", setter);
    expect(setter).not.toHaveBeenCalled();
  });
});

describe("checkDeployment", () => {
  it("sets already deployed to true", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ alreadyDeployed: true, deploymentMessage: "In orbit" }),
    });
    const setDeployed = vi.fn();
    const setMsg = vi.fn();
    await checkDeployment(setDeployed, setMsg);
    expect(setDeployed).toHaveBeenCalledWith(true);
    expect(setMsg).toHaveBeenCalledWith("In orbit");
  });
});

describe("fetchSkillProgress", () => {
  it("calls the setter with skill progress", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ skillProgress: { telescope: 3, weather: 1 } }),
    });
    const setter = vi.fn();
    await fetchSkillProgress(setter);
    expect(setter).toHaveBeenCalledWith({ telescope: 3, weather: 1 });
  });
});

describe("loadSector", () => {
  it("calls setStars and setSectorAnomalies with processed data", () => {
    const setStars = vi.fn();
    const setSectorAnomalies = vi.fn();
    const generateAnomalyFromDB = vi.fn((a: any, x: number, y: number) => ({
      id: a.id,
      x,
      y,
    }));

    const tessAnomalies = [
      { id: "1", content: "Anomaly 1", anomalySet: "telescope-tess" },
      { id: "2", content: "Anomaly 2", anomalySet: "diskDetective" },
    ] as any[];

    loadSector(5, 10, tessAnomalies, setStars, setSectorAnomalies, generateAnomalyFromDB);

    expect(setStars).toHaveBeenCalledWith([]);
    expect(setSectorAnomalies).toHaveBeenCalled();
  });

  it("handles empty tessAnomalies array", () => {
    const setStars = vi.fn();
    const setSectorAnomalies = vi.fn();
    const generateAnomalyFromDB = vi.fn();

    loadSector(0, 0, [], setStars, setSectorAnomalies, generateAnomalyFromDB);

    expect(setStars).toHaveBeenCalledWith([]);
    expect(setSectorAnomalies).toHaveBeenCalledWith([]);
  });
});

describe("handleDeployAction", () => {
  const baseMocks = () => ({
    setDeploying: vi.fn(),
    setDeploymentResult: vi.fn(),
    setShowConfirmation: vi.fn(),
    setDeploymentMessage: vi.fn(),
    setAlreadyDeployed: vi.fn(),
    generateSectorName: vi.fn(() => "Sector Alpha"),
  });

  it("returns early when selectedSector is null", async () => {
    const mocks = baseMocks();
    await handleDeployAction({
      userId: "user-1",
      selectedSector: null,
      deploymentType: "stellar",
      tessAnomalies: [],
      ...mocks,
    });
    expect(mocks.setDeploying).not.toHaveBeenCalled();
  });

  it("sets no-anomalies message when no anomalies selected", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ researched: [] }),
      });
    
    const mocks = baseMocks();
    await handleDeployAction({
      userId: "user-1",
      selectedSector: { x: 1, y: 2 },
      deploymentType: "stellar",
      tessAnomalies: [],
      ...mocks,
    });
    expect(mocks.setDeploymentMessage).toHaveBeenCalledWith("No anomalies found in selected sector");
    expect(mocks.setDeploying).toHaveBeenCalledWith(false);
  });

  it("deploys stellar anomalies successfully", async () => {
    const anomalies = [
      { id: "1", content: "Star 1", anomalySet: "diskDetective" },
      { id: "2", content: "Star 2", anomalySet: "superwasp-variable" },
    ] as any[];

    // Research summary
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ researched: [] }),
    });
    // Deploy POST
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });
    // Notification
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });

    const mocks = baseMocks();
    await handleDeployAction({
      userId: "user-1",
      selectedSector: { x: 1, y: 2 },
      deploymentType: "stellar",
      tessAnomalies: anomalies,
      ...mocks,
    });
    expect(mocks.setDeploymentResult).toHaveBeenCalled();
    expect(mocks.setShowConfirmation).toHaveBeenCalledWith(true);
  });

  it("handles deploy API failure", async () => {
    const anomalies = [{ id: "10", content: "Star", anomalySet: "diskDetective" }] as any[];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ researched: [] }),
    });
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: "deploy failed" }),
    });

    const mocks = baseMocks();
    await handleDeployAction({
      userId: "user-1",
      selectedSector: { x: 5, y: 5 },
      deploymentType: "stellar",
      tessAnomalies: anomalies,
      ...mocks,
    });
    expect(mocks.setAlreadyDeployed).toHaveBeenCalledWith(false);
  });

  it("deploys planetary anomalies with asteroids path", async () => {
    const anomalies = [
      { id: "20", content: "Planet", anomalySet: "telescope-tess" },
      { id: "21", content: "Asteroid", anomalySet: "telescope-minorPlanet" },
    ] as any[];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ researched: [] }),
    });
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });

    const mocks = baseMocks();
    await handleDeployAction({
      userId: "user-1",
      selectedSector: { x: 2, y: 3 },
      deploymentType: "planetary",
      tessAnomalies: anomalies,
      ...mocks,
    });
    expect(mocks.setDeploymentResult).toHaveBeenCalled();
  });

  it("deploys with probereceptors upgrade (anomalyCount=6)", async () => {
    const anomalies = Array.from({ length: 8 }, (_, i) => ({
      id: String(i),
      content: `Star ${i}`,
      anomalySet: "diskDetective",
    })) as any[];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({ researched: [{ tech_type: "probereceptors" }] }),
    });
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });

    const mocks = baseMocks();
    await handleDeployAction({
      userId: "user-1",
      selectedSector: { x: 3, y: 4 },
      deploymentType: "stellar",
      tessAnomalies: anomalies,
      ...mocks,
    });
    expect(mocks.setDeploymentResult).toHaveBeenCalled();
  });
});
