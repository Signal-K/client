import { beforeEach, describe, expect, it, vi } from "vitest";
import { handle, type Env } from "./index";
import { resetPocketbaseToken } from "./pocketbase";
import { PLAYTEST_MARKER } from "./playtest";

const SECRET = "a-long-staging-only-secret";
const env: Env = {
  CLERK_ISSUER: "https://clerk.example.test",
  POCKETBASE_URL: "https://pb.example.test",
  POCKETBASE_ADMIN_EMAIL: "a@b.c",
  POCKETBASE_ADMIN_PASSWORD: "pw",
  STAGING_PLAYTEST_AUTH_ENABLED: "true",
  STAGING_PLAYTEST_AUTH_SECRET: SECRET,
  CLERK_SECRET_KEY: "sk_test_x",
};

type Row = { id: string; owner: string };
let users: Map<string, { id: string; private_metadata: unknown }>;
let rows: Map<string, Row[]>;
let requests: string[];

// Minimal Clerk + PocketBase double keyed on URL.
const fakeFetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = new URL(String(input));
  const method = init?.method ?? "GET";
  requests.push(`${method} ${url.host}${url.pathname}`);
  const ok = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s });

  if (url.host === "api.clerk.com") {
    if (url.pathname === "/v1/users" && method === "POST") {
      const user = { id: "user_new1", private_metadata: JSON.parse(String(init?.body)).private_metadata };
      users.set(user.id, user);
      return ok(user);
    }
    if (url.pathname === "/v1/sign_in_tokens") return ok({ token: "ticket_123" });
    const id = url.pathname.split("/").pop()!;
    if (method === "DELETE") return users.delete(id) ? ok({ deleted: true }) : ok({}, 404);
    return users.has(id) ? ok(users.get(id)) : ok({}, 404);
  }
  if (url.pathname.endsWith("/auth-with-password")) return ok({ token: "pb_token" });
  const [, , , collection, , recordId] = url.pathname.split("/");
  if (method === "DELETE") {
    rows.set(collection, (rows.get(collection) ?? []).filter((r) => r.id !== recordId));
    return new Response(null, { status: 204 });
  }
  const owner = /="([^"]+)"/.exec(url.searchParams.get("filter") ?? "")?.[1];
  return ok({ items: (rows.get(collection) ?? []).filter((r) => r.owner === owner) });
});

function call(
  method: string,
  { host = "staging.starsailors.space", secret = SECRET as string | null, body, e = env }: { host?: string; secret?: string | null; body?: unknown; e?: Env } = {},
) {
  return handle(
    new Request("https://staging.starsailors.space/api/v1/test/playtest", {
      method,
      headers: { host, ...(secret ? { "x-staging-playtest-secret": secret } : {}) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    }),
    e,
    { fetchImpl: fakeFetch as unknown as typeof fetch },
  );
}

beforeEach(() => {
  users = new Map();
  rows = new Map();
  requests = [];
  resetPocketbaseToken();
  vi.spyOn(console, "info").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("staging playtest lifecycle (Worker)", () => {
  it.each([
    ["production host", { host: "starsailors.space" }],
    ["missing secret", { secret: null }],
    ["wrong secret", { secret: "wrong" }],
    ["disabled flag", { e: { ...env, STAGING_PLAYTEST_AUTH_ENABLED: "false" } }],
    ["unset flag (production default)", { e: { ...env, STAGING_PLAYTEST_AUTH_ENABLED: undefined } }],
    ["no configured secret", { e: { ...env, STAGING_PLAYTEST_AUTH_SECRET: undefined } }],
  ])("returns 404 for %s without calling Clerk or PocketBase", async (_n, opts) => {
    users.set("user_victim", { id: "user_victim", private_metadata: {} });
    for (const method of ["POST", "DELETE", "GET"]) {
      const res = await call(method, { ...opts, body: method === "DELETE" ? { userId: "user_victim" } : undefined });
      expect(res.status).toBe(404);
    }
    expect(requests).toEqual([]);
    expect(users.has("user_victim")).toBe(true);
  });

  it("provisions a marked user and returns a short-lived ticket", async () => {
    const res = await call("POST");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ userId: "user_new1", ticket: "ticket_123" });
    expect(users.get("user_new1")?.private_metadata).toMatchObject({ starSailorsPlaytest: { marker: PLAYTEST_MARKER } });
  });

  it("cleans up only the owned user's records and verifies deletion", async () => {
    await call("POST");
    rows.set("profiles", [{ id: "p1", owner: "user_new1" }, { id: "p2", owner: "user_other" }]);
    rows.set("ss_hub_state", [{ id: "h1", owner: "user_new1" }]);
    const res = await call("DELETE", { body: { userId: "user_new1" } });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ deleted: true, deletedRecords: 2 });
    expect(users.has("user_new1")).toBe(false);
    expect(rows.get("profiles")).toEqual([{ id: "p2", owner: "user_other" }]);
    expect(requests.length).toBeLessThanOrEqual(45);
  });

  it("refuses to delete a real (unmarked) user or a malformed id", async () => {
    users.set("user_real1", { id: "user_real1", private_metadata: {} });
    expect((await call("DELETE", { body: { userId: "user_real1" } })).status).toBe(404);
    expect((await call("DELETE", { body: { userId: 'x"||1=1' } })).status).toBe(404);
    expect(users.has("user_real1")).toBe(true);
  });

  it("pauses before the subrequest budget and keeps the user so a retry can resume", async () => {
    await call("POST");
    rows.set("profiles", Array.from({ length: 60 }, (_, i) => ({ id: `p${i}`, owner: "user_new1" })));
    const res = await call("DELETE", { body: { userId: "user_new1" } });
    expect(res.status).toBe(503);
    expect(users.has("user_new1")).toBe(true);
    expect(requests.length).toBeLessThanOrEqual(45);
  });
});
