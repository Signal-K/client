import { NextRequest, NextResponse } from "next/server";

import { createPocketbaseAdminClient } from "@/lib/pocketbase/adminClient";
import { getRouteUser } from "@/lib/server/routeAuth";
import {
  SATURN_CLASSIFICATIONS_COLLECTION,
  buildSaturnClassificationRecord,
  isSaturnPoolFrameId,
  isSaturnVerdict,
} from "@/src/lib/gameplay/saturnStorm";

export const dynamic = "force-dynamic";

// SSC-43: write one pool classification. The classification's `user` is the
// shared PocketBase user id (resolved from the Clerk identity map), the same
// id Landnam writes. The backend hook bumps the frame's answer counters.
export async function POST(request: NextRequest) {
  const { user } = await getRouteUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const frame = typeof body?.frame === "string" ? body.frame : "";
  if (!isSaturnPoolFrameId(frame) || !isSaturnVerdict(body?.answer)) {
    return NextResponse.json({ error: "Invalid classification" }, { status: 400 });
  }

  try {
    const pb = await createPocketbaseAdminClient();
    const identity = await pb
      .collection("ss_clerk_identity")
      .getFirstListItem(pb.filter("clerk_user_id = {:id}", { id: user.id }))
      .catch(() => null);
    const sharedUserId = typeof identity?.shared_user_id === "string" ? identity.shared_user_id : "";
    if (!sharedUserId) return NextResponse.json({ ok: false, reason: "no-shared-user" }, { status: 202 });

    await pb
      .collection(SATURN_CLASSIFICATIONS_COLLECTION)
      .create(buildSaturnClassificationRecord(sharedUserId, frame, body.answer));
    return NextResponse.json({ ok: true });
  } catch (error) {
    // Unique user+frame: a repeat answer is already recorded.
    const status = (error as { status?: number })?.status;
    if (status === 400) return NextResponse.json({ ok: true, duplicate: true });
    return NextResponse.json({ error: "Pool unavailable" }, { status: 503 });
  }
}
