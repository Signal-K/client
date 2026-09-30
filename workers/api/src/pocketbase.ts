// Minimal PocketBase REST access. Admin credentials live only in Worker
// secrets. The superuser token is cached in isolate memory (plain data, safe
// under Workers I/O rules) so a warm isolate costs one subrequest per read.

export type PocketbaseEnv = {
  POCKETBASE_URL: string;
  POCKETBASE_ADMIN_EMAIL: string;
  POCKETBASE_ADMIN_PASSWORD: string;
};

const TOKEN_TTL_MS = 30 * 60 * 1000;
let cached: { token: string; at: number } | null = null;

export function resetPocketbaseToken() {
  cached = null;
}

async function adminToken(env: PocketbaseEnv, fetchImpl: typeof fetch, forceRefresh = false): Promise<string> {
  if (!forceRefresh && cached && Date.now() - cached.at < TOKEN_TTL_MS) return cached.token;
  const res = await fetchImpl(`${env.POCKETBASE_URL}/api/collections/_superusers/auth-with-password`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ identity: env.POCKETBASE_ADMIN_EMAIL, password: env.POCKETBASE_ADMIN_PASSWORD }),
  });
  if (!res.ok) throw new Error(`pocketbase_auth_${res.status}`);
  const { token } = (await res.json()) as { token: string };
  cached = { token, at: Date.now() };
  return token;
}

<<<<<<< HEAD
// One authenticated list read. Totals are opt-in (`withTotal`) because PocketBase
// pays a COUNT(*) for them; most callers only need items.
export async function readPage<T = Record<string, unknown>>(
  env: PocketbaseEnv,
  collection: string,
  params: { filter?: string; sort?: string; perPage?: number; fields?: string; withTotal?: boolean },
  fetchImpl: typeof fetch = fetch,
): Promise<{ items: T[]; totalItems: number }> {
  const query = new URLSearchParams({ perPage: String(params.perPage ?? 30), skipTotal: params.withTotal ? "0" : "1" });
  if (params.filter) query.set("filter", params.filter);
  if (params.sort) query.set("sort", params.sort);
  if (params.fields) query.set("fields", params.fields);
  const call = async (force: boolean) =>
    fetchImpl(`${env.POCKETBASE_URL}/api/collections/${collection}/records?${query}`, {
      headers: { authorization: await adminToken(env, fetchImpl, force) },
    });
  let res = await call(false);
  if (res.status === 401 || res.status === 403) res = await call(true);
  if (!res.ok) throw new Error(`pocketbase_read_${res.status}`);
  const body = (await res.json()) as { items: T[]; totalItems?: number };
  return { items: body.items, totalItems: body.totalItems ?? body.items.length };
}

// One authenticated create. Returns the status so callers can retry a unique-index clash.
export async function createRecord<T = Record<string, unknown>>(
  env: PocketbaseEnv,
  collection: string,
  data: Record<string, unknown>,
  fetchImpl: typeof fetch = fetch,
): Promise<{ ok: true; record: T } | { ok: false; status: number }> {
  const call = async (force: boolean) =>
    fetchImpl(`${env.POCKETBASE_URL}/api/collections/${collection}/records`, {
      method: "POST",
      headers: { authorization: await adminToken(env, fetchImpl, force), "content-type": "application/json" },
      body: JSON.stringify(data),
    });
  let res = await call(false);
  if (res.status === 401 || res.status === 403) res = await call(true);
  return res.ok ? { ok: true, record: (await res.json()) as T } : { ok: false, status: res.status };
}

export async function listRecords<T = Record<string, unknown>>(
  env: PocketbaseEnv,
  collection: string,
  params: { filter?: string; sort?: string; perPage?: number; fields?: string },
  fetchImpl: typeof fetch = fetch,
): Promise<T[]> {
  return (await readPage<T>(env, collection, params, fetchImpl)).items;
=======
/** Authenticated PocketBase call with one token refresh on 401/403. */
export async function adminFetch(
  env: PocketbaseEnv,
  path: string,
  init: RequestInit = {},
  fetchImpl: typeof fetch = fetch,
): Promise<Response> {
  const call = async (force: boolean) =>
    fetchImpl(`${env.POCKETBASE_URL}${path}`, {
      ...init,
      headers: { ...init.headers, authorization: await adminToken(env, fetchImpl, force) },
    });
  const res = await call(false);
  return res.status === 401 || res.status === 403 ? call(true) : res;
>>>>>>> 46f809fe (🪶🔐 ↝ [SSC-33]: Move the staging playtest lifecycle into the Free-plan API Worker)
}

export type Profile = { userId: string; fullName: string | null; avatarUrl: string | null };

export async function getProfileByUserId(
  env: PocketbaseEnv,
  userId: string,
  fetchImpl: typeof fetch = fetch,
): Promise<Profile | null> {
  const items = await listRecords<Record<string, string | null>>(
    env,
    "profiles",
    { filter: `userId="${userId.replace(/["\\]/g, "")}"`, perPage: 1, fields: "userId,fullName,avatarUrl" },
    fetchImpl,
  );
  const row = items[0];
  return row ? { userId: row.userId as string, fullName: row.fullName ?? null, avatarUrl: row.avatarUrl ?? null } : null;
}
