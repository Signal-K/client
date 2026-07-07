"use client";

import { useUser } from "@clerk/nextjs";

export function useAuthUser() {
  const { isLoaded, isSignedIn, user: clerkUser } = useUser();

  const user = isSignedIn && clerkUser
    ? {
        id: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress ?? null,
        is_anonymous: Boolean(clerkUser.publicMetadata?.guest),
      }
    : null;

  return { user, isLoading: !isLoaded };
}
