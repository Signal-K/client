import PocketBase from "pocketbase";

/**
 * Server-side Pocketbase client authenticated as superuser, for API routes
 * writing to storage_objects (and, once Phase 2's broader rewrite lands, any
 * other collection). Mirrors the pattern in src/lib/supabase/legacyDataClient.ts.
 */
export async function createPocketbaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_POCKETBASE_URL;
  const email = process.env.POCKETBASE_ADMIN_EMAIL;
  const password = process.env.POCKETBASE_ADMIN_PASSWORD;

  if (!url || !email || !password) {
    throw new Error("Missing Pocketbase admin environment variables");
  }

  const pb = new PocketBase(url);
  await pb.collection("_superusers").authWithPassword(email, password);
  return pb;
}
