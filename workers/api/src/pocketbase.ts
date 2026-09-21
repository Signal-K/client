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

export type Profile = { userId: string; fullName: string | null; avatarUrl: string | null };

export async function getProfileByUserId(
  env: PocketbaseEnv,
  userId: string,
  fetchImpl: typeof fetch = fetch,
): Promise<Profile | null> {
  const query = new URLSearchParams({
    filter: `userId="${userId.replace(/["\\]/g, "")}"`,
    perPage: "1",
    fields: "userId,fullName,avatarUrl",
    skipTotal: "1",
  });
  const call = async (force: boolean) =>
    fetchImpl(`${env.POCKETBASE_URL}/api/collections/profiles/records?${query}`, {
      headers: { authorization: await adminToken(env, fetchImpl, force) },
    });
  let res = await call(false);
  if (res.status === 401 || res.status === 403) res = await call(true);
  if (!res.ok) throw new Error(`pocketbase_read_${res.status}`);
  const { items } = (await res.json()) as { items: Array<Record<string, string | null>> };
  const row = items[0];
  return row ? { userId: row.userId as string, fullName: row.fullName ?? null, avatarUrl: row.avatarUrl ?? null } : null;
}
