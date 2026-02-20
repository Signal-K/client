import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/server/prisma";
import { getRouteUser } from "@/lib/server/supabaseRoute";

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
  const { user, authError } = await getRouteUser();
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

    const rows = await prisma.$queryRaw<Array<Record<string, unknown>>>`
      INSERT INTO solar_events (week_start, week_end, was_defended)
      VALUES (${weekStart}, ${weekEnd}, false)
      RETURNING *
    `;
    const newEvent = rows[0];

    revalidatePath("/game");
    return NextResponse.json(newEvent);
  }

  if (body?.action === "mark_defended") {
    const eventId = Number(body?.eventId);
    if (!Number.isFinite(eventId)) {
      return NextResponse.json({ error: "Invalid eventId" }, { status: 400 });
    }

    await prisma.$executeRaw`
      UPDATE solar_events
      SET was_defended = true
      WHERE id = ${eventId}
    `;

    revalidatePath("/game");
    return NextResponse.json({ success: true });
  }

  if (body?.action === "launch_probe") {
    const eventId = Number(body?.eventId);
    const count = Number(body?.count ?? 1);
    if (!Number.isFinite(eventId) || !Number.isFinite(count) || count <= 0) {
      return NextResponse.json({ error: "Invalid launch payload" }, { status: 400 });
    }

    await prisma.$executeRaw`
      INSERT INTO defensive_probes (event_id, user_id, count)
      VALUES (${eventId}, ${user.id}, ${count})
    `;

    revalidatePath("/game");
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
}
