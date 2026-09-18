import type PocketBase from "pocketbase";

export interface GardenIdentity {
  username: string | null;
  fullName: string | null;
  classificationPoints: number;
  profileId: string | null;
}

async function first<T>(query: () => Promise<T>): Promise<T | null> {
  try {
    return await query();
  } catch {
    return null;
  }
}

/**
 * Resolve the display profile after Clerk / PocketBase remaps.
 * Prefer a row with a username over an empty Clerk webhook stub.
 */
export async function resolveGardenIdentity(
  pb: PocketBase,
  clerkUserId: string,
  email?: string | null
): Promise<GardenIdentity> {
  const empty: GardenIdentity = {
    username: null,
    fullName: null,
    classificationPoints: 0,
    profileId: null,
  };
  if (!clerkUserId) return empty;

  const byClerk = await first(() =>
    pb.collection("profiles").getFirstListItem(pb.filter("userId = {:id}", { id: clerkUserId }))
  );

  const identity = await first(() =>
    pb
      .collection("ss_clerk_identity")
      .getFirstListItem(pb.filter("clerk_user_id = {:id}", { id: clerkUserId }))
  );

  const extraIds = [identity?.source_user_id, identity?.shared_user_id]
    .map((value) => (typeof value === "string" ? value : ""))
    .filter((value) => value && value !== clerkUserId);

  const legacyProfiles = [];
  for (const id of extraIds) {
    const row = await first(() =>
      pb.collection("profiles").getFirstListItem(pb.filter("userId = {:id}", { id }))
    );
    if (row) legacyProfiles.push(row);
  }

  let ecoUsername: string | null = null;
  let ecoName: string | null = null;
  if (email) {
    const authUser = await first(() =>
      pb.collection("users").getFirstListItem(pb.filter("email = {:email}", { email }))
    );
    if (authUser?.id) {
      const eco = await first(() =>
        pb
          .collection("ecosystem_profiles")
          .getFirstListItem(pb.filter("user = {:id}", { id: authUser.id }))
      );
      ecoUsername = (eco?.username as string | undefined) || null;
      ecoName = (eco?.display_name as string | undefined) || null;
    }
  }

  const named = [byClerk, ...legacyProfiles].find((row) => typeof row?.username === "string" && row.username.trim());
  const chosen = named || byClerk || legacyProfiles[0] || null;
  const username =
    (chosen?.username as string | undefined)?.trim() || ecoUsername?.trim() || null;
  const fullName =
    (chosen?.fullName as string | undefined)?.trim() || ecoName?.trim() || null;

  if (byClerk && username && !String(byClerk.username || "").trim()) {
    await first(() =>
      pb.collection("profiles").update(byClerk.id, {
        username,
        fullName: fullName || byClerk.fullName || "",
        updatedAt: new Date().toISOString(),
      })
    );
  }

  return {
    username,
    fullName,
    classificationPoints: Number(chosen?.classificationPoints ?? byClerk?.classificationPoints ?? 0) || 0,
    profileId: chosen?.id ?? byClerk?.id ?? null,
  };
}
