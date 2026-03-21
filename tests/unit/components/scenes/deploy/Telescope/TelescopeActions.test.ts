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

// Mock the server actions
const mockGetAnomalies = vi.fn();
const mockGetStatus = vi.fn();
const mockGetSkill = vi.fn();
const mockDeploy = vi.fn();

vi.mock("@/src/features/gameplay/actions/deploy-actions", () => ({
  getTelescopeAnomalies: (...args: any[]) => mockGetAnomalies(...args),
  getTelescopeStatus: (...args: any[]) => mockGetStatus(...args),
  getTelescopeSkillProgress: (...args: any[]) => mockGetSkill(...args),
  deployTelescopeAction: (...args: any[]) => mockDeploy(...args),
}));

// Mock fetch for the notification part which still uses fetch
const mockFetch = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", mockFetch);
  mockFetch.mockReset();
  mockGetAnomalies.mockReset();
  mockGetStatus.mockReset();
  mockGetSkill.mockReset();
  mockDeploy.mockReset();
});

describe("fetchAnomalies", () => {
  it("returns early for non-stellar/planetary types", async () => {
    const setter = vi.fn();
    await fetchAnomalies("unknown", setter);
    expect(mockGetAnomalies).not.toHaveBeenCalled();
    expect(setter).not.toHaveBeenCalled();
  });

  it("calls action for stellar type", async () => {
    mockGetAnomalies.mockResolvedValueOnce({ anomalies: [] });
    const setter = vi.fn();
    await fetchAnomalies("stellar", setter);
    expect(mockGetAnomalies).toHaveBeenCalledWith("stellar");
    expect(setter).toHaveBeenCalledWith([]);
  });

  it("handles failed action gracefully", async () => {
    mockGetAnomalies.mockRejectedValueOnce(new Error("Failed"));
    const setter = vi.fn();
    await fetchAnomalies("planetary", setter);
    expect(setter).not.toHaveBeenCalled();
  });
});

describe("checkDeployment", () => {
  it("sets already deployed to true", async () => {
    mockGetStatus.mockResolvedValueOnce({ alreadyDeployed: true, deploymentMessage: "In orbit" });
    const setDeployed = vi.fn();
    const setMsg = vi.fn();
    await checkDeployment(setDeployed, setMsg);
    expect(setDeployed).toHaveBeenCalledWith(true);
    expect(setMsg).toHaveBeenCalledWith("In orbit");
  });

  it("handles error in status check", async () => {
    mockGetStatus.mockRejectedValueOnce(new Error("Failed"));
    const setDeployed = vi.fn();
    const setMsg = vi.fn();
    await checkDeployment(setDeployed, setMsg);
    expect(setDeployed).not.toHaveBeenCalled();
  });
});

describe("fetchSkillProgress", () => {
  it("calls the setter with skill progress", async () => {
    mockGetSkill.mockResolvedValueOnce({ skillProgress: { telescope: 3, weather: 1 } });
    const setter = vi.fn();
    await fetchSkillProgress(setter);
    expect(setter).toHaveBeenCalledWith({ telescope: 3, weather: 1 });
  });

  it("handles error in skill progress", async () => {
      mockGetSkill.mockRejectedValueOnce(new Error("Failed"));
      const setter = vi.fn();
      await fetchSkillProgress(setter);
      expect(setter).not.toHaveBeenCalled();
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
    // This part still uses fetch for research summary, so we mock fetch
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
    
    // Deploy ACTION success
    mockDeploy.mockResolvedValueOnce({ success: true, inserted: 2 });

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
    expect(mockDeploy).toHaveBeenCalledWith(expect.objectContaining({
        deploymentType: "stellar",
        anomalyIds: [1, 2]
    }));
    expect(mocks.setDeploymentResult).toHaveBeenCalled();
    expect(mocks.setShowConfirmation).toHaveBeenCalledWith(true);
  });

  it("handles deploy API failure", async () => {
    const anomalies = [{ id: "10", content: "Star", anomalySet: "diskDetective" }] as any[];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ researched: [] }),
    });
    
    // Deploy ACTION failure
    mockDeploy.mockResolvedValueOnce({ error: "deploy failed" });

    const mocks = baseMocks();
    await handleDeployAction({
      userId: "user-1",
      selectedSector: { x: 5, y: 5 },
      deploymentType: "stellar",
      tessAnomalies: anomalies,
      ...mocks,
    });
    expect(mocks.setAlreadyDeployed).toHaveBeenCalledWith(false);
    expect(mocks.setDeploymentMessage).toHaveBeenCalledWith("Error deploying telescope. Please try again.");
  });
});
