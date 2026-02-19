import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { getRouteSupabaseWithUser } from "@/lib/server/supabaseRoute";

export const dynamic = "force-dynamic";

type UnlockBody = {
  skillId?: string;
};

export async function POST(request: NextRequest) {
  const { supabase, user, authError } = await getRouteSupabaseWithUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as UnlockBody;
  const skillId = typeof body?.skillId === "string" ? body.skillId.trim() : "";
  if (!skillId) {
    return NextResponse.json({ error: "Invalid skillId" }, { status: 400 });
  }

  const { data: existing, error: existingError } = await supabase
    .from("user_skills")
    .select("id")
    .eq("user_id", user.id)
    .eq("skill_id", skillId)
    .limit(1)
    .maybeSingle();

  if (existingError) {
    return NextResponse.json({ error: existingError.message }, { status: 500 });
  }

  if (existing?.id) {
    return NextResponse.json({ success: true, alreadyUnlocked: true });
  }

  const { error } = await supabase.from("user_skills").insert({
    user_id: user.id,
    skill_id: skillId,
    unlocked_at: new Date().toISOString(),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath("/game");
  revalidatePath("/activity/deploy");

  return NextResponse.json({ success: true, alreadyUnlocked: false });
}
