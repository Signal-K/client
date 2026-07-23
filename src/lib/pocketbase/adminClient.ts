import PocketBase from "pocketbase";

/**
 * Server-side Pocketbase client authenticated as superuser for API routes that
 * need privileged collection access.
 */
export async function createPocketbaseAdminClient() {
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
  return pb;
}
