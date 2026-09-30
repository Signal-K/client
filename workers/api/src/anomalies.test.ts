import { beforeEach, describe, expect, it, vi } from "vitest";

import { buildAnomalyQuery, handleAnomalies } from "./anomalies";
import { resetPocketbaseToken } from "./pocketbase";

const env = { POCKETBASE_URL: "https://pb.test", POCKETBASE_ADMIN_EMAIL: "a@b.c", POCKETBASE_ADMIN_PASSWORD: "x" };
const anomaly = { legacyId: 7, content: "tic", orbitalPeriod: 3, avatarUrl: "u", anomalySet: "sunspot" };

function upstream() {
  return vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes("auth-with-password")) return new Response(JSON.stringify({ token: "t" }));
    return new Response(JSON.stringify({ items: [anomaly] }));
  });
}
const memoryCache = () => {
  const store = new Map<string, Response>();
  return {
    match: async (req: Request) => store.get(req.url)?.clone(),
    put: async (req: Request, res: Response) => void store.set(req.url, res),
  };
};

describe("anomalies endpoint", () => {
  beforeEach(() => resetPocketbaseToken());

  it("maps rows to the legacy shape and is publicly cacheable", async () => {
    const fetchImpl = upstream();
    const res = await handleAnomalies(new Request("https://x.test/api/v1/anomalies?anomalySet=sunspot&limit=5"), env, { fetchImpl, cache: memoryCache() });
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toContain("s-maxage=60");
    expect(await res.json()).toMatchObject({ anomalies: [{ id: 7, orbital_period: 3, avatar_url: "u" }] });
    const read = String(fetchImpl.mock.calls.find((c) => String(c[0]).includes("/anomalies/"))![0]);
    expect(decodeURIComponent(read)).toContain('filter=anomalySet="sunspot"');
    expect(read).toContain("perPage=5");
  });

  it("serves repeat requests from the edge cache without touching PocketBase", async () => {
    const fetchImpl = upstream();
    const cache = memoryCache();
    const req = () => new Request("https://x.test/api/v1/anomalies?ids=1,2");
    await handleAnomalies(req(), env, { fetchImpl, cache });
    const calls = fetchImpl.mock.calls.length;
    await handleAnomalies(req(), env, { fetchImpl, cache });
    expect(fetchImpl.mock.calls.length).toBe(calls);
  });

  it("rejects malformed numbers and strips filter-breaking quotes", () => {
    expect(buildAnomalyQuery(new URLSearchParams("id=abc"))).toEqual({ error: "Invalid id" });
    const q = buildAnomalyQuery(new URLSearchParams('content=a" || id!=""'));
    expect(q).toMatchObject({ filter: 'content="a || id!="' });
  });

  it("returns 502 without caching when PocketBase fails", async () => {
    const fetchImpl = vi.fn(async () => new Response("no", { status: 500 }));
    const res = await handleAnomalies(new Request("https://x.test/api/v1/anomalies"), env, { fetchImpl, cache: memoryCache() });
    expect(res.status).toBe(502);
    expect(res.headers.get("cache-control")).toBe("private, no-store");
  });
});
