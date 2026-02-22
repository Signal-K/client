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

  it("exposes setter functions", () => {
    const { result } = renderHook(() => useAnnotatorLogic(p()));
    expect(typeof result.current.setCurrentTool).toBe("function");
    expect(typeof result.current.handleClearAll).toBe("function");
    expect(typeof result.current.addMedia).toBe("function");
    expect(typeof result.current.createPost).toBe("function");
  });

  it("CATEGORY_CONFIG for AI4M has sand", () => {
    const { result } = renderHook(() => useAnnotatorLogic(p()));
    expect(result.current.CATEGORY_CONFIG["sand"]).toBeDefined();
  });

  it("isActiveAsteroids true for AA", () => {
    const { result } = renderHook(() => useAnnotatorLogic(p({ annotationType: "AA" })));
    expect(result.current.isActiveAsteroids).toBe(true);
  });

  it("setCurrentTool updates tool", () => {
    const { result } = renderHook(() => useAnnotatorLogic(p()));
    act(() => { result.current.setCurrentTool("pen"); });
    expect(result.current.currentTool).toBe("pen");
  });

  it("CATEGORY_CONFIG for P4 has fan", () => {
    const { result } = renderHook(() => useAnnotatorLogic(p({ annotationType: "P4" })));
    expect(result.current.CATEGORY_CONFIG["fan"]).toBeDefined();
  });

  it("CATEGORY_CONFIG for PH has Noise", () => {
    const { result } = renderHook(() => useAnnotatorLogic(p({ annotationType: "PH" })));
    expect(result.current.CATEGORY_CONFIG["Noise"]).toBeDefined();
  });

  it("CATEGORY_CONFIG for AA has Tail", () => {
    const { result } = renderHook(() => useAnnotatorLogic(p({ annotationType: "AA" })));
    expect(result.current.CATEGORY_CONFIG["Tail"]).toBeDefined();
  });

  it("setLineWidth updates lineWidth", () => {
    const { result } = renderHook(() => useAnnotatorLogic(p()));
    act(() => { result.current.setLineWidth(5); });
    expect(result.current.lineWidth).toBe(5);
  });

  it("setIsDrawing updates isDrawing", () => {
    const { result } = renderHook(() => useAnnotatorLogic(p()));
    act(() => { result.current.setIsDrawing(true); });
    expect(result.current.isDrawing).toBe(true);
  });

  it("handleClearAll clears drawings", () => {
    const { result } = renderHook(() => useAnnotatorLogic(p()));
    act(() => { result.current.setDrawings([{ type: "square", color: "#f00", width: 2, points: [], category: "sand" as any }]); });
    act(() => { result.current.handleClearAll(); });
    expect(result.current.drawings).toEqual([]);
  });

  it("renderCanvas no-op when refs null", () => {
    const { result } = renderHook(() => useAnnotatorLogic(p()));
    result.current.renderCanvas();
  });

  it("useHorizontalLayout for AA+h-full", () => {
    const { result } = renderHook(() => useAnnotatorLogic(p({ annotationType: "AA", className: "h-full" })));
    expect(result.current.useHorizontalLayout).toBe(true);
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

  it("skips inventory when no session", () => {
    const spy = mf({});
    renderHook(() => useAnnotatorLogic(p({ structureItemId: 10 })));
    expect(spy.mock.calls.filter((c: any[]) => String(c[0]).includes("inventory"))).toHaveLength(0);
  });

  it("handles inventory error", async () => {
    enable();
    mf({ "/api/gameplay/inventory/lookup": fail({ error: "x" }) });
    const { result } = renderHook(() => useAnnotatorLogic(p({ structureItemId: 10 })));
    await waitFor(() => { expect(console.error).toHaveBeenCalled(); });
    expect(result.current.inventoryItemId).toBeNull();
  });

  it("sets hasMineralDeposit when waypoint matches", async () => {
    enable();
    mf({
      "/api/gameplay/inventory/lookup": ok({ item: { id: 99 } }),
      "/api/gameplay/routes/latest": ok({ route: { routeConfiguration: { waypoints: [{ anomalyId: 123, hasMineralDeposit: true }] } } }),
    });
    const { result } = renderHook(() => useAnnotatorLogic(p({ anomalyId: "123" })));
    await waitFor(() => { expect(result.current.hasMineralDeposit).toBe(true); });
  });

  it("submit: no-op without canvas/session", async () => {
    const spy = mf({});
    const { result } = renderHook(() => useAnnotatorLogic(p()));
    await act(async () => { await result.current.handleSubmitClassification(); });
    expect(spy.mock.calls.filter((c: any[]) => String(c[0]).includes("storage/upload"))).toHaveLength(0);
  });

  it("submit: uploads, classifies, redirects", async () => {
    enable();
    const spy = mf({
      "/api/gameplay/inventory/lookup": ok({ item: { id: 99 } }),
      "/api/gameplay/routes/latest": ok({ route: { routeConfiguration: { waypoints: [] } } }),
      "/api/gameplay/linked-anomalies": ok({}),
      "/api/gameplay/storage/upload": ok({ publicUrl: "https://cdn/img.png" }),
      "/api/gameplay/classifications": ok({ id: 77 }),
    });
    const { canvas } = mc();
    const { result } = renderHook(() => useAnnotatorLogic(p({ anomalyId: "42", anomalyType: "rock" })));
    Object.defineProperty(result.current.canvasRef, "current", { value: canvas, writable: true });
    await act(async () => { await result.current.handleSubmitClassification(); });
    const cc = spy.mock.calls.filter((c: any[]) => String(c[0]).includes("/api/gameplay/classifications") && c[1]?.method === "POST");
    expect(cc.length).toBeGreaterThanOrEqual(1);
    const body = JSON.parse(cc[0][1]!.body as string);
    expect(body.anomaly).toBe("42");
    expect(body.classificationtype).toBe("rock");
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
    expect(alertSpy).toHaveBeenCalled();
    expect(result.current.isUploading).toBe(false);
  });

  it("submit: handles classification API failure", async () => {
    enable();
    const alertSpy = vi.spyOn(globalThis, "alert").mockImplementation(() => {});
    mf({
      "/api/gameplay/inventory/lookup": ok({ item: { id: 99 } }),
      "/api/gameplay/routes/latest": ok({ route: { routeConfiguration: { waypoints: [] } } }),
      "/api/gameplay/linked-anomalies": ok({}),
      "/api/gameplay/storage/upload": ok({ publicUrl: "https://cdn/x.png" }),
      "/api/gameplay/classifications": fail({ error: "err" }),
    });
    const { canvas } = mc();
    const { result } = renderHook(() => useAnnotatorLogic(p({ anomalyId: "42" })));
    Object.defineProperty(result.current.canvasRef, "current", { value: canvas, writable: true });
    await act(async () => { await result.current.handleSubmitClassification(); });
    expect(alertSpy).toHaveBeenCalledWith("Failed to create classification. Please try again");
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("submit: handles blob creation failure", async () => {
    enable();
    const alertSpy = vi.spyOn(globalThis, "alert").mockImplementation(() => {});
    mf({ "/api/gameplay/inventory/lookup": ok({ item: { id: 99 } }), "/api/gameplay/routes/latest": ok({ route: { routeConfiguration: { waypoints: [] } } }) });
    const { canvas } = mc();
    (canvas as any).toBlob = vi.fn((cb: any) => cb(null));
    const { result } = renderHook(() => useAnnotatorLogic(p({ anomalyId: "42" })));
    Object.defineProperty(result.current.canvasRef, "current", { value: canvas, writable: true });
    await act(async () => { await result.current.handleSubmitClassification(); });
    expect(alertSpy).toHaveBeenCalledWith("Failed to submit classification. Please try again.");
  });

  it("submit: calls onClassificationComplete", async () => {
    enable();
    mf({
      "/api/gameplay/inventory/lookup": ok({ item: { id: 99 } }),
      "/api/gameplay/routes/latest": ok({ route: { routeConfiguration: { waypoints: [] } } }),
      "/api/gameplay/linked-anomalies": ok({}),
      "/api/gameplay/storage/upload": ok({ publicUrl: "https://cdn/x.png" }),
      "/api/gameplay/classifications": ok({ id: 77 }),
    });
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
      "/api/gameplay/linked-anomalies": ok({ classification_id: 555 }),
      "/api/gameplay/storage/upload": ok({ publicUrl: "https://cdn/x.png" }),
      "/api/gameplay/classifications": ok({ id: 77 }),
    });
    const { canvas } = mc();
    const { result } = renderHook(() => useAnnotatorLogic(p({ anomalyId: "42" })));
    Object.defineProperty(result.current.canvasRef, "current", { value: canvas, writable: true });
    await act(async () => { await result.current.handleSubmitClassification(); });
    const cc = (globalThis.fetch as any).mock.calls.filter((c: any[]) => String(c[0]).includes("/api/gameplay/classifications") && c[1]?.method === "POST");
    expect(JSON.parse(cc[0][1].body).classificationConfiguration.parentPlanet).toBe(555);
  });

  it("addMedia: no-op without canvas/session", async () => {
    const spy = mf({});
    const { result } = renderHook(() => useAnnotatorLogic(p()));
    await act(async () => { await result.current.addMedia(); });
    expect(spy.mock.calls.filter((c: any[]) => String(c[0]).includes("storage/upload"))).toHaveLength(0);
  });

  it("addMedia: uploads and adds to uploads", async () => {
    enable();
    mf({ "/api/gameplay/inventory/lookup": ok({ item: { id: 99 } }), "/api/gameplay/storage/upload": ok({ publicUrl: "https://cdn/img.png" }) });
    const { canvas } = mc();
    const { result } = renderHook(() => useAnnotatorLogic(p()));
    Object.defineProperty(result.current.canvasRef, "current", { value: canvas, writable: true });
    await act(async () => { await result.current.addMedia(); });
    expect(result.current.uploads).toHaveLength(1);
    expect(result.current.isFormVisible).toBe(true);
  });

  it("addMedia: handles upload error", async () => {
    enable();
    mf({ "/api/gameplay/inventory/lookup": ok({ item: { id: 99 } }), "/api/gameplay/storage/upload": fail({ error: "x" }) });
    const { canvas } = mc();
    const { result } = renderHook(() => useAnnotatorLogic(p()));
    Object.defineProperty(result.current.canvasRef, "current", { value: canvas, writable: true });
    await act(async () => { await result.current.addMedia(); });
    expect(result.current.uploads).toHaveLength(0);
    expect(result.current.isUploading).toBe(false);
  });

  it("addMedia: handles blob failure", async () => {
    enable();
    mf({ "/api/gameplay/inventory/lookup": ok({ item: { id: 99 } }) });
    const { canvas } = mc();
    (canvas as any).toBlob = vi.fn((cb: any) => cb(null));
    const { result } = renderHook(() => useAnnotatorLogic(p()));
    Object.defineProperty(result.current.canvasRef, "current", { value: canvas, writable: true });
    await act(async () => { await result.current.addMedia(); });
    expect(result.current.uploads).toHaveLength(0);
  });

  it("createPost: skips when session null", async () => {
    const spy = mf({});
    const { result } = renderHook(() => useAnnotatorLogic(p()));
    await act(async () => { await result.current.createPost(); });
    expect(spy.mock.calls.filter((c: any[]) => String(c[0]).includes("classifications") && c[1]?.method === "POST")).toHaveLength(0);
  });

  it("createPost: creates classification and redirects", async () => {
    enable();
    mf({
      "/api/gameplay/inventory/lookup": ok({ item: { id: 99 } }),
      "/api/gameplay/routes/latest": ok({ route: { routeConfiguration: { waypoints: [] } } }),
      "/api/gameplay/linked-anomalies": ok({}),
      "/api/gameplay/classifications": ok({ id: 77 }),
    });
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
      "/api/gameplay/linked-anomalies": ok({}),
      "/api/gameplay/classifications": fail({ error: "err" }),
    });
    const { result } = renderHook(() => useAnnotatorLogic(p({ anomalyId: "42" })));
    await act(async () => { await result.current.createPost(); });
    expect(alertSpy).toHaveBeenCalledWith("Failed to create classification. Please try again");
  });

  it("createPost: handles network error", async () => {
    enable();
    const alertSpy = vi.spyOn(globalThis, "alert").mockImplementation(() => {});
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("network"));
    const { result } = renderHook(() => useAnnotatorLogic(p({ anomalyId: "42" })));
    await act(async () => { await result.current.createPost(); });
    expect(alertSpy).toHaveBeenCalledWith("Classification error occurred. Please try again");
  });

  it("createPost: calls onClassificationComplete", async () => {
    enable();
    mf({
      "/api/gameplay/inventory/lookup": ok({ item: { id: 99 } }),
      "/api/gameplay/routes/latest": ok({ route: { routeConfiguration: { waypoints: [] } } }),
      "/api/gameplay/linked-anomalies": ok({}),
      "/api/gameplay/classifications": ok({ id: 77 }),
    });
    const cb = vi.fn();
    const { result } = renderHook(() => useAnnotatorLogic(p({ anomalyId: "42", onClassificationComplete: cb })));
    await act(async () => { await result.current.createPost(); });
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it("createPost: linked-anomaly sets parentPlanet", async () => {
    enable();
    mf({
      "/api/gameplay/inventory/lookup": ok({ item: { id: 99 } }),
      "/api/gameplay/routes/latest": ok({ route: { routeConfiguration: { waypoints: [] } } }),
      "/api/gameplay/linked-anomalies": ok({ classification_id: 999 }),
      "/api/gameplay/classifications": ok({ id: 77 }),
    });
    const { result } = renderHook(() => useAnnotatorLogic(p({ anomalyId: "42" })));
    await act(async () => { await result.current.createPost(); });
    const cc = (globalThis.fetch as any).mock.calls.filter((c: any[]) => String(c[0]).includes("/api/gameplay/classifications") && c[1]?.method === "POST");
    expect(JSON.parse(cc[0][1].body).classificationConfiguration.parentPlanet).toBe(999);
  });

  it("createPost: uses activePlanet as parentPlanet fallback", async () => {
    enable();
    mf({
      "/api/gameplay/inventory/lookup": ok({ item: { id: 99 } }),
      "/api/gameplay/routes/latest": ok({ route: { routeConfiguration: { waypoints: [] } } }),
      "/api/gameplay/linked-anomalies": ok({}),
      "/api/gameplay/classifications": ok({ id: 77 }),
    });
    const { result } = renderHook(() => useAnnotatorLogic(p({ anomalyId: "42" })));
    await act(async () => { await result.current.createPost(); });
    const cc = (globalThis.fetch as any).mock.calls.filter((c: any[]) => String(c[0]).includes("/api/gameplay/classifications") && c[1]?.method === "POST");
    expect(JSON.parse(cc[0][1].body).classificationConfiguration.parentPlanet).toBe(42);
  });

  it("createPost: sends uploads in media", async () => {
    enable();
    mf({
      "/api/gameplay/inventory/lookup": ok({ item: { id: 99 } }),
      "/api/gameplay/routes/latest": ok({ route: { routeConfiguration: { waypoints: [] } } }),
      "/api/gameplay/linked-anomalies": ok({}),
      "/api/gameplay/classifications": ok({ id: 77 }),
    });
    const { result } = renderHook(() => useAnnotatorLogic(p({ anomalyId: "42" })));
    act(() => { result.current.setUploads([["https://m/1.png","f1.png"]]); });
    await act(async () => { await result.current.createPost(); });
    const cc = (globalThis.fetch as any).mock.calls.filter((c: any[]) => String(c[0]).includes("/api/gameplay/classifications") && c[1]?.method === "POST");
    expect(JSON.parse(cc[0][1].body).media).toEqual(expect.arrayContaining([["https://m/1.png","f1.png"]]));
  });

  it("submit: creates mineral deposit when hasMineralDeposit", async () => {
    enable();
    const spy = mf({
      "/api/gameplay/inventory/lookup": ok({ item: { id: 99 } }),
      "/api/gameplay/routes/latest": ok({ route: { routeConfiguration: { waypoints: [{ anomalyId: 42, hasMineralDeposit: true }] } } }),
      "/api/gameplay/linked-anomalies": ok({}),
      "/api/gameplay/storage/upload": ok({ publicUrl: "https://cdn/x.png" }),
      "/api/gameplay/classifications": ok({ id: 77 }),
      "/api/gameplay/mineral-deposits": ok({ id: 55 }),
    });
    const { canvas } = mc();
    const { result } = renderHook(() => useAnnotatorLogic(p({ anomalyId: "42" })));
    await waitFor(() => { expect(result.current.hasMineralDeposit).toBe(true); });
    Object.defineProperty(result.current.canvasRef, "current", { value: canvas, writable: true });
    await act(async () => { await result.current.handleSubmitClassification(); });
    expect(spy.mock.calls.filter((c: any[]) => String(c[0]).includes("mineral-deposits")).length).toBeGreaterThanOrEqual(1);
  });

  it("createPost: creates mineral deposit when hasMineralDeposit", async () => {
    enable();
    const spy = mf({
      "/api/gameplay/inventory/lookup": ok({ item: { id: 99 } }),
      "/api/gameplay/routes/latest": ok({ route: { routeConfiguration: { waypoints: [{ anomalyId: 42, hasMineralDeposit: true }] } } }),
      "/api/gameplay/linked-anomalies": ok({}),
      "/api/gameplay/classifications": ok({ id: 77 }),
      "/api/gameplay/mineral-deposits": ok({ id: 123 }),
    });
    const { result } = renderHook(() => useAnnotatorLogic(p({ anomalyId: "42" })));
    await waitFor(() => { expect(result.current.hasMineralDeposit).toBe(true); });
    await act(async () => { await result.current.createPost(); });
    expect(spy.mock.calls.filter((c: any[]) => String(c[0]).includes("mineral-deposits")).length).toBeGreaterThanOrEqual(1);
  });

  it("createPost: handles mineral deposit failure", async () => {
    enable();
    mf({
      "/api/gameplay/inventory/lookup": ok({ item: { id: 99 } }),
      "/api/gameplay/routes/latest": ok({ route: { routeConfiguration: { waypoints: [{ anomalyId: 42, hasMineralDeposit: true }] } } }),
      "/api/gameplay/linked-anomalies": ok({}),
      "/api/gameplay/classifications": ok({ id: 77 }),
      "/api/gameplay/mineral-deposits": fail({}),
    });
    const { result } = renderHook(() => useAnnotatorLogic(p({ anomalyId: "42" })));
    await waitFor(() => { expect(result.current.hasMineralDeposit).toBe(true); });
    await act(async () => { await result.current.createPost(); });
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
