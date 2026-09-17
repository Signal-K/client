import { auth } from "@clerk/nextjs/server";

/* v8 ignore start */
export async function getRouteUser() {
  let userId: string | null = null;

  try {
    ({ userId } = await auth());
  } catch {
    // clerkMiddleware() did not run for this request, for example a server
    // action posted back from a page the matcher does not cover. Degrade to a
    // signed-out result instead of throwing an unhandled rejection.
    return {
      user: null,
      authError: new Error("Auth context unavailable"),
    };
  }

  if (!userId) {
    return {
      user: null,
      authError: new Error("Not signed in"),
    };
  }

  return {
    // Route handlers only need the authenticated subject. Avoiding
    // currentUser() here removes an extra Clerk API request from every
    // gameplay request and prevents a slow Clerk response from blocking the
    // first page-data request after sign-in.
    user: {
      id: userId,
      email: null,
      is_anonymous: false,
    },
    authError: null,
  };
}
/* v8 ignore stop */
