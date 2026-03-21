import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn(), prefetch: vi.fn() }),
  useSearchParams: () => ({ get: vi.fn() }),
}));
vi.mock("@/src/lib/auth/session-context", () => ({ useSession: vi.fn(() => null) }));
vi.mock("@/src/core/context/ActivePlanet", () => ({
  useActivePlanet: vi.fn(() => ({ activePlanet: null, setActivePlanet: vi.fn(), updatePlanetLocation: vi.fn(), classifications: [], setClassifications: vi.fn() })),
}));
vi.mock("@/src/utils/mineralAnalysis", () => ({
  determineMineralType: vi.fn(() => ({ mineralType: "iron", purity: 0.8, estimatedQuantity: 100, extractionDifficulty: "medium", confidence: 0.9 })),
}));

// Mock Server Actions
const mockCreateClassification = vi.fn();
const mockCreateMineralDeposit = vi.fn();
const mockGetLinkedAnomaly = vi.fn();

vi.mock("@/src/features/gameplay/actions/classification-actions", () => ({
  createClassificationAction: (...args: any[]) => mockCreateClassification(...args),
}));
vi.mock("@/src/features/gameplay/actions/mineral-actions", () => ({
  createMineralDepositAction: (...args: any[]) => mockCreateMineralDeposit(...args),
}));
vi.mock("@/src/features/gameplay/actions/deploy-actions", () => ({
  getLinkedAnomaly: (...args: any[]) => mockGetLinkedAnomaly(...args),
}));

import { useAnnotatorLogic, type ImageAnnotatorProps } from "@/src/components/projects/(classifications)/Annotating/useAnnotatorLogic";
import { useSession } from "@/src/lib/auth/session-context";
import { useActivePlanet } from "@/src/core/context/ActivePlanet";

const SESSION = { user: { id: "u1", email: "t@e.com" }, access_token: "t", expires_at: 9e9, expires_in: 3600, refresh_token: "r", token_type: "bearer" };
const PLANET = { id: 42, name: "Mars" };

function enable() {
  vi.mocked(useSession).mockReturnValue(SESSION as any);
  vi.mocked(useActivePlanet).mockReturnValue({ activePlanet: PLANET, setActivePlanet: vi.fn(), updatePlanetLocation: vi.fn(), classifications: [], setClassifications: vi.fn() } as any);
}

function p(o: Partial<ImageAnnotatorProps> = {}): ImageAnnotatorProps {
  return { initialImageUrl: "", annotationType: "AI4M", ...o };
}

function ok(d: any): Response { return { ok: true, status: 200, json: async () => d, text: async () => JSON.stringify(d), headers: new Headers() } as any; }
function fail(d: any): Response { return { ok: false, status: 500, json: async () => d, text: async () => JSON.stringify(d), headers: new Headers(), statusText: "Error" } as any; }

function mf(map: Record<string, Response> = {}) {
  return vi.spyOn(globalThis, "fetch").mockImplementation(async (url: any) => {
    const u = typeof url === "string" ? url : url instanceof URL ? url.toString() : (url as Request).url;
    for (const [k, v] of Object.entries(map)) { if (u.includes(k)) return v; }
    return ok({});
  });
}

function mc() {
  const ctx = { clearRect: vi.fn(), drawImage: vi.fn() };
  return {
    canvas: {
      getContext: vi.fn(() => ctx),
      toBlob: vi.fn((cb: any) => cb(new Blob(["x"], { type: "image/png" }))),
      width: 80,
      height: 60,
      style: { width: "", height: "", cursor: "" },
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as HTMLCanvasElement,
    ctx,
  };
}

describe("useAnnotatorLogic – state & config", () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockCreateClassification.mockReset();
    mockCreateMineralDeposit.mockReset();
    mockGetLinkedAnomaly.mockReset();
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "log").mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.mocked(useSession).mockReturnValue(null);
    vi.mocked(useActivePlanet).mockReturnValue({ activePlanet: null, setActivePlanet: vi.fn(), updatePlanetLocation: vi.fn(), classifications: [], setClassifications: vi.fn() } as any);
  });

  it("returns initial state defaults", () => {
    const { result } = renderHook(() => useAnnotatorLogic(p()));
    expect(result.current.isDrawing).toBe(false);
    expect(result.current.currentTool).toBe("square");
    expect(result.current.lineWidth).toBe(2);
    expect(result.current.drawings).toEqual([]);
    expect(result.current.isUploading).toBe(false);
    expect(result.current.uploads).toEqual([]);
    expect(result.current.hasMineralDeposit).toBe(false);
    expect(result.current.content).toBe("");
  });

  // ... (keep unchanged tests) ...
  it("exposes setter functions", () => {
    const { result } = renderHook(() => useAnnotatorLogic(p()));
    expect(typeof result.current.setCurrentTool).toBe("function");
    expect(typeof result.current.handleClearAll).toBe("function");
    expect(typeof result.current.addMedia).toBe("function");
    expect(typeof result.current.createPost).toBe("function");
  });

  it("exposes activePlanet from context", () => {
    enable();
    mf({});
    const { result } = renderHook(() => useAnnotatorLogic(p()));
    expect(result.current.activePlanet).toEqual(PLANET);
  });

  it("fetches inventory when context present", async () => {
    enable();
    const spy = mf({ "/api/gameplay/inventory/lookup": ok({ item: { id: 99 } }) });
    const { result } = renderHook(() => useAnnotatorLogic(p({ structureItemId: 10 })));
    await waitFor(() => { expect(result.current.inventoryItemId).toBe(99); });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining("inventory/lookup"), expect.objectContaining({ cache: "no-store" }));
  });

  // Replaced tests using Server Actions

  it("submit: uploads, classifies, redirects", async () => {
    enable();
    // Mock other fetches (inventory, routes, upload)
    mf({
      "/api/gameplay/inventory/lookup": ok({ item: { id: 99 } }),
      "/api/gameplay/routes/latest": ok({ route: { routeConfiguration: { waypoints: [] } } }),
      "/api/gameplay/storage/upload": ok({ publicUrl: "https://cdn/img.png" }),
    });
    // Mock Actions
    mockGetLinkedAnomaly.mockResolvedValue({ success: true });
    mockCreateClassification.mockResolvedValue({ success: true, data: { id: 77 } });

    const { canvas } = mc();
    const { result } = renderHook(() => useAnnotatorLogic(p({ anomalyId: "42", anomalyType: "rock" })));
    Object.defineProperty(result.current.canvasRef, "current", { value: canvas, writable: true });
    
    await act(async () => { await result.current.handleSubmitClassification(); });
    
    expect(mockCreateClassification).toHaveBeenCalledWith(expect.objectContaining({
        anomaly: 42,
        classificationtype: "rock"
    }));
    expect(mockPush).toHaveBeenCalledWith("/next/77");
  });

  it("submit: handles upload failure", async () => {
    enable();
    const alertSpy = vi.spyOn(globalThis, "alert").mockImplementation(() => {});
    mf({
      "/api/gameplay/inventory/lookup": ok({ item: { id: 99 } }),
      "/api/gameplay/routes/latest": ok({ route: { routeConfiguration: { waypoints: [] } } }),
      "/api/gameplay/storage/upload": fail({ error: "Upload failed" }),
    });
    const { canvas } = mc();
    const { result } = renderHook(() => useAnnotatorLogic(p({ anomalyId: "42" })));
    Object.defineProperty(result.current.canvasRef, "current", { value: canvas, writable: true });
    await act(async () => { await result.current.handleSubmitClassification(); });
    expect(alertSpy).toHaveBeenCalled(); // Should catch upload error
    expect(result.current.isUploading).toBe(false);
  });

  it("submit: handles classification API failure", async () => {
    enable();
    const alertSpy = vi.spyOn(globalThis, "alert").mockImplementation(() => {});
    mf({
      "/api/gameplay/inventory/lookup": ok({ item: { id: 99 } }),
      "/api/gameplay/routes/latest": ok({ route: { routeConfiguration: { waypoints: [] } } }),
      "/api/gameplay/storage/upload": ok({ publicUrl: "https://cdn/x.png" }),
    });
    mockGetLinkedAnomaly.mockResolvedValue({ success: true });
    mockCreateClassification.mockResolvedValue({ error: "err" }); // Action failure

    const { canvas } = mc();
    const { result } = renderHook(() => useAnnotatorLogic(p({ anomalyId: "42" })));
    Object.defineProperty(result.current.canvasRef, "current", { value: canvas, writable: true });
    await act(async () => { await result.current.handleSubmitClassification(); });
    
    expect(alertSpy).toHaveBeenCalledWith("Failed to create classification. Please try again");
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("submit: calls onClassificationComplete", async () => {
    enable();
    mf({
      "/api/gameplay/inventory/lookup": ok({ item: { id: 99 } }),
      "/api/gameplay/routes/latest": ok({ route: { routeConfiguration: { waypoints: [] } } }),
      "/api/gameplay/storage/upload": ok({ publicUrl: "https://cdn/x.png" }),
    });
    mockGetLinkedAnomaly.mockResolvedValue({ success: true });
    mockCreateClassification.mockResolvedValue({ success: true, data: { id: 77 } });

    const cb = vi.fn();
    const { canvas } = mc();
    const { result } = renderHook(() => useAnnotatorLogic(p({ anomalyId: "42", onClassificationComplete: cb })));
    Object.defineProperty(result.current.canvasRef, "current", { value: canvas, writable: true });
    await act(async () => { await result.current.handleSubmitClassification(); });
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it("submit: linked-anomaly classification_id as parentPlanet", async () => {
    enable();
    mf({
      "/api/gameplay/inventory/lookup": ok({ item: { id: 99 } }),
      "/api/gameplay/routes/latest": ok({ route: { routeConfiguration: { waypoints: [] } } }),
      "/api/gameplay/storage/upload": ok({ publicUrl: "https://cdn/x.png" }),
    });
    // Mock linked anomaly returning a classification_id
    mockGetLinkedAnomaly.mockResolvedValue({ success: true, data: { classification_id: 555 } });
    mockCreateClassification.mockResolvedValue({ success: true, data: { id: 77 } });

    const { canvas } = mc();
    const { result } = renderHook(() => useAnnotatorLogic(p({ anomalyId: "42" })));
    Object.defineProperty(result.current.canvasRef, "current", { value: canvas, writable: true });
    await act(async () => { await result.current.handleSubmitClassification(); });
    
    expect(mockCreateClassification).toHaveBeenCalledWith(expect.objectContaining({
        classificationConfiguration: expect.objectContaining({ parentPlanet: 555 })
    }));
  });

  it("createPost: creates classification and redirects", async () => {
    enable();
    mf({
      "/api/gameplay/inventory/lookup": ok({ item: { id: 99 } }),
      "/api/gameplay/routes/latest": ok({ route: { routeConfiguration: { waypoints: [] } } }),
    });
    mockGetLinkedAnomaly.mockResolvedValue({ success: true });
    mockCreateClassification.mockResolvedValue({ success: true, data: { id: 77 } });

    const { result } = renderHook(() => useAnnotatorLogic(p({ anomalyId: "42", anomalyType: "rock" })));
    await act(async () => { await result.current.createPost(); });
    expect(mockPush).toHaveBeenCalledWith("/next/77");
    expect(result.current.content).toBe("");
  });

  it("createPost: handles classification failure", async () => {
    enable();
    const alertSpy = vi.spyOn(globalThis, "alert").mockImplementation(() => {});
    mf({
      "/api/gameplay/inventory/lookup": ok({ item: { id: 99 } }),
      "/api/gameplay/routes/latest": ok({ route: { routeConfiguration: { waypoints: [] } } }),
    });
    mockGetLinkedAnomaly.mockResolvedValue({ success: true });
    mockCreateClassification.mockResolvedValue({ error: "err" });

    const { result } = renderHook(() => useAnnotatorLogic(p({ anomalyId: "42" })));
    await act(async () => { await result.current.createPost(); });
    expect(alertSpy).toHaveBeenCalledWith("Failed to create classification. Please try again");
  });

  it("createPost: handles network error", async () => {
    enable();
    const alertSpy = vi.spyOn(globalThis, "alert").mockImplementation(() => {});
    // Mock action throwing error
    mockCreateClassification.mockRejectedValue(new Error("network"));
    mockGetLinkedAnomaly.mockResolvedValue({ success: true });
    
    // We also need to mock fetches that happen in init
    mf({ "/api/gameplay/inventory/lookup": ok({ item: { id: 99 } }) });

    const { result } = renderHook(() => useAnnotatorLogic(p({ anomalyId: "42" })));
    await act(async () => { await result.current.createPost(); });
    expect(alertSpy).toHaveBeenCalledWith("Classification error occurred. Please try again");
  });

  it("createPost: calls onClassificationComplete", async () => {
    enable();
    mf({ "/api/gameplay/inventory/lookup": ok({ item: { id: 99 } }) });
    mockGetLinkedAnomaly.mockResolvedValue({ success: true });
    mockCreateClassification.mockResolvedValue({ success: true, data: { id: 77 } });

    const cb = vi.fn();
    const { result } = renderHook(() => useAnnotatorLogic(p({ anomalyId: "42", onClassificationComplete: cb })));
    await act(async () => { await result.current.createPost(); });
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it("createPost: linked-anomaly sets parentPlanet", async () => {
    enable();
    mf({ "/api/gameplay/inventory/lookup": ok({ item: { id: 99 } }) });
    mockGetLinkedAnomaly.mockResolvedValue({ success: true, data: { classification_id: 999 } });
    mockCreateClassification.mockResolvedValue({ success: true, data: { id: 77 } });

    const { result } = renderHook(() => useAnnotatorLogic(p({ anomalyId: "42" })));
    await act(async () => { await result.current.createPost(); });
    
    expect(mockCreateClassification).toHaveBeenCalledWith(expect.objectContaining({
        classificationConfiguration: expect.objectContaining({ parentPlanet: 999 })
    }));
  });

  it("createPost: uses activePlanet as parentPlanet fallback", async () => {
    enable();
    mf({ "/api/gameplay/inventory/lookup": ok({ item: { id: 99 } }) });
    mockGetLinkedAnomaly.mockResolvedValue({ success: true });
    mockCreateClassification.mockResolvedValue({ success: true, data: { id: 77 } });

    const { result } = renderHook(() => useAnnotatorLogic(p({ anomalyId: "42" })));
    await act(async () => { await result.current.createPost(); });
    
    expect(mockCreateClassification).toHaveBeenCalledWith(expect.objectContaining({
        classificationConfiguration: expect.objectContaining({ parentPlanet: 42 }) // PLANET.id
    }));
  });

  it("createPost: sends uploads in media", async () => {
    enable();
    mf({ "/api/gameplay/inventory/lookup": ok({ item: { id: 99 } }) });
    mockGetLinkedAnomaly.mockResolvedValue({ success: true });
    mockCreateClassification.mockResolvedValue({ success: true, data: { id: 77 } });

    const { result } = renderHook(() => useAnnotatorLogic(p({ anomalyId: "42" })));
    act(() => { result.current.setUploads([["https://m/1.png","f1.png"]]); });
    await act(async () => { await result.current.createPost(); });
    
    expect(mockCreateClassification).toHaveBeenCalledWith(expect.objectContaining({
        media: expect.arrayContaining([["https://m/1.png","f1.png"]])
    }));
  });

  it("submit: creates mineral deposit when hasMineralDeposit", async () => {
    enable();
    mf({
      "/api/gameplay/inventory/lookup": ok({ item: { id: 99 } }),
      "/api/gameplay/routes/latest": ok({ route: { routeConfiguration: { waypoints: [{ anomalyId: 42, hasMineralDeposit: true }] } } }),
      "/api/gameplay/storage/upload": ok({ publicUrl: "https://cdn/x.png" }),
    });
    mockGetLinkedAnomaly.mockResolvedValue({ success: true });
    mockCreateClassification.mockResolvedValue({ success: true, data: { id: 77 } });
    mockCreateMineralDeposit.mockResolvedValue({ success: true, data: { id: 55 } });

    const { canvas } = mc();
    const { result } = renderHook(() => useAnnotatorLogic(p({ anomalyId: "42" })));
    await waitFor(() => { expect(result.current.hasMineralDeposit).toBe(true); });
    Object.defineProperty(result.current.canvasRef, "current", { value: canvas, writable: true });
    await act(async () => { await result.current.handleSubmitClassification(); });
    
    expect(mockCreateMineralDeposit).toHaveBeenCalledTimes(1);
  });

  it("createPost: creates mineral deposit when hasMineralDeposit", async () => {
    enable();
    mf({
      "/api/gameplay/inventory/lookup": ok({ item: { id: 99 } }),
      "/api/gameplay/routes/latest": ok({ route: { routeConfiguration: { waypoints: [{ anomalyId: 42, hasMineralDeposit: true }] } } }),
    });
    mockGetLinkedAnomaly.mockResolvedValue({ success: true });
    mockCreateClassification.mockResolvedValue({ success: true, data: { id: 77 } });
    mockCreateMineralDeposit.mockResolvedValue({ success: true, data: { id: 123 } });

    const { result } = renderHook(() => useAnnotatorLogic(p({ anomalyId: "42" })));
    await waitFor(() => { expect(result.current.hasMineralDeposit).toBe(true); });
    await act(async () => { await result.current.createPost(); });
    
    expect(mockCreateMineralDeposit).toHaveBeenCalledTimes(1);
  });

  it("createPost: handles mineral deposit failure", async () => {
    enable();
    mf({
      "/api/gameplay/inventory/lookup": ok({ item: { id: 99 } }),
      "/api/gameplay/routes/latest": ok({ route: { routeConfiguration: { waypoints: [{ anomalyId: 42, hasMineralDeposit: true }] } } }),
    });
    mockGetLinkedAnomaly.mockResolvedValue({ success: true });
    mockCreateClassification.mockResolvedValue({ success: true, data: { id: 77 } });
    mockCreateMineralDeposit.mockResolvedValue({ error: "fail" }); // Mineral fail

    const { result } = renderHook(() => useAnnotatorLogic(p({ anomalyId: "42" })));
    await waitFor(() => { expect(result.current.hasMineralDeposit).toBe(true); });
    await act(async () => { await result.current.createPost(); });
    
    // Should still redirect even if mineral creation fails (logged to console)
    expect(mockPush).toHaveBeenCalledWith("/next/77");
  });

  it("annotationOptions derive from drawings", async () => {
    const { result } = renderHook(() => useAnnotatorLogic(p()));
    act(() => {
      result.current.setDrawings([
        { type: "square", color: "#f00", width: 2, points: [], category: "sand" as any },
        { type: "square", color: "#f00", width: 2, points: [], category: "sand" as any },
        { type: "circle", color: "#00f", width: 2, points: [], category: "bedrock" as any },
      ]);
    });
    await waitFor(() => { expect(result.current.annotationOptions).toHaveLength(2); });
    expect(result.current.categoryCount).toEqual({ sand: 2, bedrock: 1 });
  });
});
