import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { getRouteUser } from "@/lib/server/routeAuth";
import { createPocketbaseAdminClient } from "@/lib/pocketbase/adminClient";
import { recursiveSerialize } from "@/utils/serialization";

export const dynamic = "force-dynamic";

type SolarActionBody =
  | {
      action: "ensure_event";
      weekStart?: string;
      weekEnd?: string;
    }
  | {
      action: "mark_defended";
      eventId?: string;
    }
  | {
      action: "launch_probe";
      eventId?: string;
      count?: number;
    };

export async function POST(request: NextRequest) {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as SolarActionBody;
  const pb = await createPocketbaseAdminClient();

  if (body?.action === "ensure_event") {
    const weekStart = typeof body?.weekStart === "string" ? body.weekStart : "";
    const weekEnd = typeof body?.weekEnd === "string" ? body.weekEnd : "";

    if (!weekStart || !weekEnd) {
      return NextResponse.json({ error: "weekStart and weekEnd are required" }, { status: 400 });
    }

    const now = new Date().toISOString();
    const newEvent = await pb.collection("solar_events").create({
      weekStart,
      weekEnd,
      wasDefended: false,
      createdAt: now,
      updatedAt: now,
    });

    revalidatePath("/game");
    return NextResponse.json(
      recursiveSerialize({
        id: newEvent.id,
        week_start: newEvent.weekStart,
        week_end: newEvent.weekEnd,
        was_defended: newEvent.wasDefended,
        created_at: newEvent.createdAt,
        updated_at: newEvent.updatedAt,
      })
    );
  }

  if (body?.action === "mark_defended") {
    const eventId = body?.eventId;
    if (!eventId) {
      return NextResponse.json({ error: "Invalid eventId" }, { status: 400 });
    }

    await pb.collection("solar_events").update(eventId, { wasDefended: true, updatedAt: new Date().toISOString() });

    revalidatePath("/game");
    return NextResponse.json(recursiveSerialize({ success: true }));
  }

  if (body?.action === "launch_probe") {
    const eventId = body?.eventId;
    const count = Number(body?.count ?? 1);
    if (!eventId || !Number.isFinite(count) || count <= 0) {
      return NextResponse.json({ error: "Invalid launch payload" }, { status: 400 });
    }

    await pb.collection("defensive_probes").create({
      eventId,
      userId: user.id,
      count,
      launchedAt: new Date().toISOString(),
    });

    revalidatePath("/game");
    return NextResponse.json(recursiveSerialize({ success: true }));
  }

  return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
}
