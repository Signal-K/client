import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/server/prisma";
import { getRouteUser } from "@/lib/server/supabaseRoute";

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

export async function GET(request: NextRequest) {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const anomalyIdParam = request.nextUrl.searchParams.get("anomalyId");
  const classificationIdOnly = request.nextUrl.searchParams.get("classificationIdOnly") === "true";
  const automaton = request.nextUrl.searchParams.get("automaton");
  const dateGte = request.nextUrl.searchParams.get("dateGte");

  if (anomalyIdParam) {
    const anomalyId = Number(anomalyIdParam);
    if (!Number.isFinite(anomalyId)) {
      return NextResponse.json({ error: "Invalid anomalyId" }, { status: 400 });
    }

    const rows = await prisma.$queryRaw<Array<{ id: number; classification_id: number | null }>>`
      SELECT id, classification_id
      FROM linked_anomalies
      WHERE author = ${user.id}
        AND anomaly_id = ${anomalyId}
      ORDER BY id DESC
      LIMIT 1
    `;
    const row = rows[0] ?? null;
    if (classificationIdOnly) {
      return NextResponse.json({ classification_id: row?.classification_id ?? null });
    }
    return NextResponse.json({ linkedAnomaly: row });
  }

  const conditions: Prisma.Sql[] = [Prisma.sql`author = ${user.id}`];
  if (automaton) {
    conditions.push(Prisma.sql`automaton = ${automaton}`);
  }
  if (dateGte) {
    conditions.push(Prisma.sql`date >= ${dateGte}`);
  }

  const rows = await prisma.$queryRaw<Array<Record<string, unknown>>>(Prisma.sql`
    SELECT *
    FROM linked_anomalies
    WHERE ${Prisma.join(conditions, " AND ")}
    ORDER BY id DESC
    LIMIT 500
  `);
  return NextResponse.json({ linkedAnomalies: rows });
}

export async function DELETE(request: NextRequest) {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as DeleteBody;

  const conditions: Prisma.Sql[] = [Prisma.sql`author = ${user.id}`];

  if (body?.linkedAnomalyId !== undefined && body?.linkedAnomalyId !== null) {
    const linkedAnomalyId = Number(body.linkedAnomalyId);
    if (!Number.isFinite(linkedAnomalyId)) {
      return NextResponse.json({ error: "Invalid linkedAnomalyId" }, { status: 400 });
    }
    conditions.push(Prisma.sql`id = ${linkedAnomalyId}`);
  }

  if (body?.anomalyId !== undefined && body?.anomalyId !== null) {
    const anomalyId = Number(body.anomalyId);
    if (!Number.isFinite(anomalyId)) {
      return NextResponse.json({ error: "Invalid anomalyId" }, { status: 400 });
    }
    conditions.push(Prisma.sql`anomaly_id = ${anomalyId}`);
  }

  if (typeof body?.automaton === "string" && body.automaton.trim()) {
    conditions.push(Prisma.sql`automaton = ${body.automaton.trim()}`);
  }

  if (conditions.length < 2) {
    return NextResponse.json({ error: "At least one delete filter is required" }, { status: 400 });
  }

  await prisma.$executeRaw`
    DELETE FROM linked_anomalies
    WHERE ${Prisma.join(conditions, " AND ")}
  `;

  revalidatePath("/activity/deploy");
  revalidatePath("/viewports/satellite");
  revalidatePath("/viewports/roover");

  return NextResponse.json({ success: true });
}

export async function PATCH(request: NextRequest) {
  const { user, authError } = await getRouteUser();
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

  if (Object.prototype.hasOwnProperty.call(updates, "unlocked")) {
    await prisma.$executeRaw`
      UPDATE linked_anomalies
      SET unlocked = ${Boolean(updates.unlocked)}
      WHERE id = ${id}
        AND author = ${user.id}
    `;
  }

  revalidatePath("/viewports/satellite");
  revalidatePath("/viewports/roover");

  return NextResponse.json({ success: true });
}
