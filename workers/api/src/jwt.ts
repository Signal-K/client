// Local Clerk session-JWT verification for the Workers Free budget: one JWKS
// fetch is shared by every request in an isolate, so ordinary authenticated
// calls make zero subrequests and never touch clerkClient.

export type Jwk = JsonWebKey & { kid?: string };
type Jwks = { keys: Jwk[] };

export class AuthError extends Error {
  constructor(
    readonly code: "missing_token" | "malformed_token" | "invalid_signature" | "expired" | "not_yet_valid" | "bad_issuer" | "bad_party" | "jwks_unavailable",
  ) {
    super(code);
  }
}

export type VerifyOptions = {
  issuer: string;
  jwksUrl?: string;
  authorizedParties?: string[];
  now?: number; // seconds; injectable for tests
  fetchImpl?: typeof fetch;
  clockSkewSeconds?: number;
};

const JWKS_TTL_MS = 60 * 60 * 1000;
// A forged `kid` must not turn into one subrequest per request.
const JWKS_REFRESH_COOLDOWN_MS = 5 * 60 * 1000;

const jwksCache = new Map<string, { keys: Map<string, CryptoKey>; fetchedAt: number }>();
const inflight = new Map<string, Promise<void>>();

export function resetJwksCache() {
  jwksCache.clear();
  inflight.clear();
}

function b64urlToBytes(input: string): Uint8Array<ArrayBuffer> {
  const pad = "=".repeat((4 - (input.length % 4)) % 4);
  const bin = atob(input.replace(/-/g, "+").replace(/_/g, "/") + pad);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

function decodeJson<T>(part: string): T {
  try {
    return JSON.parse(new TextDecoder().decode(b64urlToBytes(part))) as T;
  } catch {
    throw new AuthError("malformed_token");
  }
}

async function refreshJwks(url: string, fetchImpl: typeof fetch, nowMs: number) {
  const existing = inflight.get(url);
  if (existing) return existing;
  const job = (async () => {
    let jwks: Jwks;
    try {
      const res = await fetchImpl(url, { cf: { cacheTtl: 3600, cacheEverything: true } } as RequestInit);
      if (!res.ok) throw new Error(String(res.status));
      jwks = (await res.json()) as Jwks;
    } catch {
      throw new AuthError("jwks_unavailable");
    }
    const keys = new Map<string, CryptoKey>();
    for (const jwk of jwks.keys ?? []) {
      if (!jwk.kid || jwk.kty !== "RSA") continue;
      keys.set(
        jwk.kid,
        await crypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]),
      );
    }
    jwksCache.set(url, { keys, fetchedAt: nowMs });
  })().finally(() => inflight.delete(url));
  inflight.set(url, job);
  return job;
}

async function getKey(kid: string, url: string, fetchImpl: typeof fetch, nowMs: number): Promise<CryptoKey | undefined> {
  const cached = jwksCache.get(url);
  const fresh = cached && nowMs - cached.fetchedAt < JWKS_TTL_MS;
  if (fresh && cached.keys.has(kid)) return cached.keys.get(kid);
  const mayRefresh = !cached || !fresh || nowMs - cached.fetchedAt > JWKS_REFRESH_COOLDOWN_MS;
  if (mayRefresh) await refreshJwks(url, fetchImpl, nowMs);
  return jwksCache.get(url)?.keys.get(kid);
}

export type ClerkClaims = { sub: string; iss: string; exp: number; nbf?: number; iat?: number; azp?: string; sid?: string };

export async function verifyClerkJwt(token: string | null | undefined, opts: VerifyOptions): Promise<ClerkClaims> {
  if (!token) throw new AuthError("missing_token");
  const parts = token.split(".");
  if (parts.length !== 3 || parts.some((p) => !p)) throw new AuthError("malformed_token");

  const header = decodeJson<{ alg?: string; kid?: string }>(parts[0]);
  if (header.alg !== "RS256" || !header.kid) throw new AuthError("malformed_token");
  const claims = decodeJson<ClerkClaims>(parts[1]);
  if (typeof claims.sub !== "string" || typeof claims.exp !== "number") throw new AuthError("malformed_token");

  const nowSec = opts.now ?? Math.floor(Date.now() / 1000);
  const url = opts.jwksUrl ?? `${opts.issuer}/.well-known/jwks.json`;
  const key = await getKey(header.kid, url, opts.fetchImpl ?? fetch, nowSec * 1000);
  if (!key) throw new AuthError("invalid_signature");

  const ok = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    key,
    b64urlToBytes(parts[2]),
    new TextEncoder().encode(`${parts[0]}.${parts[1]}`),
  );
  if (!ok) throw new AuthError("invalid_signature");

  const skew = opts.clockSkewSeconds ?? 5;
  if (claims.exp + skew < nowSec) throw new AuthError("expired");
  if (claims.nbf !== undefined && claims.nbf - skew > nowSec) throw new AuthError("not_yet_valid");
  if (claims.iss !== opts.issuer) throw new AuthError("bad_issuer");
  if (opts.authorizedParties?.length && (!claims.azp || !opts.authorizedParties.includes(claims.azp))) {
    throw new AuthError("bad_party");
  }
  return claims;
}
