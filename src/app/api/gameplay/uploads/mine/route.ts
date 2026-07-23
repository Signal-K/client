import { NextResponse } from "next/server";

import { getRouteUser } from "@/lib/server/routeAuth";
import { createPocketbaseAdminClient } from "@/lib/pocketbase/adminClient";
import { mapUploadToRow } from "@/lib/pocketbase/legacyShapes";
import { recursiveSerialize } from "@/utils/serialization";

export const dynamic = "force-dynamic";

export async function GET() {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return NextResponse.json(recursiveSerialize({ error: "Unauthorized" }), { status: 401 });
  }

  const pb = await createPocketbaseAdminClient();
  const uploads = await pb.collection("uploads").getFullList({
    filter: pb.filter("author = {:author}", { author: user.id }),
    sort: "-createdAt",
  });

  return NextResponse.json(recursiveSerialize({ uploads: uploads.map(mapUploadToRow) }));
}
