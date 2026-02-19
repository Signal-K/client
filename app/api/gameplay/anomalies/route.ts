import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { getRouteSupabaseWithUser } from "@/lib/server/supabaseRoute";

export const dynamic = "force-dynamic";

type AnomalyInput = Record<string, unknown>;

type AnomalyBody = {
  anomalies?: AnomalyInput[];
  anomaly?: AnomalyInput;
};

export async function POST(request: NextRequest) {
  const { supabase, user, authError } = await getRouteSupabaseWithUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as AnomalyBody;
  const rows = Array.isArray(body?.anomalies)
    ? body.anomalies
    : body?.anomaly
    ? [body.anomaly]
    : [];

  if (rows.length === 0) {
    return NextResponse.json({ error: "No anomalies provided" }, { status: 400 });
  }

  const { data, error } = await supabase.from("anomalies").insert(rows).select("id, avatar_url");
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath("/game");
  revalidatePath("/viewports/roover");

  return NextResponse.json(data || []);
}
