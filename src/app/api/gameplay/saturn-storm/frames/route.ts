import { NextResponse } from "next/server";

import { createPocketbaseAdminClient } from "@/lib/pocketbase/adminClient";
import { SATURN_FRAMES_COLLECTION, toSaturnFrames } from "@/src/lib/gameplay/saturnStorm";

export const dynamic = "force-dynamic";

// SSC-43: reviewable (non-retired) Saturn frames from the shared pool. Public,
// read-mostly, so the CDN holds it. A missing collection or an outage returns
// an empty list and the Garden hides the Saturn tab content.
export async function GET() {
  try {
    const pb = await createPocketbaseAdminClient();
    const page = await pb.collection(SATURN_FRAMES_COLLECTION).getList(1, 30, {
      filter: "retired = false",
      sort: "subject_id",
      fields: "id,subject_id,opus_id,image_url",
      skipTotal: true,
    });
    return NextResponse.json(toSaturnFrames(page.items), {
      headers: { "cache-control": "public, s-maxage=300, stale-while-revalidate=600" },
    });
  } catch {
    return NextResponse.json([], { headers: { "cache-control": "no-store" } });
  }
}
