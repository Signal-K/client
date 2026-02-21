import { NextRequest, NextResponse } from "next/server";

import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/server/prisma";
import { getRouteUser } from "@/lib/server/supabaseRoute";

export const dynamic = "force-dynamic";

type ClassificationRow = Record<string, unknown> & {
  id: number;
  anomaly: number | null;
  media: unknown;
  anomaly_content: string | null;
  classificationConfiguration?: Record<string, unknown> | string | null;
};

function parseConfig(raw: unknown): Record<string, unknown> | null {
  if (!raw) return null;
  if (typeof raw === "object") return raw as Record<string, unknown>;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
  return null;
}

export async function GET(request: NextRequest) {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const showAllUsers = request.nextUrl.searchParams.get("showAllUsers") === "true";

  const whereClauses: Prisma.Sql[] = [
    Prisma.sql`c.classificationtype IN ('planet', 'telescope-minorPlanet')`,
  ];
  if (!showAllUsers) {
    whereClauses.push(Prisma.sql`c.author = ${user.id}`);
  }

  const locations = await prisma.$queryRaw<ClassificationRow[]>`
    SELECT c.*, a.content AS anomaly_content
    FROM classifications c
    LEFT JOIN anomalies a ON a.id = c.anomaly
    WHERE ${Prisma.join(whereClauses, " AND ")}
    ORDER BY c.created_at DESC
    LIMIT 250
  `;

  const anomalyIds = Array.from(
    new Set(
      locations
        .map((row) => row.anomaly)
        .filter((value): value is number => Number.isFinite(Number(value)))
        .map((value) => Number(value))
    )
  );

  let relatedClassifications: Array<Record<string, unknown>> = [];
  if (anomalyIds.length > 0) {
    relatedClassifications = await prisma.$queryRaw<Array<Record<string, unknown>>>`
      SELECT *
      FROM classifications c
      WHERE c.author = ${user.id}
        AND (c."classificationConfiguration" ->> 'parentPlanetLocation') IN (${Prisma.join(
          anomalyIds.map((id) => Prisma.sql`${String(id)}`)
        )})
    `;
  }

  const relatedByParent = new Map<number, Array<Record<string, unknown>>>();
  for (const row of relatedClassifications) {
    const config = parseConfig(row.classificationConfiguration);
    const parent = Number(config?.parentPlanetLocation);
    if (!Number.isFinite(parent)) continue;
    const existing = relatedByParent.get(parent) || [];
    existing.push(row);
    relatedByParent.set(parent, existing);
  }

  const payload = locations.map((row) => ({
    ...row,
    anomalyContent: row.anomaly_content,
    relatedClassifications: row.anomaly ? relatedByParent.get(Number(row.anomaly)) || [] : [],
  }));

  return NextResponse.json({ locations: payload });
}
