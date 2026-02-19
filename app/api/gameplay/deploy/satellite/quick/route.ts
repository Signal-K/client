import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { getRouteSupabaseWithUser } from "@/lib/server/supabaseRoute";

export const dynamic = "force-dynamic";

type Body = {
  planetClassificationId?: number | string;
};

export async function POST(request: NextRequest) {
  const { supabase, user, authError } = await getRouteSupabaseWithUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as Body;
  const planetClassificationId = Number(body?.planetClassificationId);

  if (!Number.isFinite(planetClassificationId)) {
    return NextResponse.json({ error: "Invalid planet classification id" }, { status: 400 });
  }

  const { data: cloudAnomalies, error: cloudError } = await supabase
    .from("anomalies")
    .select("id")
    .eq("anomalytype", "cloud");

  if (cloudError || !cloudAnomalies || cloudAnomalies.length === 0) {
    return NextResponse.json({ error: cloudError?.message || "No cloud anomalies available" }, { status: 500 });
  }

  const randomIndex = Math.floor(Math.random() * cloudAnomalies.length);
  const selectedAnomaly = cloudAnomalies[randomIndex];

  const insertPayload = [
    {
      author: user.id,
      anomaly_id: selectedAnomaly.id,
      classification_id: planetClassificationId,
      automaton: "WeatherSatellite",
    },
    {
      author: user.id,
      anomaly_id: selectedAnomaly.id,
      classification_id: planetClassificationId,
      automaton: "WeatherSatellite",
    },
  ];

  const { error } = await supabase.from("linked_anomalies").insert(insertPayload);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath("/activity/deploy");
  revalidatePath("/game");

  return NextResponse.json({ success: true });
}
