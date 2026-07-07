import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { getRouteUser } from "@/lib/server/supabaseRoute";
import { createPocketbaseAdminClient } from "@/lib/pocketbase/adminClient";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const npsScore = Number(body?.npsScore);
  const feedback = typeof body?.feedback === "string" ? body.feedback : null;

  if (!Number.isFinite(npsScore) || npsScore < 0 || npsScore > 10) {
    return NextResponse.json({ error: "Invalid score" }, { status: 400 });
  }

  const pb = await createPocketbaseAdminClient();
  await pb.collection("nps_surveys").create({
    createdAt: new Date().toISOString(),
    userId: user.id,
    npsScore,
    projectInterests: feedback,
  });

  revalidatePath("/game");

  return NextResponse.json({ success: true });
}
