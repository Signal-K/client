import { NextResponse } from "next/server";

import { getRouteSupabaseWithUser } from "@/lib/server/supabaseRoute";

export const dynamic = "force-dynamic";

export async function GET() {
  const { supabase, user, authError } = await getRouteSupabaseWithUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("linked_anomalies")
    .select(
      `
      id,
      anomaly_id,
      date,
      automaton,
      unlocked,
      anomaly:anomaly_id(
        id,
        content,
        anomalytype,
        anomalySet
      )
    `
    )
    .eq("author", user.id)
    .eq("unlocked", false)
    .order("date", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const linkedAnomalies = (data || []).map((item: any) => ({
    ...item,
    anomaly: Array.isArray(item.anomaly) ? item.anomaly[0] : item.anomaly,
  }));

  return NextResponse.json({ linkedAnomalies });
}
