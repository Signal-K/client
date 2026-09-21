import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { handle, type Env } from "./index";
import { resetJwksCache } from "./jwt";

const ISS = "https://clerk.example.test";
const NOW = 1_800_000_000;
const env: Env = {
  CLERK_ISSUER: ISS,
  CLERK_AUTHORIZED_PARTIES: "https://starsailors.space",
  POCKETBASE_URL: "https://pb.example.test",
  POCKETBASE_ADMIN_EMAIL: "a@b.c",
  POCKETBASE_ADMIN_PASSWORD: "secret",
};

const b64u = (data: ArrayBuffer | string) => {
  const bytes = typeof data === "string" ? new TextEncoder().encode(data) : new Uint8Array(data);
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

type Pair = { kid: string; priv: CryptoKey; jwk: JsonWebKey };
async function makeKey(kid: string): Promise<Pair> {
  const pair = await crypto.subtle.generateKey(
    { name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
    true,
    ["sign", "verify"],
  );
  return { kid, priv: pair.privateKey, jwk: { ...(await crypto.subtle.exportKey("jwk", pair.publicKey)), kid } as JsonWebKey };
}

async function sign(pair: Pair, claims: Record<string, unknown>) {
  const head = b64u(JSON.stringify({ alg: "RS256", kid: pair.kid, typ: "JWT" }));
  const body = b64u(JSON.stringify(claims));
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", pair.priv, new TextEncoder().encode(`${head}.${body}`));
  return `${head}.${body}.${b64u(sig)}`;
}

const good = { sub: "user_1", iss: ISS, exp: NOW + 60, nbf: NOW - 10, azp: "https://starsailors.space" };

let key: Pair;
let other: Pair;
let fetchMock: ReturnType<typeof vi.fn>;
const getProfile = vi.fn(async (_e: Env, userId: string) => ({ userId, fullName: "Ada", avatarUrl: null }));

const call = (path: string, token?: string) =>
  handle(
    new Request(`https://starsailors.space${path}`, { headers: token ? { authorization: `Bearer ${token}` } : {} }),
    env,
    { fetchImpl: fetchMock as unknown as typeof fetch, now: NOW, getProfile },
  );

beforeAll(async () => {
  key = await makeKey("k1");
  other = await makeKey("k-attacker");
});

beforeEach(() => {
  resetJwksCache();
  getProfile.mockClear();
  fetchMock = vi.fn(async () => new Response(JSON.stringify({ keys: [key.jwk] })));
});

describe("worker API auth boundary", () => {
  it("returns the caller's profile for a valid token", async () => {
    const res = await call("/api/v1/me", await sign(key, good));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ userId: "user_1", profile: { userId: "user_1", fullName: "Ada", avatarUrl: null } });
  });

  it("rejects a missing token", async () => {
    expect((await call("/api/v1/me")).status).toBe(401);
    expect(getProfile).not.toHaveBeenCalled();
  });

  it.each(["garbage", "a.b", "a.b.c", "....", "e30.e30.e30"])("rejects malformed token %s", async (t) => {
    expect((await call("/api/v1/me", t)).status).toBe(401);
  });

  it("rejects an expired token", async () => {
    const res = await call("/api/v1/me", await sign(key, { ...good, exp: NOW - 60 }));
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "expired" });
  });

  it("rejects a token signed by an unknown key and a tampered payload", async () => {
    expect((await call("/api/v1/me", await sign({ ...other, kid: "k1" }, good))).status).toBe(401);
    const [h, , s] = (await sign(key, good)).split(".");
    const forged = `${h}.${b64u(JSON.stringify({ ...good, sub: "user_2" }))}.${s}`;
    expect((await call("/api/v1/me", forged)).status).toBe(401);
  });

  it("rejects wrong issuer and unauthorized party", async () => {
    expect((await call("/api/v1/me", await sign(key, { ...good, iss: "https://evil.test" }))).status).toBe(401);
    expect((await call("/api/v1/me", await sign(key, { ...good, azp: "https://evil.test" }))).status).toBe(403);
  });

  it("rejects cross-user access", async () => {
    const token = await sign(key, good);
    expect((await call("/api/v1/users/user_2/profile", token)).status).toBe(403);
    expect((await call("/api/v1/users/user_1/profile", token)).status).toBe(200);
    expect(getProfile).toHaveBeenCalledTimes(1);
    expect(getProfile).toHaveBeenCalledWith(env, "user_1");
  });

  it("rejects unknown routes and non-GET methods", async () => {
    expect((await call("/api/v1/nope", await sign(key, good))).status).toBe(404);
    const res = await handle(new Request("https://starsailors.space/api/v1/me", { method: "POST" }), env);
    expect(res.status).toBe(405);
  });
});

describe("Workers Free subrequest budget", () => {
  it("fetches JWKS once across many authenticated requests", async () => {
    const token = await sign(key, good);
    for (let i = 0; i < 25; i++) expect((await call("/api/v1/me", token)).status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("does not refetch JWKS per request for forged key ids (cooldown)", async () => {
    await call("/api/v1/me", await sign(key, good)); // warm cache
    const forged = await sign({ ...key, kid: "nope" }, good);
    for (let i = 0; i < 10; i++) expect((await call("/api/v1/me", forged)).status).toBe(401);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("surfaces JWKS outage as 503, not a crash", async () => {
    fetchMock = vi.fn(async () => new Response("", { status: 500 }));
    expect((await call("/api/v1/me", await sign(key, good))).status).toBe(503);
  });
});
