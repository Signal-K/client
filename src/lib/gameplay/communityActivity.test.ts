import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("fetchCommunityActivity", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.resetModules();
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });
  afterEach(() => vi.unstubAllGlobals());

  it("serves concurrent and repeat callers from one request", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify([{ id: 1, author: "abc", type: "planet", at: "now" }])));
    const { fetchCommunityActivity } = await import("./communityActivity");
    const [a, b] = await Promise.all([fetchCommunityActivity(), fetchCommunityActivity()]);
    await fetchCommunityActivity();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(a).toEqual(b);
  });

  it("retries after an empty or failed response", async () => {
    fetchMock.mockRejectedValueOnce(new Error("offline")).mockResolvedValue(new Response("[]"));
    const { fetchCommunityActivity } = await import("./communityActivity");
    expect(await fetchCommunityActivity()).toEqual([]);
    await fetchCommunityActivity();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
