import { NextRequest, NextResponse } from "next/server";

import { getRouteUser } from "@/lib/server/routeAuth";
import { createPocketbaseAdminClient } from "@/lib/pocketbase/adminClient";
import { mapInventoryToRow } from "@/lib/pocketbase/legacyShapes";
import { recursiveSerialize } from "@/utils/serialization";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const anomalyParam = request.nextUrl.searchParams.get("anomaly");
  const itemParam = request.nextUrl.searchParams.get("item");
  const limit = Number(request.nextUrl.searchParams.get("limit") || 500);

  const pb = await createPocketbaseAdminClient();
  const filters = [pb.filter("owner = {:owner}", { owner: user.id })];

  if (anomalyParam) {
    const anomaly = Number(anomalyParam);
    if (!Number.isFinite(anomaly)) {
      return NextResponse.json({ error: "Invalid anomaly" }, { status: 400 });
    }
    filters.push(pb.filter("anomaly = {:a}", { a: anomaly }));
  }

  if (itemParam) {
    const item = Number(itemParam);
    if (!Number.isFinite(item)) {
      return NextResponse.json({ error: "Invalid item" }, { status: 400 });
    }
    filters.push(pb.filter("item = {:i}", { i: item }));
  }

  const result = await pb.collection("inventory").getList(1, Math.max(1, Math.min(limit, 2000)), {
    filter: filters.join(" && "),
    sort: "-legacyId",
  });

  return NextResponse.json(recursiveSerialize({ inventory: result.items.map(mapInventoryToRow) }));
}
