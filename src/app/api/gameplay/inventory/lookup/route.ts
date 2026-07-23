import { NextRequest, NextResponse } from "next/server";

import { createPocketbaseAdminClient } from "@/lib/pocketbase/adminClient";
import { getRouteUser } from "@/lib/server/routeAuth";
import { recursiveSerialize } from "@/utils/serialization";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const anomaly = Number(request.nextUrl.searchParams.get("anomaly"));
  const item = Number(request.nextUrl.searchParams.get("item"));
  if (!Number.isFinite(anomaly) || !Number.isFinite(item)) {
    return NextResponse.json({ error: "anomaly and item are required" }, { status: 400 });
  }

  const pb = await createPocketbaseAdminClient();
  const data = await pb
    .collection("inventory")
    .getFirstListItem(
      pb.filter("owner = {:owner} && anomaly = {:anomaly} && item = {:item}", {
        owner: user.id,
        anomaly,
        item,
      }),
      { sort: "legacyId", fields: "legacyId,configuration" }
    )
    .catch(() => null);

  return NextResponse.json(
    recursiveSerialize({
      item: data
        ? {
            id: data.legacyId,
            configuration: data.configuration,
          }
        : null,
    })
  );
}
