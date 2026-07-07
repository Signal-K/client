import { auth, currentUser } from "@clerk/nextjs/server";

/* v8 ignore next 22 */
export async function getRouteUser() {
  const { userId } = await auth();

  if (!userId) {
    return {
      user: null,
      authError: new Error("Not signed in"),
    };
  }

  const clerkUser = await currentUser();

  return {
    user: clerkUser
      ? {
          id: userId,
          email: clerkUser.primaryEmailAddress?.emailAddress ?? null,
          is_anonymous: Boolean(clerkUser.publicMetadata?.guest),
        }
      : null,
    authError: clerkUser ? null : new Error("User not found"),
  };
}
