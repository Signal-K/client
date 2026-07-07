import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { getRouteUser } from "@/lib/server/supabaseRoute";
import { createPocketbaseAdminClient } from "@/lib/pocketbase/adminClient";

export const dynamic = "force-dynamic";

export async function POST() {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pb = await createPocketbaseAdminClient();
  const existing = await pb
    .collection("notification_rejections")
    .getFirstListItem(pb.filter("profileId = {:id}", { id: user.id }))
    .catch(() => null);

  if (existing) {
    return NextResponse.json({ success: true, alreadyExists: true });
  }

  await pb.collection("notification_rejections").create({
    profileId: user.id,
    createdAt: new Date().toISOString(),
  });

  revalidatePath("/game");
  return NextResponse.json({ success: true, alreadyExists: false });
}
