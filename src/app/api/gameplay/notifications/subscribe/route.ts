import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { getRouteUser } from "@/lib/server/supabaseRoute";
import { createPocketbaseAdminClient } from "@/lib/pocketbase/adminClient";

export const dynamic = "force-dynamic";

type SubscribeBody = {
  endpoint?: string;
  auth?: string;
  p256dh?: string;
};

export async function POST(request: NextRequest) {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as SubscribeBody;
  const endpoint = typeof body?.endpoint === "string" ? body.endpoint.trim() : "";
  if (!endpoint) {
    return NextResponse.json({ error: "endpoint is required" }, { status: 400 });
  }

  const auth = typeof body?.auth === "string" ? body.auth : "";
  const p256dh = typeof body?.p256dh === "string" ? body.p256dh : "";

  const pb = await createPocketbaseAdminClient();
  const existing = await pb
    .collection("push_subscriptions")
    .getFirstListItem(pb.filter("profileId = {:id} && endpoint = {:e}", { id: user.id, e: endpoint }))
    .catch(() => null);

  if (existing) {
    return NextResponse.json({ success: true, alreadyExists: true });
  }

  await pb.collection("push_subscriptions").create({
    profileId: user.id,
    endpoint,
    auth,
    p256dh,
    createdAt: new Date().toISOString(),
  });

  revalidatePath("/game");
  return NextResponse.json({ success: true, alreadyExists: false });
}
