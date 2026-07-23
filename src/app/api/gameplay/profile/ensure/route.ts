import { NextResponse } from "next/server";

import { getRouteUser } from "@/lib/server/routeAuth";
import { createPocketbaseAdminClient } from "@/lib/pocketbase/adminClient";

export const dynamic = "force-dynamic";

export async function POST() {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pb = await createPocketbaseAdminClient();
  const existing = await pb
    .collection("profiles")
    .getFirstListItem(pb.filter("userId = {:id}", { id: user.id }))
    .catch(() => null);

  if (!existing) {
    await pb.collection("profiles").create({
      userId: user.id,
      updatedAt: new Date().toISOString(),
    });
  }

  return NextResponse.json({ success: true });
}
