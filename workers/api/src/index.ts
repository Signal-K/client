// SSC-35 JSON API (/api/v1/*). Since SSC-31 it runs inside the app Worker
// (workers/app/src/index.ts) on the site's own origin, which supplies
// CLERK_ISSUER and CLERK_AUTHORIZED_PARTIES; it is no longer deployed alone.
import { AuthError, verifyClerkJwt, type ClerkClaims } from "./jwt";
import { handleAnomalies } from "./anomalies";
import { createClassification, listClassifications } from "./classifications";
import { handlePlaytest, type PlaytestEnv } from "./playtest";
import { buildResearchSummary, emptySummary } from "./research";
import { getProfileByUserId, type PocketbaseEnv, type Profile } from "./pocketbase";

export type Env = PocketbaseEnv & PlaytestEnv & {
  CLERK_ISSUER: string;
  CLERK_JWKS_URL?: string;
  CLERK_AUTHORIZED_PARTIES?: string; // comma-separated origins
};

export type Deps = {
  fetchImpl?: typeof fetch;
  now?: number;
  getProfile?: (env: Env, userId: string) => Promise<Profile | null>;
};

const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "private, no-store", ...headers },
  });

const AUTH_STATUS: Record<AuthError["code"], number> = {
  missing_token: 401,
  malformed_token: 401,
  invalid_signature: 401,
  expired: 401,
  not_yet_valid: 401,
  bad_issuer: 401,
  bad_party: 403,
  jwks_unavailable: 503,
};

function bearer(request: Request): string | null {
  const header = request.headers.get("authorization");
  return header?.startsWith("Bearer ") ? header.slice(7).trim() : null;
}

export async function handle(request: Request, env: Env, deps: Deps = {}): Promise<Response> {
  const url = new URL(request.url);
  if (url.pathname === "/api/v1/test/playtest") return handlePlaytest(request, env, deps.fetchImpl);
  const classificationsRoute = url.pathname === "/api/v1/classifications";
  if (request.method !== "GET" && !(classificationsRoute && request.method === "POST")) {
    return json({ error: "method_not_allowed" }, 405, { allow: classificationsRoute ? "GET, POST" : "GET" });
  }

  if (url.pathname === "/api/v1/anomalies") return handleAnomalies(request, env, { fetchImpl: deps.fetchImpl });

  const summaryRoute = url.pathname === "/api/v1/research/summary";
  const route = summaryRoute || classificationsRoute ? null : url.pathname.match(/^\/api\/v1\/(me|users\/([^/]+)\/profile)$/);
  if (!route && !summaryRoute && !classificationsRoute) return json({ error: "not_found" }, 404);
  // Signed-out callers get the same empty summary the Next route returns.
  if (summaryRoute && !bearer(request)) return json(emptySummary());

  let claims: ClerkClaims;
  try {
    claims = await verifyClerkJwt(bearer(request), {
      issuer: env.CLERK_ISSUER,
      jwksUrl: env.CLERK_JWKS_URL,
      authorizedParties: env.CLERK_AUTHORIZED_PARTIES?.split(",").map((s) => s.trim()).filter(Boolean),
      now: deps.now,
      fetchImpl: deps.fetchImpl,
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return json({ error: err.code }, AUTH_STATUS[err.code], err.code === "jwks_unavailable" ? {} : { "www-authenticate": "Bearer" });
    }
    throw err;
  }

  if (classificationsRoute) {
    const ctx = { env, userId: claims.sub, fetchImpl: deps.fetchImpl };
    return request.method === "POST" ? createClassification(request, ctx) : listClassifications(request, ctx);
  }

  if (summaryRoute) {
    try {
      return json(await buildResearchSummary(env, claims.sub, deps.fetchImpl));
    } catch {
      return json({ error: "upstream_unavailable" }, 502);
    }
  }

  // Paths naming another user are rejected outright; identity only ever comes from the verified `sub`.
  const requestedUser = route![2] ? decodeURIComponent(route![2]) : claims.sub;
  if (requestedUser !== claims.sub) return json({ error: "forbidden" }, 403);

  try {
    const profile = await (deps.getProfile ?? ((e, id) => getProfileByUserId(e, id, deps.fetchImpl)))(env, claims.sub);
    return json({ userId: claims.sub, profile });
  } catch {
    return json({ error: "upstream_unavailable" }, 502);
  }
}

export default {
  fetch: (request: Request, env: Env) => handle(request, env),
};
