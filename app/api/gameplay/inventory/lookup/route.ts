import { NextRequest, NextResponse } from "next/server";

import { getRouteSupabaseWithUser } from "@/lib/server/supabaseRoute";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { supabase, user, authError } = await getRouteSupabaseWithUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const anomaly = Number(request.nextUrl.searchParams.get("anomaly"));
  const item = Number(request.nextUrl.searchParams.get("item"));
  if (!Number.isFinite(anomaly) || !Number.isFinite(item)) {
    return NextResponse.json({ error: "anomaly and item are required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("inventory")
    .select("id, configuration")
    .eq("owner", user.id)
    .eq("anomaly", anomaly)
    .eq("item", item)
    .order("id", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ item: data ?? null });
}
