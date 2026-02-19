import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { getRouteSupabaseWithUser } from "@/lib/server/supabaseRoute";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const { supabase, user, authError } = await getRouteSupabaseWithUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const npsScore = Number(body?.npsScore);
  const feedback = typeof body?.feedback === "string" ? body.feedback : null;

  if (!Number.isFinite(npsScore) || npsScore < 0 || npsScore > 10) {
    return NextResponse.json({ error: "Invalid score" }, { status: 400 });
  }

  const { error } = await supabase.from("nps_surveys").insert([
    {
      user_id: user.id,
      nps_score: npsScore,
      project_interests: feedback,
    },
  ]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath("/game");

  return NextResponse.json({ success: true });
}
