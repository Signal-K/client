import { NextRequest, NextResponse } from "next/server";

import { getRouteSupabaseWithUser } from "@/lib/server/supabaseRoute";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { supabase, user, authError } = await getRouteSupabaseWithUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const since = request.nextUrl.searchParams.get("since");
  const query = supabase
    .from("routes")
    .select("*")
    .eq("author", user.id)
    .order("timestamp", { ascending: false })
    .limit(1);

  if (since) {
    query.gte("timestamp", since);
  }

  const { data, error } = await query.maybeSingle();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ route: data ?? null });
}
