import PocketBase, { type RecordModel } from "pocketbase";

// Cloudflare Workers forbids reusing I/O objects (streams, request/response
// bodies, fetch state) across requests -- so we cannot cache the PocketBase
// *client* itself across calls, only the auth *token*, which is plain data.
// Each call gets its own client, seeded with the cached token via
// authStore.save() (no network request), falling back to a real
// authWithPassword() only when there's no valid cached token yet.
let cachedToken: string | null = null;
let cachedModel: RecordModel | null = null;
let authPromise: Promise<{ token: string; model: RecordModel }> | null = null;

function getConfig() {
  // Prefer the server-only value in production. Keep the public fallback for
  // local development and one-off migration scripts.
  const url = process.env.POCKETBASE_URL || process.env.NEXT_PUBLIC_POCKETBASE_URL;
  const email = process.env.POCKETBASE_ADMIN_EMAIL;
  const password = process.env.POCKETBASE_ADMIN_PASSWORD;

  if (!url || !email || !password) {
    throw new Error("Missing Pocketbase admin environment variables");
  }

  return { url, email, password };
}

async function authenticate(): Promise<{ token: string; model: RecordModel }> {
  const { url, email, password } = getConfig();
  const pb = new PocketBase(url);
  await pb.collection("_superusers").authWithPassword(email, password);
  cachedToken = pb.authStore.token;
  cachedModel = pb.authStore.record;
  return { token: cachedToken, model: cachedModel! };
}

/**
 * Server-side Pocketbase client authenticated as superuser for API routes that
 * need privileged collection access. Returns a fresh client per call (safe for
 * Cloudflare Workers' per-request I/O isolation) reusing a cached auth token
 * where possible to avoid re-authenticating on every request.
 */
export async function createPocketbaseAdminClient(): Promise<PocketBase> {
  const { url } = getConfig();
  const pb = new PocketBase(url);

  if (cachedToken && cachedModel) {
    pb.authStore.save(cachedToken, cachedModel);
    if (pb.authStore.isValid) {
      return pb;
    }
  }

  if (!authPromise) {
    authPromise = authenticate().finally(() => {
      authPromise = null;
    });
  }

  const { token, model } = await authPromise;
  pb.authStore.save(token, model);
  return pb;
}
