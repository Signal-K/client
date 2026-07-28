import { auth } from "@clerk/nextjs/server";

/* v8 ignore next 22 */
export async function getRouteUser() {
  const { userId } = await auth();

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
