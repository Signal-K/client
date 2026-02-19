import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { getRouteSupabaseWithUser } from "@/lib/server/supabaseRoute";

export const dynamic = "force-dynamic";

type SolarActionBody =
  | {
      action: "ensure_event";
      weekStart?: string;
      weekEnd?: string;
    }
  | {
      action: "mark_defended";
      eventId?: number | string;
    }
  | {
      action: "launch_probe";
      eventId?: number | string;
      count?: number;
    };

export async function POST(request: NextRequest) {
  const { supabase, user, authError } = await getRouteSupabaseWithUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as SolarActionBody;
  if (body?.action === "ensure_event") {
    const weekStart = typeof body?.weekStart === "string" ? body.weekStart : "";
    const weekEnd = typeof body?.weekEnd === "string" ? body.weekEnd : "";

    if (!weekStart || !weekEnd) {
      return NextResponse.json({ error: "weekStart and weekEnd are required" }, { status: 400 });
    }

    const { data: newEvent, error } = await supabase
      .from("solar_events")
      .insert({
        week_start: weekStart,
        week_end: weekEnd,
        was_defended: false,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidatePath("/game");
    return NextResponse.json(newEvent);
  }

  if (body?.action === "mark_defended") {
    const eventId = Number(body?.eventId);
    if (!Number.isFinite(eventId)) {
      return NextResponse.json({ error: "Invalid eventId" }, { status: 400 });
    }

    const { error } = await supabase.from("solar_events").update({ was_defended: true }).eq("id", eventId);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidatePath("/game");
    return NextResponse.json({ success: true });
  }

  if (body?.action === "launch_probe") {
    const eventId = Number(body?.eventId);
    const count = Number(body?.count ?? 1);
    if (!Number.isFinite(eventId) || !Number.isFinite(count) || count <= 0) {
      return NextResponse.json({ error: "Invalid launch payload" }, { status: 400 });
    }

    const { error } = await supabase.from("defensive_probes").insert({
      event_id: eventId,
      user_id: user.id,
      count,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidatePath("/game");
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
}
