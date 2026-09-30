import { beforeEach, describe, expect, it, vi } from "vitest";

import { buildClassificationQuery, createClassification, listClassifications, newLegacyId } from "./classifications";
import { resetPocketbaseToken } from "./pocketbase";

const env = { POCKETBASE_URL: "https://pb.test", POCKETBASE_ADMIN_EMAIL: "a@b.c", POCKETBASE_ADMIN_PASSWORD: "x" };
const row = { legacyId: 9, createdAt: "t", author: "user_1", anomaly: 4, classificationtype: "planet", content: "c", media: null, classificationConfiguration: null };

type Call = { method: string; url: URL; body?: any };
function pocketbase(handlers: { onCreate?: (n: number) => Response } = {}) {
  const calls: Call[] = [];
  let creates = 0;
  const fetchImpl = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(String(input));
    if (url.pathname.includes("auth-with-password")) return new Response(JSON.stringify({ token: "t" }));
    calls.push({ method: init?.method ?? "GET", url, body: init?.body ? JSON.parse(String(init.body)) : undefined });
    if (init?.method === "POST") return handlers.onCreate ? handlers.onCreate(++creates) : new Response(JSON.stringify(row));
    if (url.pathname.includes("/anomalies/")) return new Response(JSON.stringify({ items: [{ legacyId: 4, content: "tic" }] }));
    return new Response(JSON.stringify({ items: [row] }));
  });
  return { fetchImpl: fetchImpl as unknown as typeof fetch, calls };
}
const ctx = (fetchImpl: typeof fetch) => ({ env, userId: "user_1", fetchImpl });
const post = (body: unknown) => new Request("https://x.test/api/v1/classifications", { method: "POST", body: JSON.stringify(body) });

describe("classifications reads", () => {
  beforeEach(() => resetPocketbaseToken());

  it("is one request with no COUNT and the legacy row shape", async () => {
    const { fetchImpl, calls } = pocketbase();
    const res = await listClassifications(new Request("https://x.test/api/v1/classifications?author=user_1&anomalies=1,2&limit=9999"), ctx(fetchImpl));
    expect((await res.json()).classifications[0]).toMatchObject({ id: 9, created_at: "t", classificationtype: "planet" });
    expect(calls).toHaveLength(1);
    expect(calls[0].url.searchParams.get("skipTotal")).toBe("1");
    expect(calls[0].url.searchParams.get("perPage")).toBe("1000");
    expect(calls[0].url.searchParams.get("filter")).toBe('author="user_1"&&(anomaly=1||anomaly=2)');
    expect(res.headers.get("cache-control")).toBe("private, no-store");
  });

  it("adds exactly one more read for includeAnomaly", async () => {
    const { fetchImpl, calls } = pocketbase();
    const res = await listClassifications(new Request("https://x.test/api/v1/classifications?id=9&includeAnomaly=true&limit=1"), ctx(fetchImpl));
    expect((await res.json()).classifications[0].anomaly).toMatchObject({ id: 4, content: "tic" });
    expect(calls).toHaveLength(2);
  });

  it("validates numbers and strips quote-injection", () => {
    expect(buildClassificationQuery(new URLSearchParams("id=x"))).toEqual({ error: "Invalid id" });
    expect(buildClassificationQuery(new URLSearchParams('author=a" || id!="'))).toMatchObject({ filter: 'author="a || id!="' });
  });
});

describe("classification writes", () => {
  beforeEach(() => resetPocketbaseToken());

  it("creates with exactly one request, the verified author, and no max-id read", async () => {
    const { fetchImpl, calls } = pocketbase();
    const res = await createClassification(post({ anomaly: "4", classificationtype: " planet ", author: "user_evil", content: "hi" }), ctx(fetchImpl), { now: 1_800_000_000_000, random: () => 0.5 });
    expect(res.status).toBe(200);
    expect(calls).toHaveLength(1);
    expect(calls[0].method).toBe("POST");
    expect(calls[0].body).toMatchObject({ author: "user_1", anomaly: 4, classificationtype: "planet", legacyId: 1_800_000_000_000_500 });
  });

  it("retries once with a fresh id after a unique clash, then gives up", async () => {
    const clash = pocketbase({ onCreate: (n) => (n === 1 ? new Response("{}", { status: 400 }) : new Response(JSON.stringify(row))) });
    expect((await createClassification(post({ anomaly: 1, classificationtype: "x" }), ctx(clash.fetchImpl))).status).toBe(200);
    expect(clash.calls).toHaveLength(2);

    const dead = pocketbase({ onCreate: () => new Response("{}", { status: 400 }) });
    expect((await createClassification(post({ anomaly: 1, classificationtype: "x" }), ctx(dead.fetchImpl))).status).toBe(502);
    expect(dead.calls).toHaveLength(2);
  });

  it("rejects bad payloads before any upstream call", async () => {
    const { fetchImpl, calls } = pocketbase();
    for (const body of [{ classificationtype: "x" }, { anomaly: "nope", classificationtype: "x" }, { anomaly: 1 }]) {
      expect((await createClassification(post(body), ctx(fetchImpl))).status).toBe(400);
    }
    expect((await createClassification(new Request("https://x.test", { method: "POST", body: "{" }), ctx(fetchImpl))).status).toBe(400);
    expect((await createClassification(new Request("https://x.test", { method: "POST", body: "x".repeat(70_000) }), ctx(fetchImpl))).status).toBe(413);
    expect(calls).toHaveLength(0);
  });

  it("ids are time-ordered", () => {
    expect(newLegacyId(2, 0)).toBeGreaterThan(newLegacyId(1, 0.999));
  });
});
