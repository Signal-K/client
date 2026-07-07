import { NextRequest, NextResponse } from "next/server";

import { getRouteUser } from "@/lib/server/supabaseRoute";
import { createPocketbaseAdminClient } from "@/lib/pocketbase/adminClient";
import { recursiveSerialize } from "@/utils/serialization";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const classificationType = request.nextUrl.searchParams.get("classificationtype");
  if (!classificationType) {
    return NextResponse.json({ error: "classificationtype is required" }, { status: 400 });
  }

  const pb = await createPocketbaseAdminClient();
  const existing = await pb
    .collection("classifications")
    .getFirstListItem(
      pb.filter("author = {:author} && classificationtype = {:t}", { author: user.id, t: classificationType })
    )
    .catch(() => null);

  return NextResponse.json(recursiveSerialize({ exists: !!existing }));
}
