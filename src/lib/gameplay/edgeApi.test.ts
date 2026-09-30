import { afterEach, describe, expect, it, vi } from "vitest";

const capture = vi.fn();
vi.mock("posthog-js", () => ({ default: { capture: (...args: unknown[]) => capture(...args) } }));

async function load(options: { edge: boolean; clerk?: unknown }) {
  vi.resetModules();
  vi.stubEnv("NEXT_PUBLIC_EDGE_API", options.edge ? "true" : "false");
  const fetchMock = vi.fn(async () => new Response("{}"));
  vi.stubGlobal("fetch", fetchMock);
  vi.stubGlobal("window", { Clerk: options.clerk });
  const { classificationsFetch } = await import("./edgeApi");
  return { fetchMock, classificationsFetch };
}
const ready = { loaded: true, session: { getToken: async () => "jwt" } };
const urls = (mock: ReturnType<typeof vi.fn>) => mock.mock.calls.map((c) => (c as unknown as [string])[0]);

describe("classificationsFetch", () => {
  afterEach(() => {
    capture.mockClear();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("stays on the Next route when the edge flag is off", async () => {
    const { fetchMock, classificationsFetch } = await load({ edge: false, clerk: ready });
    await classificationsFetch("/api/gameplay/classifications?limit=1");
    expect(urls(fetchMock)).toEqual(["/api/gameplay/classifications?limit=1"]);
  });

  it("sends reads to the Worker with the Clerk token", async () => {
    const { fetchMock, classificationsFetch } = await load({ edge: true, clerk: ready });
    await classificationsFetch("/api/gameplay/classifications?author=u&limit=5");
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("/api/v1/classifications?author=u&limit=5");
    expect((init.headers as Headers).get("authorization")).toBe("Bearer jwt");
  });

  it("uses the Next route without a ready Clerk session", async () => {
    const { fetchMock, classificationsFetch } = await load({ edge: true, clerk: { loaded: false } });
    await classificationsFetch("/api/gameplay/classifications");
    expect(urls(fetchMock)).toEqual(["/api/gameplay/classifications"]);
  });

  it("waits for Clerk to finish loading before choosing a route", async () => {
    const clerk = { loaded: false, session: { getToken: async () => "jwt" } };
    const { fetchMock, classificationsFetch } = await load({ edge: true, clerk });
    setTimeout(() => {
      clerk.loaded = true;
    }, 120);
    await classificationsFetch("/api/gameplay/classifications?limit=1");
    expect(urls(fetchMock)).toEqual(["/api/v1/classifications?limit=1"]);
  });

  it("falls back to Next for a failed read but never re-sends a write", async () => {
    const read = await load({ edge: true, clerk: ready });
    read.fetchMock.mockImplementationOnce(async () => new Response("x", { status: 502 }));
    await read.classificationsFetch("/api/gameplay/classifications?id=1");
    expect(urls(read.fetchMock)).toEqual(["/api/v1/classifications?id=1", "/api/gameplay/classifications?id=1"]);

    const write = await load({ edge: true, clerk: ready });
    write.fetchMock.mockImplementationOnce(async () => {
      throw new Error("network");
    });
    await expect(write.classificationsFetch("/api/gameplay/classifications", { method: "POST", body: "{}" })).rejects.toThrow("network");
    expect(urls(write.fetchMock)).toEqual(["/api/v1/classifications"]);
  });

  it("leaves classification sub-routes alone", async () => {
    const { fetchMock, classificationsFetch } = await load({ edge: true, clerk: ready });
    await classificationsFetch("/api/gameplay/classifications/count?classificationtype=cloud");
    expect(urls(fetchMock)).toEqual(["/api/gameplay/classifications/count?classificationtype=cloud"]);
  });

  it("sends classification_submitted from the browser after a successful Worker write", async () => {
    const { fetchMock, classificationsFetch } = await load({ edge: true, clerk: ready });
    fetchMock.mockImplementationOnce(async () => new Response(JSON.stringify({ id: 77 })));
    await classificationsFetch("/api/gameplay/classifications", {
      method: "POST",
      body: JSON.stringify({ anomaly: 4, classificationtype: "planet" }),
    });
    await vi.waitFor(() =>
      expect(capture).toHaveBeenCalledWith("classification_submitted", {
        source: "api",
        classification_id: 77,
        classificationtype: "planet",
        anomaly: 4,
      }),
    );
  });

  it("does not send analytics for reads or failed writes", async () => {
    const { fetchMock, classificationsFetch } = await load({ edge: true, clerk: ready });
    await classificationsFetch("/api/gameplay/classifications?id=1");
    fetchMock.mockImplementationOnce(async () => new Response("no", { status: 400 }));
    await classificationsFetch("/api/gameplay/classifications", { method: "POST", body: "{}" });
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(capture).not.toHaveBeenCalled();
  });
});
