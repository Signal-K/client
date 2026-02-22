import { NextRequest, NextResponse } from "next/server";

import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/server/prisma";
import { getRouteUser } from "@/lib/server/supabaseRoute";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const anomalyParam = request.nextUrl.searchParams.get("anomaly");
  const itemParam = request.nextUrl.searchParams.get("item");
  const limit = Number(request.nextUrl.searchParams.get("limit") || 500);

  const conditions: Prisma.Sql[] = [Prisma.sql`owner = ${user.id}`];

  if (anomalyParam) {
    const anomaly = Number(anomalyParam);
    if (!Number.isFinite(anomaly)) {
      return NextResponse.json({ error: "Invalid anomaly" }, { status: 400 });
    }
    conditions.push(Prisma.sql`anomaly = ${anomaly}`);
  }

  if (itemParam) {
    const item = Number(itemParam);
    if (!Number.isFinite(item)) {
      return NextResponse.json({ error: "Invalid item" }, { status: 400 });
    }
    conditions.push(Prisma.sql`item = ${item}`);
  }

  const rows = await prisma.$queryRaw<Array<Record<string, unknown>>>(Prisma.sql`
    SELECT *
    FROM inventory
    WHERE ${Prisma.join(conditions, " AND ")}
    ORDER BY id DESC
    LIMIT ${Math.max(1, Math.min(limit, 2000))}
  `);

  return NextResponse.json({ inventory: rows });
}

