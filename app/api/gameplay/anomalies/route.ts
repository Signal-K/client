import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/server/prisma";
import { getRouteUser } from "@/lib/server/supabaseRoute";

export const dynamic = "force-dynamic";

type AnomalyInput = Record<string, unknown>;

type AnomalyBody = {
  anomalies?: AnomalyInput[];
  anomaly?: AnomalyInput;
};

export async function GET(request: NextRequest) {
  const anomalySet = request.nextUrl.searchParams.get("anomalySet");
  const parentAnomaly = request.nextUrl.searchParams.get("parentAnomaly");
  const id = request.nextUrl.searchParams.get("id");
  const ids = request.nextUrl.searchParams.get("ids");
  const author = request.nextUrl.searchParams.get("author");
  const content = request.nextUrl.searchParams.get("content");
  const limit = Number(request.nextUrl.searchParams.get("limit") || 500);

  const conditions: Prisma.Sql[] = [Prisma.sql`1 = 1`];
  if (anomalySet) {
    conditions.push(Prisma.sql`"anomalySet" = ${anomalySet}`);
  }
  if (parentAnomaly) {
    const value = Number(parentAnomaly);
    if (!Number.isFinite(value)) {
      return NextResponse.json({ error: "Invalid parentAnomaly" }, { status: 400 });
    }
    conditions.push(Prisma.sql`"parentAnomaly" = ${value}`);
  }
  if (id) {
    const value = Number(id);
    if (!Number.isFinite(value)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }
    conditions.push(Prisma.sql`id = ${value}`);
  }
  if (ids) {
    const parsed = ids
      .split(",")
      .map((x) => Number(x.trim()))
      .filter((x) => Number.isFinite(x));
    if (parsed.length > 0) {
      conditions.push(Prisma.sql`id IN (${Prisma.join(parsed)})`);
    }
  }
  if (author) {
    conditions.push(Prisma.sql`author = ${author}`);
  }
  if (content) {
    conditions.push(Prisma.sql`content = ${content}`);
  }

  try {
    const rows = await prisma.$queryRaw<Array<Record<string, unknown>>>(Prisma.sql`
      SELECT *
      FROM anomalies
      WHERE ${Prisma.join(conditions, " AND ")}
      ORDER BY id DESC
      LIMIT ${Math.max(1, Math.min(limit, 2000))}
    `);

    return NextResponse.json({ anomalies: rows });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("Can't reach database server") || message.includes("PrismaClient")) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { user, authError } = await getRouteUser();
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

  try {
    const data = await prisma.$queryRaw<Array<{ id: number; avatar_url: string | null }>>`
      INSERT INTO anomalies
      SELECT *
      FROM jsonb_populate_recordset(NULL::anomalies, ${JSON.stringify(rows)}::jsonb)
      RETURNING id, avatar_url
    `;

    revalidatePath("/game");
    revalidatePath("/viewports/roover");

    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("Can't reach database server") || message.includes("PrismaClient")) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
