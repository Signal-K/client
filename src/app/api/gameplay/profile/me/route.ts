import { NextResponse } from "next/server";

import { getRouteUser } from "@/lib/server/supabaseRoute";
import { createPocketbaseAdminClient } from "@/lib/pocketbase/adminClient";

export const dynamic = "force-dynamic";

export async function GET() {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pb = await createPocketbaseAdminClient();
  const profile = await pb
    .collection("profiles")
    .getFirstListItem(pb.filter("userId = {:id}", { id: user.id }))
    .catch(() => null);

  return NextResponse.json({
    avatar_url: profile?.avatarUrl ?? null,
    username: profile?.username ?? null,
    full_name: profile?.fullName ?? null,
    referral_code: profile?.referralCode ?? null,
    location: profile?.location != null ? String(profile.location) : null,
  });
}
