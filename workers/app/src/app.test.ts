import { execFileSync } from "node:child_process";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

// Stand-in for the platform fetch, installed before the Worker module wraps it.
const upstream = vi.hoisted(() => {
  const fn = vi.fn(async () => new Response("ok"));
  globalThis.fetch = fn as unknown as typeof fetch;
  return fn;
});

// The Worker bundle swaps these modules via wrangler.jsonc `alias`; mirror that here.
vi.mock("@clerk/nextjs/server", () => import("./shims/clerk-nextjs-server"));
vi.mock("next/cache", () => import("./shims/next-cache"));

import { resetJwksCache } from "../../api/src/jwt";
import { requestContext } from "./context";
import { handle, issuerFromPublishableKey, resolveAuth, type Env } from "./index";
import { auth } from "./shims/clerk-nextjs-server";

const ISS = "https://clerk.example.test";
const ORIGIN = "https://starsailors.space";
const NOW = 1_800_000_000;

const b64u = (data: ArrayBuffer | string) => {
  const bytes = typeof data === "string" ? new TextEncoder().encode(data) : new Uint8Array(data);
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

let priv: CryptoKey;
let jwk: JsonWebKey;

async function sign(claims: Record<string, unknown>) {
  const head = b64u(JSON.stringify({ alg: "RS256", kid: "k1", typ: "JWT" }));
  const body = b64u(JSON.stringify(claims));
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", priv, new TextEncoder().encode(`${head}.${body}`));
  return `${head}.${body}.${b64u(sig)}`;
}

const claims = (sub: string) => ({ sub, sid: `sess_${sub}`, iss: ISS, exp: NOW + 60, nbf: NOW - 10, azp: ORIGIN });

let assetRequests: string[];
let fetchMock: ReturnType<typeof vi.fn>;

const env: Env = {
  ASSETS: {
    fetch: async (request: Request) => {
      const { pathname } = new URL(request.url);
      assetRequests.push(pathname);
      return new Response(`asset:${pathname}`, { headers: { "content-type": "text/html" } });
    },
  },
  CLERK_ISSUER: ISS,
  CLERK_AUTHORIZED_PARTIES: ORIGIN,
  POCKETBASE_URL: "https://pb.example.test",
  POCKETBASE_ADMIN_EMAIL: "a@b.c",
  POCKETBASE_ADMIN_PASSWORD: "secret",
};

const call = (path: string, init: RequestInit = {}) =>
  handle(new Request(`${ORIGIN}${path}`, init), env, { fetchImpl: fetchMock as unknown as typeof fetch, now: NOW });

beforeAll(async () => {
  const pair = await crypto.subtle.generateKey(
    { name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
    true,
    ["sign", "verify"],
  );
  priv = pair.privateKey;
  jwk = { ...(await crypto.subtle.exportKey("jwk", pair.publicKey)), kid: "k1" } as JsonWebKey;
});

beforeEach(() => {
  resetJwksCache();
  assetRequests = [];
  fetchMock = vi.fn(async () => new Response(JSON.stringify({ keys: [jwk] })));
});

describe("issuerFromPublishableKey", () => {
  it("decodes the Clerk frontend API host", () => {
    expect(issuerFromPublishableKey(`pk_live_${btoa("clerk.starsailors.space$")}`)).toBe("https://clerk.starsailors.space");
    expect(issuerFromPublishableKey("pk_test_!!!")).toBeNull();
    expect(issuerFromPublishableKey(undefined)).toBeNull();
  });
});

describe("API route handlers", () => {
  it("rejects a request without a session", async () => {
    const res = await call("/api/auth/session");
    expect(res.status).toBe(401);
    expect(res.headers.get("cache-control")).toBe("private, no-store");
  });

  it("accepts a Clerk bearer token", async () => {
    const res = await call("/api/auth/session", { headers: { authorization: `Bearer ${await sign(claims("user_1"))}` } });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ authenticated: true });
  });

  it("accepts the __session cookie clerk-js keeps", async () => {
    const res = await call("/api/auth/session", { headers: { cookie: `a=1; __session=${await sign(claims("user_1"))}` } });
    expect(res.status).toBe(200);
  });

  it("verifies JWKS once per isolate, not per request", async () => {
    const token = await sign(claims("user_1"));
    await call("/api/auth/session", { headers: { authorization: `Bearer ${token}` } });
    await call("/api/auth/session", { headers: { authorization: `Bearer ${token}` } });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("treats forged and expired tokens as signed out", async () => {
    const forged = (await sign(claims("user_1"))).replace(/\.[^.]+$/, ".AAAA");
    expect((await call("/api/auth/session", { headers: { authorization: `Bearer ${forged}` } })).status).toBe(401);
    const expired = await sign({ ...claims("user_1"), exp: NOW - 600 });
    expect((await call("/api/auth/session", { headers: { authorization: `Bearer ${expired}` } })).status).toBe(401);
  });

  it("matches dynamic segments and reports unknown routes and methods", async () => {
    expect((await call("/api/actions/notAnAction", { method: "POST", body: "{}" })).status).toBe(404);
    expect((await call("/api/nope")).status).toBe(404);
    const res = await call("/api/auth/session", { method: "DELETE" });
    expect(res.status).toBe(405);
    expect(res.headers.get("allow")).toBe("GET");
  });

  it("serves the SSC-35 JSON API under /api/v1", async () => {
    expect((await call("/api/v1/me")).status).toBe(401);
  });
});

describe("resolveAuth", () => {
  const url = new URL(`${ORIGIN}/api/actions/x`);

  it("ignores a cookie session on a cross-site mutation", async () => {
    const cookie = `__session=${await sign(claims("user_1"))}`;
    const noOrigin = await resolveAuth(new Request(url, { method: "POST", headers: { cookie } }), env, url, { now: NOW, fetchImpl: fetchMock as any });
    expect(noOrigin).toMatchObject({ userId: null, authError: "cross_origin" });
    const foreign = await resolveAuth(new Request(url, { method: "POST", headers: { cookie, origin: "https://evil.test" } }), env, url, { now: NOW, fetchImpl: fetchMock as any });
    expect(foreign.userId).toBeNull();
    const own = await resolveAuth(new Request(url, { method: "POST", headers: { cookie, origin: ORIGIN } }), env, url, { now: NOW, fetchImpl: fetchMock as any });
    expect(own.userId).toBe("user_1");
  });

  it("accepts a bearer mutation without an Origin header", async () => {
    const authorization = `Bearer ${await sign(claims("user_1"))}`;
    const ctx = await resolveAuth(new Request(url, { method: "POST", headers: { authorization } }), env, url, { now: NOW, fetchImpl: fetchMock as any });
    expect(ctx.userId).toBe("user_1");
  });

  it("rejects a token minted for another origin", async () => {
    const authorization = `Bearer ${await sign({ ...claims("user_1"), azp: "https://evil.test" })}`;
    const ctx = await resolveAuth(new Request(url, { headers: { authorization } }), env, url, { now: NOW, fetchImpl: fetchMock as any });
    expect(ctx).toMatchObject({ userId: null, authError: "bad_party" });
  });
});

describe("auth() shim", () => {
  it("keeps concurrent requests' identities apart", async () => {
    const as = (userId: string, delay: number) =>
      requestContext.run({ userId, sessionId: null, claims: null, authError: null }, async () => {
        await new Promise((r) => setTimeout(r, delay));
        return (await auth()).userId;
      });
    expect(await Promise.all([as("user_a", 20), as("user_b", 0), as("user_c", 10)])).toEqual(["user_a", "user_b", "user_c"]);
  });

  it("throws outside a request, which routeAuth treats as signed out", async () => {
    await expect(auth()).rejects.toThrow("Auth context unavailable");
  });
});

describe("pages", () => {
  it("serves a dynamic page from its exported placeholder", async () => {
    const res = await call("/posts/123");
    expect(res.status).toBe(200);
    expect(assetRequests).toEqual(["/posts/__static__"]);
  });

  it("serves the placeholder RSC payload for client navigations", async () => {
    await call("/structures/balloon/clouds/an-5/one.txt?_rsc=1");
    expect(assetRequests).toEqual(["/structures/balloon/__static__/__static__/__static__.txt"]);
  });

  it("prefers literal segments over params", async () => {
    await call("/planets/edit/7");
    expect(assetRequests).toEqual(["/planets/edit/__static__"]);
  });

  it("returns the 404 page for anything else", async () => {
    const res = await call("/definitely/not/here");
    expect(res.status).toBe(404);
    expect(assetRequests).toEqual(["/404"]);
  });
});

describe("PostHog proxy", () => {
  it("forwards /ingest without the session cookie", async () => {
    fetchMock = vi.fn(async () => new Response("ok"));
    await call("/ingest/e/?ip=1", { method: "POST", body: "{}", headers: { cookie: "__session=secret", "content-type": "application/json" } });
    const [target, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(target).toBe("https://us.i.posthog.com/e/?ip=1");
    expect(new Headers(init.headers).get("cookie")).toBeNull();
  });

  it("sends static assets to the assets host", async () => {
    fetchMock = vi.fn(async () => new Response("ok"));
    await call("/ingest/static/array.js");
    expect(fetchMock.mock.calls[0][0]).toBe("https://us-assets.i.posthog.com/static/array.js");
  });
});

describe("budget instrumentation", () => {
  it("reports outbound fetches per request", async () => {
    upstream.mockClear();
    const proxied = await handle(new Request(`${ORIGIN}/ingest/decide`), env);
    expect(upstream).toHaveBeenCalledTimes(1);
    expect(proxied.headers.get("x-ssc-subrequests")).toBe("1");

    const page = await call("/posts/1");
    expect(page.headers.get("x-ssc-subrequests")).toBe("0");
  });
});

describe("generated route tables", () => {
  it("match src/app", () => {
    expect(() => execFileSync("node", ["scripts/cloudflare/generate-routes.mjs", "--check"], { stdio: "pipe" })).not.toThrow();
  });
});
