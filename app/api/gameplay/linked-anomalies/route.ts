import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { getRouteSupabaseWithUser } from "@/lib/server/supabaseRoute";

export const dynamic = "force-dynamic";

type DeleteBody = {
  anomalyId?: number | string;
  automaton?: string;
  linkedAnomalyId?: number | string;
};

type PatchBody = {
  id?: number | string;
  unlocked?: boolean;
};

export async function DELETE(request: NextRequest) {
  const { supabase, user, authError } = await getRouteSupabaseWithUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as DeleteBody;

  let query = supabase.from("linked_anomalies").delete().eq("author", user.id);
  let hasFilter = false;

  if (body?.linkedAnomalyId !== undefined && body?.linkedAnomalyId !== null) {
    const linkedAnomalyId = Number(body.linkedAnomalyId);
    if (!Number.isFinite(linkedAnomalyId)) {
      return NextResponse.json({ error: "Invalid linkedAnomalyId" }, { status: 400 });
    }
    query = query.eq("id", linkedAnomalyId);
    hasFilter = true;
  }

  if (body?.anomalyId !== undefined && body?.anomalyId !== null) {
    const anomalyId = Number(body.anomalyId);
    if (!Number.isFinite(anomalyId)) {
      return NextResponse.json({ error: "Invalid anomalyId" }, { status: 400 });
    }
    query = query.eq("anomaly_id", anomalyId);
    hasFilter = true;
  }

  if (typeof body?.automaton === "string" && body.automaton.trim()) {
    query = query.eq("automaton", body.automaton.trim());
    hasFilter = true;
  }

  if (!hasFilter) {
    return NextResponse.json({ error: "At least one delete filter is required" }, { status: 400 });
  }

  const { error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath("/activity/deploy");
  revalidatePath("/viewports/satellite");
  revalidatePath("/viewports/roover");

  return NextResponse.json({ success: true });
}

export async function PATCH(request: NextRequest) {
  const { supabase, user, authError } = await getRouteSupabaseWithUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as PatchBody;
  const id = Number(body?.id);

  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (typeof body?.unlocked === "boolean") {
    updates.unlocked = body.unlocked;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid patch fields provided" }, { status: 400 });
  }

  const { error } = await supabase
    .from("linked_anomalies")
    .update(updates)
    .eq("id", id)
    .eq("author", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath("/viewports/satellite");
  revalidatePath("/viewports/roover");

  return NextResponse.json({ success: true });
}
