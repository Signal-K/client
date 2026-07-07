import { clerkClient } from "@clerk/nextjs/server";

/**
 * Clerk has no built-in "anonymous session" like Supabase's signInAnonymously().
 * This emulates it: create a real Clerk user with no email/password, flagged via
 * publicMetadata.guest, then hand back a short-lived sign-in ticket the client
 * exchanges for a session (via useSignIn().create({ strategy: "ticket", ticket })
 * or by redirecting to a URL with ?__clerk_ticket=<ticket>, which <SignIn>/<SignUp>
 * consume automatically). See ConvertAnonymousAccount.tsx for the upgrade flow.
 */
export async function createGuestSession() {
  const client = await clerkClient();

  const guestUser = await client.users.createUser({
    publicMetadata: { guest: true },
    skipPasswordChecks: true,
    skipPasswordRequirement: true,
  });

  const signInToken = await client.signInTokens.createSignInToken({
    userId: guestUser.id,
    expiresInSeconds: 60,
  });

  return { userId: guestUser.id, ticket: signInToken.token };
}
