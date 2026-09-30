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
