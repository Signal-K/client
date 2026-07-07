import { NextResponse } from "next/server";

import { createPocketbaseAdminClient } from "@/lib/pocketbase/adminClient";
import { getRouteUser } from "@/lib/server/supabaseRoute";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { user, authError } = await getRouteUser();
    if (authError || !user) {
      return NextResponse.json({ authenticated: false, hasReferral: false }, { status: 200 });
    }

    const pb = await createPocketbaseAdminClient();
    const data = await pb
      .collection("referrals")
      .getFirstListItem(pb.filter("referreeId = {:id}", { id: user.id }))
      .catch(() => null);

    return NextResponse.json({ authenticated: true, hasReferral: Boolean(data) });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[referral-status] GET error:", message);
    return NextResponse.json({ error: "Internal server error", message }, { status: 500 });
  }
}
