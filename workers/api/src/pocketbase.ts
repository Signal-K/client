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

// One authenticated list read (skipTotal is always on: callers only need items).
export async function listRecords<T = Record<string, unknown>>(
  env: PocketbaseEnv,
  collection: string,
  params: { filter?: string; sort?: string; perPage?: number; fields?: string },
  fetchImpl: typeof fetch = fetch,
): Promise<T[]> {
  const query = new URLSearchParams({ perPage: String(params.perPage ?? 30), skipTotal: "1" });
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
  return ((await res.json()) as { items: T[] }).items;
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
