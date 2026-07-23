import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { getRouteUser } from "@/lib/server/routeAuth";
import { createPocketbaseAdminClient } from "@/lib/pocketbase/adminClient";
import { recursiveSerialize } from "@/utils/serialization";

export const dynamic = "force-dynamic";

type IncrementBody = {
  amount?: number;
};

export async function POST(request: NextRequest) {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return NextResponse.json(recursiveSerialize({ error: "Unauthorized" }), { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as IncrementBody;
  const amount = Number(body?.amount ?? 1);
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json(recursiveSerialize({ error: "Invalid amount" }), { status: 400 });
  }

  const pb = await createPocketbaseAdminClient();
  const profile = await pb
    .collection("profiles")
    .getFirstListItem(pb.filter("userId = {:id}", { id: user.id }))
    .catch(() => null);

  if (!profile) {
    return NextResponse.json(recursiveSerialize({ error: "Profile not found" }), { status: 404 });
  }

  const nextPoints = (profile.classificationPoints || 0) + amount;
  await pb.collection("profiles").update(profile.id, { classificationPoints: nextPoints });

  revalidatePath("/game");
  revalidatePath("/profile");

  return NextResponse.json(recursiveSerialize({ success: true, classificationPoints: nextPoints }));
}
