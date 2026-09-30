import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { fetchResearchSummary, invalidateResearchSummary } from "./researchSummary";

describe("fetchResearchSummary", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    invalidateResearchSummary();
    fetchMock.mockReset();
    fetchMock.mockImplementation(async () => new Response(JSON.stringify({ counts: { all: 3 } })));
    vi.stubGlobal("fetch", fetchMock);
  });
  afterEach(() => vi.unstubAllGlobals());

  it("shares one request between concurrent callers, each with a readable body", async () => {
    const [a, b] = await Promise.all([fetchResearchSummary(), fetchResearchSummary()]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(await a.json()).toEqual({ counts: { all: 3 } });
    expect(await b.json()).toEqual({ counts: { all: 3 } });
  });

  it("refetches after invalidation", async () => {
    await fetchResearchSummary();
    invalidateResearchSummary();
    await fetchResearchSummary();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("does not cache failed responses", async () => {
    fetchMock.mockImplementationOnce(async () => new Response("no", { status: 500 }));
    await fetchResearchSummary();
    await new Promise((resolve) => setTimeout(resolve, 0));
    await fetchResearchSummary();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

describe("fetchResearchSummary on the edge API", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  async function load(clerk: unknown) {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_EDGE_API", "true");
    const fetchMock = vi.fn(async () => new Response("{}"));
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("window", { Clerk: clerk });
    const mod = await import("./researchSummary");
    return { fetchMock, ...mod };
  }

  it("sends the Clerk token to the Worker when a session is ready", async () => {
    const { fetchMock, fetchResearchSummary } = await load({ loaded: true, session: { getToken: async () => "jwt" } });
    await fetchResearchSummary();
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("/api/v1/research/summary");
    expect(init.headers).toMatchObject({ authorization: "Bearer jwt" });
  });

  it("uses the Next route when Clerk is not ready or signed out", async () => {
    const { fetchMock, fetchResearchSummary } = await load({ loaded: false });
    await fetchResearchSummary();
    expect((fetchMock.mock.calls[0] as unknown as [string])[0]).toBe("/api/gameplay/research/summary");
  });

  it("falls back to the Next route if the Worker fails", async () => {
    const { fetchMock, fetchResearchSummary } = await load({ loaded: true, session: { getToken: async () => "jwt" } });
    fetchMock.mockImplementationOnce(async () => new Response("x", { status: 502 }));
    await fetchResearchSummary();
    expect(fetchMock.mock.calls.map((c) => (c as unknown as [string])[0])).toEqual([
      "/api/v1/research/summary",
      "/api/gameplay/research/summary",
    ]);
  });
});
