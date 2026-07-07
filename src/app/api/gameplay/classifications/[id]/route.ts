import { NextRequest, NextResponse } from "next/server";

import { getRouteUser } from "@/lib/server/supabaseRoute";
import { createPocketbaseAdminClient } from "@/lib/pocketbase/adminClient";
import { mapClassificationToRow } from "@/lib/pocketbase/legacyShapes";
import { recursiveSerialize } from "@/utils/serialization";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isFinite(numericId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const pb = await createPocketbaseAdminClient();
  const record = await pb
    .collection("classifications")
    .getFirstListItem(pb.filter("legacyId = {:id}", { id: numericId }))
    .catch(() => null);

  if (!record) {
    return NextResponse.json({ error: "Classification not found" }, { status: 404 });
  }

  return NextResponse.json({ classification: recursiveSerialize(mapClassificationToRow(record)) });
}
