import { createRecord, listRecords, type PocketbaseEnv } from "./pocketbase";
import { toAnomalyRow } from "./anomalies";

// /api/v1/classifications: Worker version of the Next route (same params and row
// shape). Light by design: a read is one PocketBase request (two only with
// includeAnomaly) with no COUNT, and a write is one request: no "max id + 1"
// read, no page revalidation, no analytics round trip.

const MAX_LIMIT = 1000; // the largest page any screen asks for
const MAX_BODY_BYTES = 64 * 1024;
const quote = (value: string) => `"${value.replace(/["\\]/g, "")}"`;
const num = (value: string) => {
  const n = Number(value.trim());
  return value.trim() !== "" && Number.isFinite(n) ? n : null;
};
const nums = (list: string) => list.split(",").map(num).filter((n): n is number => n !== null);

export function toClassificationRow(c: Record<string, any>) {
  return {
    id: c.legacyId,
    created_at: c.createdAt,
    content: c.content,
    author: c.author,
    anomaly: c.anomaly,
    media: c.media,
    classificationtype: c.classificationtype,
    classificationConfiguration: c.classificationConfiguration,
  };
}

// Unique and increasing with time, so no read is needed to pick the next id.
// (The old "max + 1" scheme cost a read per write and could collide.)
export const newLegacyId = (now = Date.now(), random = Math.random()) => now * 1000 + Math.floor(random * 1000);

export function buildClassificationQuery(params: URLSearchParams) {
  const filters: string[] = [];
  const id = params.get("id");
  if (id) {
    const value = num(id);
    if (value === null) return { error: "Invalid id" };
    filters.push(`legacyId=${value}`);
  }
  const ids = params.get("ids");
  if (ids && nums(ids).length) filters.push(`(${nums(ids).map((v) => `legacyId=${v}`).join("||")})`);
  const author = params.get("author");
  if (author) filters.push(`author=${quote(author)}`);
  const type = params.get("classificationtype");
  if (type) filters.push(`classificationtype=${quote(type)}`);
  const anomaly = params.get("anomaly");
  if (anomaly) {
    const value = num(anomaly);
    if (value === null) return { error: "Invalid anomaly" };
    filters.push(`anomaly=${value}`);
  }
  const anomalies = params.get("anomalies");
  if (anomalies && nums(anomalies).length) filters.push(`(${nums(anomalies).map((v) => `anomaly=${v}`).join("||")})`);

  const limit = Number(params.get("limit") || 200);
  const sortField = params.get("orderBy") === "id" ? "legacyId" : "createdAt";
  return {
    filter: filters.join("&&"),
    sort: `${params.get("ascending") === "true" ? "+" : "-"}${sortField}`,
    perPage: Math.max(1, Math.min(Number.isFinite(limit) ? limit : 200, MAX_LIMIT)),
    includeAnomaly: params.get("includeAnomaly") === "true",
  };
}

type Ctx = { env: PocketbaseEnv; userId: string; fetchImpl?: typeof fetch };
const reply = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "private, no-store" } });

export async function listClassifications(request: Request, { env, userId, fetchImpl }: Ctx): Promise<Response> {
  const params = new URL(request.url).searchParams;
  // A player's own list is theirs alone; reading another author's list is refused.
  // Lookups by id or type (no author) stay open because those rows are shown publicly.
  const author = params.get("author");
  if (author && author !== userId) return reply({ error: "forbidden" }, 403);
  const query = buildClassificationQuery(params);
  if ("error" in query) return reply({ error: query.error }, 400);
  try {
    const items = await listRecords<Record<string, any>>(env, "ss_classifications", query, fetchImpl);
    const rows = items.map(toClassificationRow);
    if (!query.includeAnomaly) return reply({ classifications: rows });

    const anomalyIds = [...new Set(rows.map((r) => r.anomaly).filter((a): a is number => a != null))];
    const byId = new Map<number, ReturnType<typeof toAnomalyRow>>();
    if (anomalyIds.length) {
      const anomalies = await listRecords<Record<string, any>>(
        env,
        "anomalies",
        { filter: anomalyIds.map((v) => `legacyId=${v}`).join("||"), perPage: MAX_LIMIT },
        fetchImpl,
      );
      for (const a of anomalies) byId.set(a.legacyId, toAnomalyRow(a));
    }
    return reply({ classifications: rows.map((r) => ({ ...r, anomaly: byId.get(r.anomaly!) ?? null })) });
  } catch {
    return reply({ error: "upstream_unavailable" }, 502);
  }
}

export async function createClassification(request: Request, { env, userId, fetchImpl }: Ctx, deps: { now?: number; random?: () => number } = {}): Promise<Response> {
  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) return reply({ error: "Payload too large" }, 413);
  let body: Record<string, any>;
  try {
    body = JSON.parse(text);
  } catch {
    return reply({ error: "Invalid JSON body" }, 400);
  }
  const anomaly = body?.anomaly == null ? null : Number(body.anomaly);
  const classificationtype = typeof body?.classificationtype === "string" ? body.classificationtype.trim() : "";
  if (anomaly === null || !Number.isFinite(anomaly) || !classificationtype || classificationtype.length > 100) {
    return reply({ error: "Invalid payload: anomaly and classificationtype are required" }, 400);
  }

  const data = {
    createdAt: new Date(deps.now ?? Date.now()).toISOString(),
    author: userId, // always the verified subject, never taken from the body
    anomaly,
    classificationtype,
    content: typeof body.content === "string" ? body.content : "",
    media: body.media ?? null,
    classificationConfiguration: body.classificationConfiguration ?? null,
  };
  try {
    // The legacyId unique index rejects a same-millisecond clash; retry once with a fresh id.
    for (let attempt = 0; attempt < 2; attempt++) {
      const result = await createRecord<Record<string, any>>(
        env,
        "ss_classifications",
        { ...data, legacyId: newLegacyId(deps.now, (deps.random ?? Math.random)()) },
        fetchImpl,
      );
      if (result.ok) return reply(toClassificationRow(result.record));
      if (result.status !== 400) break;
    }
    return reply({ error: "Failed to create classification" }, 502);
  } catch {
    return reply({ error: "upstream_unavailable" }, 502);
  }
}
