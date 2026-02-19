import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { getRouteSupabaseWithUser } from "@/lib/server/supabaseRoute";

export const dynamic = "force-dynamic";

export async function POST() {
  const { supabase, user, authError } = await getRouteSupabaseWithUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: existing, error: existingError } = await supabase
    .from("notification_rejections")
    .select("id")
    .eq("profile_id", user.id)
    .limit(1);

  if (existingError) {
    return NextResponse.json({ error: existingError.message }, { status: 500 });
  }
  if ((existing || []).length > 0) {
    return NextResponse.json({ success: true, alreadyExists: true });
  }

  const { error } = await supabase.from("notification_rejections").insert({
    profile_id: user.id,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath("/game");
  return NextResponse.json({ success: true, alreadyExists: false });
}
