import { NextRequest, NextResponse } from "next/server";

import { getRouteUser } from "@/lib/server/routeAuth";
import { createPocketbaseAdminClient } from "@/lib/pocketbase/adminClient";
import { recursiveSerialize } from "@/utils/serialization";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const missionParam = Number(request.nextUrl.searchParams.get("mission"));
  if (!Number.isFinite(missionParam)) {
    return NextResponse.json({ error: "mission is required" }, { status: 400 });
  }

  const pb = await createPocketbaseAdminClient();
  const existing = await pb
    .collection("missions")
    .getFirstListItem(pb.filter("userId = {:user} && mission = {:mission}", { user: user.id, mission: missionParam }))
    .catch(() => null);

  return NextResponse.json(recursiveSerialize({ exists: !!existing }));
}
