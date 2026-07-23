import { NextRequest, NextResponse } from "next/server";

import { createPocketbaseAdminClient } from "@/lib/pocketbase/adminClient";
import { getRouteUser } from "@/lib/server/routeAuth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const since = request.nextUrl.searchParams.get("since");
  const pb = await createPocketbaseAdminClient();
  const filters = [pb.filter("author = {:author}", { author: user.id })];
  if (since) {
    filters.push(pb.filter("timestamp >= {:since}", { since }));
  }

  const data = await pb
    .collection("routes")
    .getFirstListItem(filters.join(" && "), { sort: "-timestamp" })
    .catch(() => null);

  return NextResponse.json({
    route: data
      ? {
          id: data.legacyId,
          author: data.author,
          routeConfiguration: data.routeConfiguration,
          timestamp: data.timestamp,
          location: data.location,
        }
      : null,
  });
}
