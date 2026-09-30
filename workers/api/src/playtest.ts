// Staging-only playtest account lifecycle (SSC-33). Lives in the Free-plan
// Worker because staging no longer runs the Next server. Three independent
// conditions gate every request -- enabled flag, exact staging host, and an
// operator-held secret -- and any failure is an indistinguishable 404, so the
// route is absent on production even if a secret leaks into the wrong env.
import { adminFetch, type PocketbaseEnv } from "./pocketbase";

export const PLAYTEST_MARKER = "star-sailors-staging-playtest-v1";
// Workers Free allows 50 subrequests per invocation; stop short of it.
const SUBREQUEST_BUDGET = 45;
const CLERK_API = "https://api.clerk.com/v1";

export type PlaytestEnv = PocketbaseEnv & {
  STAGING_PLAYTEST_AUTH_ENABLED?: string;
  STAGING_PLAYTEST_AUTH_SECRET?: string;
  STAGING_PLAYTEST_HOST?: string;
  CLERK_SECRET_KEY?: string;
};

// Every selector is an identifier this client writes for the account. Explicit
// rather than cascading, because staging shares the production database.
export const ACCOUNT_RECORDS: ReadonlyArray<readonly [collection: string, field: string]> = [
  ["ss_comments", "author"],
  ["votes", "userId"],
  ["user_mineral_inventory", "userId"],
  ["survey_rewards", "userId"],
  ["researched", "userId"],
  ["missions", "userId"],
  ["defensive_probes", "userId"],
  ["nps_surveys", "userId"],
  ["uploads", "author"],
  ["zoo", "author"],
  ["zoo", "owner"],
  ["linked_anomalies", "author"],
  ["routes", "author"],
  ["inventory", "owner"],
  ["mineral_deposits", "owner"],
  ["ss_classifications", "author"],
  ["referrals", "referreeId"],
  ["ss_hub_state", "userId"],
  ["push_subscriptions", "profileId"],
  ["notification_rejections", "profileId"],
  ["profiles", "userId"],
];

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "private, no-store" },
  });

function notFound(reason: string) {
  // Audit-only reason; it never contains caller-supplied values.
  console.warn("[staging-playtest] rejected", { reason });
  return json({ error: "not_found" }, 404);
}

const host = (value: string | null) => (value || "").trim().toLowerCase().replace(/:\d+$/, "");

async function sameSecret(provided: string | null, expected: string | undefined): Promise<boolean> {
  if (!provided || !expected) return false;
  const digest = async (v: string) => new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(v)));
  const [a, b] = await Promise.all([digest(provided), digest(expected)]);
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export async function authorizesPlaytest(request: Request, env: PlaytestEnv): Promise<boolean> {
  return (
    env.STAGING_PLAYTEST_AUTH_ENABLED === "true" &&
    !!env.CLERK_SECRET_KEY &&
    host(request.headers.get("host") ?? new URL(request.url).host) === host(env.STAGING_PLAYTEST_HOST ?? "staging.starsailors.space") &&
    (await sameSecret(request.headers.get("x-staging-playtest-secret"), env.STAGING_PLAYTEST_AUTH_SECRET))
  );
}

export function isPlaytestMetadata(value: unknown): boolean {
  const marker = (value as { starSailorsPlaytest?: { marker?: unknown } } | null)?.starSailorsPlaytest;
  return !!marker && typeof marker === "object" && marker.marker === PLAYTEST_MARKER;
}

type ClerkUser = { id: string; private_metadata?: unknown };

export async function handlePlaytest(request: Request, env: PlaytestEnv, fetchImpl: typeof fetch = fetch): Promise<Response> {
  if (!(await authorizesPlaytest(request, env))) return notFound("guard");
  if (request.method !== "POST" && request.method !== "DELETE") return notFound("method");

  let calls = 0;
  const clerk = (path: string, init: RequestInit = {}) => {
    calls++;
    return fetchImpl(`${CLERK_API}${path}`, {
      ...init,
      headers: { authorization: `Bearer ${env.CLERK_SECRET_KEY}`, "content-type": "application/json" },
    });
  };

  if (request.method === "POST") {
    const id = crypto.randomUUID();
    const created = await clerk("/users", {
      method: "POST",
      body: JSON.stringify({
        // RFC 2606 .test addresses can never be delivered; the server mints the
        // sign-in ticket itself so no email verification is involved.
        email_address: [`ssc-playtest-${id}@example.test`],
        external_id: `ssc-playtest-${id}`,
        private_metadata: { starSailorsPlaytest: { marker: PLAYTEST_MARKER, createdAt: new Date().toISOString() } },
        skip_password_checks: true,
        skip_password_requirement: true,
      }),
    });
    if (!created.ok) {
      // Only reached with the correct secret; surface Clerk's error codes (no PII) so a 502 is diagnosable.
      const body = (await created.json().catch(() => null)) as { errors?: { code?: string; message?: string }[] } | null;
      const errors = (body?.errors ?? []).slice(0, 3).map((e) => ({ code: e.code, message: e.message }));
      return json({ error: "clerk_create_failed", clerkStatus: created.status, clerkErrors: errors }, 502);
    }
    const user = (await created.json()) as ClerkUser;
    const ticket = await clerk("/sign_in_tokens", {
      method: "POST",
      body: JSON.stringify({ user_id: user.id, expires_in_seconds: 60 }),
    });
    if (!ticket.ok) return json({ error: "clerk_ticket_failed" }, 502);
    console.info("[staging-playtest] provisioned", { userId: user.id });
    return json({ userId: user.id, ticket: ((await ticket.json()) as { token: string }).token });
  }

  const body = (await request.json().catch(() => null)) as { userId?: unknown } | null;
  if (!body || typeof body.userId !== "string" || !/^user_[A-Za-z0-9]+$/.test(body.userId)) return notFound("bad-body");

  const found = await clerk(`/users/${body.userId}`);
  if (!found.ok) return notFound("not-found");
  const user = (await found.json()) as ClerkUser;
  if (user.id !== body.userId || !isPlaytestMetadata(user.private_metadata)) return notFound("not-owned");

  const pb = (path: string, init?: RequestInit) => {
    calls++;
    return adminFetch(env, path, init, fetchImpl);
  };
  const listIds = async (collection: string, field: string) => {
    const query = new URLSearchParams({
      filter: `${field}="${user.id}"`,
      fields: "id",
      perPage: "200",
      skipTotal: "1",
    });
    const res = await pb(`/api/collections/${collection}/records?${query}`);
    if (!res.ok) throw new Error(`pocketbase_list_${collection}_${res.status}`);
    return ((await res.json()) as { items: Array<{ id: string }> }).items.map((r) => r.id);
  };

  let deleted = 0;
  try {
    for (const [collection, field] of ACCOUNT_RECORDS) {
      if (calls >= SUBREQUEST_BUDGET - 4) {
        // The Clerk user (the ownership proof) is kept so a retry resumes.
        console.warn("[staging-playtest] cleanup paused at subrequest budget", { userId: user.id, deleted });
        return json({ error: "retry", deletedRecords: deleted }, 503);
      }
      const ids = await listIds(collection, field);
      for (const recordId of ids) {
        if (calls >= SUBREQUEST_BUDGET - 4) return json({ error: "retry", deletedRecords: deleted }, 503);
        const res = await pb(`/api/collections/${collection}/records/${recordId}`, { method: "DELETE" });
        if (!res.ok && res.status !== 404) throw new Error(`pocketbase_delete_${collection}_${res.status}`);
        deleted++;
      }
      if (ids.length > 0 && (await listIds(collection, field)).length > 0) {
        console.error("[staging-playtest] cleanup incomplete", { userId: user.id, collection });
        return json({ error: "data_not_removed" }, 502);
      }
    }
  } catch (err) {
    console.error("[staging-playtest] cleanup failed", { userId: user.id, message: (err as Error).message });
    return json({ error: "upstream_unavailable" }, 502);
  }

  const removed = await clerk(`/users/${user.id}`, { method: "DELETE" });
  if (!removed.ok) return json({ error: "clerk_delete_failed" }, 502);
  if ((await clerk(`/users/${user.id}`)).ok) return json({ error: "user_not_removed" }, 502);

  console.info("[staging-playtest] cleaned", { userId: user.id, deletedRecords: deleted });
  return json({ deleted: true, deletedRecords: deleted });
}
