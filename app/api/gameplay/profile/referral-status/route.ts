import { NextResponse } from "next/server";

import { getRouteSupabaseWithUser } from "@/lib/server/supabaseRoute";

export const dynamic = "force-dynamic";

export async function GET() {
  const { supabase, user, authError } = await getRouteSupabaseWithUser();
  if (authError || !user) {
    return NextResponse.json({ authenticated: false, hasReferral: false }, { status: 200 });
  }

  const { data, error } = await supabase
    .from("referrals")
    .select("id")
    .eq("referree_id", user.id)
    .limit(1)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ authenticated: true, hasReferral: false, error: error.message }, { status: 200 });
  }

  return NextResponse.json({ authenticated: true, hasReferral: !!data });
}

