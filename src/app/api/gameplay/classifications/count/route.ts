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

  const classificationtype = request.nextUrl.searchParams.get("classificationtype");
  const createdAtGte = request.nextUrl.searchParams.get("createdAtGte");
  const createdAtLt = request.nextUrl.searchParams.get("createdAtLt");

  const pb = await createPocketbaseAdminClient();

  const conditions: string[] = [pb.filter("author = {:author}", { author: user.id })];
  if (classificationtype) {
    conditions.push(pb.filter("classificationtype = {:t}", { t: classificationtype }));
  }
  if (createdAtGte) {
    conditions.push(pb.filter("createdAt >= {:gte}", { gte: createdAtGte }));
  }
  if (createdAtLt) {
    conditions.push(pb.filter("createdAt < {:lt}", { lt: createdAtLt }));
  }

  const result = await pb.collection("ss_classifications").getList(1, 1, {
    filter: conditions.join(" && "),
    fields: "id",
  });

  return NextResponse.json(recursiveSerialize({ count: result.totalItems }));
}
