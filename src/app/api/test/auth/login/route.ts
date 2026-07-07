import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";

/**
 * E2E test-only backdoor. Unlike the old Supabase version, this can't set a
 * session cookie synchronously — Clerk sessions are established client-side by
 * exchanging a sign-in ticket. Returns `{ ticket }`; the caller (Cypress) should
 * visit `/auth?__clerk_ticket=<ticket>`, which <SignIn> consumes automatically
 * to complete the sign-in. The test user must already exist in Clerk (create
 * fixture users ahead of time — this route does not create accounts).
 */
export async function POST(request: NextRequest) {
  if (process.env.E2E_TEST_AUTH_ENABLED !== "true") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { email } = await request.json();
  if (typeof email !== "string") {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const client = await clerkClient();
  const { data: users } = await client.users.getUserList({ emailAddress: [email] });
  const user = users[0];
  if (!user) {
    return NextResponse.json({ error: "Test user not found" }, { status: 404 });
  }

  const signInToken = await client.signInTokens.createSignInToken({
    userId: user.id,
    expiresInSeconds: 60,
  });

  return NextResponse.json({ ticket: signInToken.token });
}
