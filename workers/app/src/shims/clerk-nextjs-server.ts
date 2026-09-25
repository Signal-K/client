// `@clerk/nextjs/server` for the Worker bundle. Identity comes from the Clerk
// session JWT the router already verified locally (workers/api/src/jwt.ts),
// so auth() costs no Clerk API call. clerkClient()/currentUser() use the
// fetch-based @clerk/backend client and are only reached by the few routes
// that genuinely need Clerk's Backend API.
import { createClerkClient, type ClerkClient, type User } from "@clerk/backend";

import { currentRequestContext } from "../context";

export async function auth() {
  const { userId, sessionId, claims } = currentRequestContext();
  return {
    userId,
    sessionId,
    sessionClaims: claims,
    isAuthenticated: Boolean(userId),
  };
}

let client: ClerkClient | null = null;

export async function clerkClient(): Promise<ClerkClient> {
  if (!client) {
    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey) throw new Error("CLERK_SECRET_KEY is not configured");
    client = createClerkClient({ secretKey, publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY });
  }
  return client;
}

export async function currentUser(): Promise<User | null> {
  const { userId } = currentRequestContext();
  if (!userId) return null;
  return (await clerkClient()).users.getUser(userId);
}
