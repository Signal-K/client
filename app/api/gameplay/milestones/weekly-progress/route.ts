import { NextRequest, NextResponse } from "next/server";

import { getRouteSupabaseWithUser } from "@/lib/server/supabaseRoute";

export const dynamic = "force-dynamic";

type Milestone = {
  name: string;
  table: string;
  field: string;
  value: string;
};

type Body = {
  weekStart?: string;
  data?: Milestone[];
  community?: boolean;
};

export async function POST(request: NextRequest) {
  const { supabase, user, authError } = await getRouteSupabaseWithUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as Body;
  const weekStart = body?.weekStart;
  const data = Array.isArray(body?.data) ? body.data : [];
  const community = body?.community === true;

  if (!weekStart || data.length === 0) {
    return NextResponse.json({ progress: {} });
  }

  const startDate = new Date(weekStart);
  if (Number.isNaN(startDate.getTime())) {
    return NextResponse.json({ error: "Invalid weekStart" }, { status: 400 });
  }

  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);
  endDate.setHours(23, 59, 59, 999);

  const progress: Record<string, number> = {};

  for (const milestone of data) {
    const { table, field, value } = milestone;
    if (!table || !field) continue;

    const userField = ["votes", "classifications", "comments"].includes(table) ? "user_id" : "author";

    let query = supabase
      .from(table)
      .select("id", { count: "exact", head: false })
      .eq(field, value)
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString());

    if (!community) {
      query = query.eq(userField, user.id);
    }

    const { count, error } = await query;

    if (!error && typeof count === "number") {
      progress[milestone.name] = count;
    }
  }

  return NextResponse.json({ progress });
}
