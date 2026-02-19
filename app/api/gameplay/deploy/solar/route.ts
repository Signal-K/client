import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { getRouteSupabaseWithUser } from "@/lib/server/supabaseRoute";

export const dynamic = "force-dynamic";

function getWeekStart(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

export async function POST() {
  const { supabase, user, authError } = await getRouteSupabaseWithUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const weekStart = getWeekStart(now).toISOString();
  const automatonType = "TelescopeSolar";

  const [{ data: anomalies, error: anomalyError }, { data: existing, error: existingError }] = await Promise.all([
    supabase.from("anomalies").select("id").eq("anomalySet", "sunspot"),
    supabase
      .from("linked_anomalies")
      .select("id")
      .eq("author", user.id)
      .eq("automaton", automatonType)
      .gte("date", weekStart)
      .limit(1),
  ]);

  if (anomalyError || existingError) {
    return NextResponse.json(
      { error: anomalyError?.message || existingError?.message || "Failed to join solar mission" },
      { status: 500 }
    );
  }

  if ((existing || []).length > 0) {
    return NextResponse.json({ success: true, inserted: 0 });
  }

  const rows = (anomalies || []).map((anomaly: any) => ({
    author: user.id,
    anomaly_id: anomaly.id,
    automaton: automatonType,
    unlocked: false,
    date: now.toISOString(),
  }));

  if (rows.length === 0) {
    return NextResponse.json({ error: "No sunspot anomalies available" }, { status: 400 });
  }

  const { error } = await supabase.from("linked_anomalies").insert(rows);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath("/viewports/solar");
  revalidatePath("/game");

  return NextResponse.json({ success: true, inserted: rows.length });
}
