import PocketBase from "pocketbase";

// Cached per Worker isolate so concurrent calls (e.g. the burst of gameplay
// fetches on game-page load) reuse one superuser session instead of each
// hitting PocketBase's auth endpoint independently, which was tripping
// PocketBase's collection/rate-limit middleware under load.
let cachedClient: PocketBase | null = null;
let authPromise: Promise<PocketBase> | null = null;

async function authenticate(): Promise<PocketBase> {
  // Prefer the server-only value in production. Keep the public fallback for
  // local development and one-off migration scripts.
  const url = process.env.POCKETBASE_URL || process.env.NEXT_PUBLIC_POCKETBASE_URL;
  const email = process.env.POCKETBASE_ADMIN_EMAIL;
  const password = process.env.POCKETBASE_ADMIN_PASSWORD;

  if (!url || !email || !password) {
    throw new Error("Missing Pocketbase admin environment variables");
  }

  const pb = new PocketBase(url);
  await pb.collection("_superusers").authWithPassword(email, password);
  cachedClient = pb;
  return pb;
}

/**
 * Server-side Pocketbase client authenticated as superuser for API routes that
 * need privileged collection access.
 */
export async function createPocketbaseAdminClient(): Promise<PocketBase> {
  if (cachedClient?.authStore.isValid) {
    return cachedClient;
  }

  if (!authPromise) {
    authPromise = authenticate().finally(() => {
      authPromise = null;
    });
  }

  return authPromise;
}
