import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { getRouteSupabaseWithUser } from "@/lib/server/supabaseRoute";

export const dynamic = "force-dynamic";

type IncrementBody = {
  amount?: number;
};

export async function POST(request: NextRequest) {
  const { supabase, user, authError } = await getRouteSupabaseWithUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as IncrementBody;
  const amount = Number(body?.amount ?? 1);
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, classificationPoints")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ error: profileError?.message || "Profile not found" }, { status: 404 });
  }

  const nextPoints = (profile.classificationPoints || 0) + amount;
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ classificationPoints: nextPoints })
    .eq("id", user.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  revalidatePath("/game");
  revalidatePath("/profile");

  return NextResponse.json({ success: true, classificationPoints: nextPoints });
}
