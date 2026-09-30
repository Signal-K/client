import { listRecords, type PocketbaseEnv } from "./pocketbase";

// Public, read-only anomaly catalogue: the Worker equivalent of
// GET /api/gameplay/anomalies in the Next app (same query params and row shape).
// One PocketBase read (plus a token fetch on a cold isolate) and cached at the edge.

const CACHE_CONTROL = "public, max-age=30, s-maxage=60, stale-while-revalidate=300";

const quote = (value: string) => `"${value.replace(/["\\]/g, "")}"`;
const int = (value: string) => {
  const n = Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : null;
};

export function toAnomalyRow(a: Record<string, any>) {
  return {
    id: a.legacyId,
    content: a.content,
    ticId: a.ticId,
    anomalytype: a.anomalytype,
    type: a.type,
    radius: a.radius,
    mass: a.mass,
    density: a.density,
    gravity: a.gravity,
    temperatureEq: a.temperatureEq,
    temperature: a.temperature,
    smaxis: a.smaxis,
    orbital_period: a.orbitalPeriod,
    classification_status: a.classificationStatus,
    avatar_url: a.avatarUrl,
    created_at: a.createdAt,
    deepnote: a.deepnote,
    lightkurve: a.lightkurve,
    configuration: a.configuration,
    parentAnomaly: a.parentAnomaly,
    anomalySet: a.anomalySet,
    anomalyConfiguration: a.anomalyConfiguration,
  };
}

export function buildAnomalyQuery(params: URLSearchParams): { filter: string; perPage: number } | { error: string } {
  const filters: string[] = [];
  const set = params.get("anomalySet");
  if (set) filters.push(`anomalySet=${quote(set)}`);
  for (const [param, field] of [["parentAnomaly", "parentAnomaly"], ["id", "legacyId"]] as const) {
    const raw = params.get(param);
    if (!raw) continue;
    const value = int(raw);
    if (value === null) return { error: `Invalid ${param}` };
    filters.push(`${field}=${value}`);
  }
  const ids = params.get("ids");
  if (ids) {
    const parsed = ids.split(",").map((x) => int(x.trim())).filter((x): x is number => x !== null);
    if (parsed.length > 0) filters.push(`(${parsed.map((v) => `legacyId=${v}`).join("||")})`);
  }
  const author = params.get("author");
  if (author) filters.push(`author=${quote(author)}`);
  const content = params.get("content");
  if (content) filters.push(`content=${quote(content)}`);
  const limit = Number(params.get("limit") || 500);
  return { filter: filters.join("&&"), perPage: Math.max(1, Math.min(Number.isFinite(limit) ? limit : 500, 2000)) };
}

export async function handleAnomalies(
  request: Request,
  env: PocketbaseEnv,
  deps: { fetchImpl?: typeof fetch; cache?: Pick<Cache, "match" | "put"> } = {},
): Promise<Response> {
  const respond = (body: unknown, status: number, cacheControl: string) =>
    new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": cacheControl } });

  const query = buildAnomalyQuery(new URL(request.url).searchParams);
  if ("error" in query) return respond({ error: query.error }, 400, "private, no-store");

  const cache = deps.cache ?? (typeof caches !== "undefined" ? (caches as unknown as { default: Cache }).default : undefined);
  const cacheKey = new Request(request.url, { method: "GET" });
  const hit = await cache?.match(cacheKey);
  if (hit) return hit;

  try {
    const items = await listRecords<Record<string, any>>(env, "anomalies", { ...query, sort: "-legacyId" }, deps.fetchImpl);
    const response = respond({ anomalies: items.map(toAnomalyRow) }, 200, CACHE_CONTROL);
    await cache?.put(cacheKey, response.clone());
    return response;
  } catch {
    return respond({ error: "upstream_unavailable" }, 502, "private, no-store");
  }
}
