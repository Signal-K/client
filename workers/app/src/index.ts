// Star Sailors app Worker (SSC-31).
//
// Pages are a static Next.js export served by Workers Static Assets; an asset
// hit never invokes this Worker. It only runs for:
//   /api/v1/*   the SSC-35 JSON API (workers/api)
//   /api/*      the existing src/app/api route handlers, run directly with
//               Next/Clerk shims instead of the Next.js server
//   /ingest/*   the PostHog reverse proxy (formerly a next.config rewrite)
//   anything else with no matching asset: a dynamic page (served from its
//               exported placeholder HTML) or the 404 page
// None of these render React, so every request fits the Workers Free CPU budget.
import { AsyncLocalStorage } from "node:async_hooks";

import { handle as handleApiV1 } from "../../api/src/index";
import { AuthError, verifyClerkJwt, type ClerkClaims } from "../../api/src/jwt";
import { requestContext, type RequestContext } from "./context";
import { apiRoutes } from "./generated/api-routes";
import { dynamicPages } from "./generated/page-routes";
import { matchSegments, pathParts } from "./match";
import type { RouteModule } from "./routeTypes";
import { toNextRequest } from "./shims/next-server";

export type Env = {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
  CLERK_ISSUER?: string;
  CLERK_JWKS_URL?: string;
  CLERK_AUTHORIZED_PARTIES?: string;
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?: string;
  POCKETBASE_URL: string;
  POCKETBASE_ADMIN_EMAIL: string;
  POCKETBASE_ADMIN_PASSWORD: string;
  posthog_region?: string;
};

export type Deps = { fetchImpl?: typeof fetch; now?: number };

// SSC-38 budget evidence: every Worker response carries `x-ssc-subrequests`,
// the number of outbound fetches it made (Free plan cap: 50). CPU time comes
// from Workers Logs / `wrangler tail`; see scripts/cloudflare/measure-budget.mjs.
const metrics = new AsyncLocalStorage<{ subrequests: number }>();
const platformFetch = globalThis.fetch.bind(globalThis);
globalThis.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
  const store = metrics.getStore();
  if (store) store.subrequests++;
  return platformFetch(input, init);
}) as typeof fetch;

const json = (body: unknown, status: number, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "private, no-store", ...headers },
  });

/** Clerk publishable keys are `pk_(test|live)_` + base64("<frontend api host>$"). */
export function issuerFromPublishableKey(key: string | undefined): string | null {
  const encoded = key?.match(/^pk_(?:test|live)_(.+)$/)?.[1];
  if (!encoded) return null;
  try {
    const host = atob(encoded).replace(/\$$/, "");
    return /^[a-z0-9.-]+$/i.test(host) ? `https://${host}` : null;
  } catch {
    return null;
  }
}

function clerkIssuer(env: Env): string | null {
  return env.CLERK_ISSUER?.trim() || issuerFromPublishableKey(env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
}

function authorizedParties(env: Env, url: URL): string[] {
  const configured = env.CLERK_AUTHORIZED_PARTIES?.split(",").map((s) => s.trim()).filter(Boolean);
  return configured?.length ? configured : [url.origin];
}

function readCookie(header: string | null, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(";")) {
    const eq = part.indexOf("=");
    if (eq > 0 && part.slice(0, eq).trim() === name) return part.slice(eq + 1).trim();
  }
  return null;
}

/** The session JWT clerk-js keeps in `__session` (or its suffixed twin). */
function sessionCookie(header: string | null): string | null {
  const plain = readCookie(header, "__session");
  if (plain) return plain;
  const suffixed = header?.match(/(?:^|;\s*)__session_[A-Za-z0-9_-]+=([^;]+)/);
  return suffixed ? suffixed[1].trim() : null;
}

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export async function resolveAuth(request: Request, env: Env, url: URL, deps: Deps = {}): Promise<RequestContext> {
  const signedOut = (authError: string): RequestContext => ({ userId: null, sessionId: null, claims: null, authError });

  const authorization = request.headers.get("authorization");
  const bearer = authorization?.startsWith("Bearer ") ? authorization.slice(7).trim() : null;
  const token = bearer || sessionCookie(request.headers.get("cookie"));
  if (!token) return signedOut("missing_token");

  // Cookies ride along on cross-site form posts; bearer tokens do not. A
  // cookie-authenticated mutation must come from one of our own origins.
  const parties = authorizedParties(env, url);
  if (!bearer && !SAFE_METHODS.has(request.method)) {
    const origin = request.headers.get("origin");
    if (!origin || !parties.includes(origin)) return signedOut("cross_origin");
  }

  const issuer = clerkIssuer(env);
  if (!issuer) return signedOut("issuer_unconfigured");

  try {
    const claims: ClerkClaims = await verifyClerkJwt(token, {
      issuer,
      jwksUrl: env.CLERK_JWKS_URL,
      authorizedParties: parties,
      now: deps.now,
      fetchImpl: deps.fetchImpl,
    });
    return { userId: claims.sub, sessionId: claims.sid ?? null, claims: { ...claims }, authError: null };
  } catch (error) {
    if (error instanceof AuthError) return signedOut(error.code);
    throw error;
  }
}

async function handleRoute(request: Request, env: Env, url: URL, deps: Deps): Promise<Response> {
  const parts = pathParts(url.pathname);
  if (!parts) return json({ error: "Bad request path" }, 400);

  for (const route of apiRoutes) {
    const params = matchSegments(route.segments, parts);
    if (!params) continue;

    const module: RouteModule = route.module;
    const method = request.method.toUpperCase() as keyof RouteModule;
    const handler = module[method] ?? (method === "HEAD" ? module.GET : undefined);
    if (!handler) {
      const allow = Object.keys(module).filter((k) => /^[A-Z]+$/.test(k) && typeof module[k as keyof RouteModule] === "function");
      if (method === "OPTIONS") return new Response(null, { status: 204, headers: { allow: allow.join(", ") } });
      return json({ error: "Method not allowed" }, 405, { allow: allow.join(", ") });
    }

    const context = await resolveAuth(request, env, url, deps);
    const response = await requestContext.run(context, () =>
      handler(toNextRequest(request), { params: Promise.resolve(params) }),
    );
    if (!response.headers.has("cache-control")) {
      const copy = new Response(method === "HEAD" ? null : response.body, response);
      copy.headers.set("cache-control", "private, no-store");
      return copy;
    }
    return method === "HEAD" ? new Response(null, response) : response;
  }

  return json({ error: "Not found" }, 404);
}

function posthogHosts(env: Env) {
  const eu = (env.posthog_region || "US Cloud").toLowerCase().includes("eu");
  return eu
    ? { ingest: "https://eu.i.posthog.com", assets: "https://eu-assets.i.posthog.com" }
    : { ingest: "https://us.i.posthog.com", assets: "https://us-assets.i.posthog.com" };
}

async function proxyPosthog(request: Request, env: Env, url: URL, fetchImpl: typeof fetch): Promise<Response> {
  const hosts = posthogHosts(env);
  const rest = url.pathname.slice("/ingest".length) || "/";
  const target = rest.startsWith("/static/") ? `${hosts.assets}${rest}` : `${hosts.ingest}${rest}`;
  const headers = new Headers(request.headers);
  // PostHog never needs our session cookie or Clerk bearer token.
  headers.delete("cookie");
  headers.delete("authorization");
  headers.delete("host");
  return fetchImpl(target + url.search, {
    method: request.method,
    headers,
    body: SAFE_METHODS.has(request.method) ? undefined : request.body,
    redirect: "manual",
  });
}

async function servePage(request: Request, env: Env, url: URL): Promise<Response> {
  // Client-side navigations fetch the page's RSC payload as `<path>.txt`.
  const rsc = url.pathname.endsWith(".txt");
  const parts = pathParts(rsc ? url.pathname.slice(0, -4) : url.pathname);

  if (parts && (request.method === "GET" || request.method === "HEAD")) {
    for (const page of dynamicPages) {
      if (!matchSegments(page.segments, parts)) continue;
      const assetUrl = new URL(page.asset + (rsc ? ".txt" : ""), url);
      assetUrl.search = url.search;
      return env.ASSETS.fetch(new Request(assetUrl, request));
    }
  }

  const notFound = await env.ASSETS.fetch(new Request(new URL("/404", url), { headers: request.headers }));
  return new Response(notFound.body, { status: 404, headers: notFound.headers });
}

export async function handle(request: Request, env: Env, deps: Deps = {}): Promise<Response> {
  const counter = { subrequests: 0 };
  const response = await metrics.run(counter, () => route(request, env, deps));
  const measured = new Response(response.body, response);
  measured.headers.set("x-ssc-subrequests", String(counter.subrequests));
  return measured;
}

async function route(request: Request, env: Env, deps: Deps): Promise<Response> {
  const url = new URL(request.url);
  const { pathname } = url;

  try {
    if (pathname === "/ingest" || pathname.startsWith("/ingest/")) {
      return await proxyPosthog(request, env, url, deps.fetchImpl ?? fetch);
    }
    if (pathname.startsWith("/api/v1/")) {
      const issuer = clerkIssuer(env);
      if (!issuer) return json({ error: "issuer_unconfigured" }, 503);
      return await handleApiV1(request, { ...env, CLERK_ISSUER: issuer, CLERK_AUTHORIZED_PARTIES: authorizedParties(env, url).join(",") }, deps);
    }
    if (pathname === "/api" || pathname.startsWith("/api/")) {
      return await handleRoute(request, env, url, deps);
    }
    return await servePage(request, env, url);
  } catch (error) {
    console.error(`[app-worker] ${request.method} ${pathname} failed`, error);
    return json({ error: "Internal server error" }, 500);
  }
}

export default {
  fetch: (request: Request, env: Env) => handle(request, env),
};
