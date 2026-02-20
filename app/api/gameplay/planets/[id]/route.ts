import { NextRequest, NextResponse } from "next/server";

import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/server/prisma";

export const dynamic = "force-dynamic";

type PlanetClassificationRow = Record<string, unknown> & {
  id: number;
  anomaly: number | null;
  anomaly_data: Record<string, unknown> | null;
  classificationConfiguration?: unknown;
  media?: unknown;
};

type VoteCountRow = {
  classification_id: number;
  count: bigint | number;
};

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Invalid classification ID" }, { status: 400 });
  }

  const classificationRows = await prisma.$queryRaw<PlanetClassificationRow[]>`
    SELECT
      c.*,
      json_build_object(
        'id', a.id,
        'content', a.content,
        'anomalytype', a.anomalytype,
        'mass', a.mass,
        'radius', a.radius,
        'density', a.density,
        'gravity', a.gravity,
        'temperature', a.temperature,
        'orbital_period', a.orbital_period,
        'avatar_url', a.avatar_url,
        'created_at', a.created_at
      ) AS anomaly_data
    FROM classifications c
    LEFT JOIN anomalies a ON a.id = c.anomaly
    WHERE c.id = ${id}
    LIMIT 1
  `;
  const classification = classificationRows[0];
  if (!classification) {
    return NextResponse.json({ error: "Classification not found" }, { status: 404 });
  }

  const parentPlanetLocation = Number(classification?.anomaly);
  let relatedRows: PlanetClassificationRow[] = [];
  if (Number.isFinite(parentPlanetLocation)) {
    relatedRows = await prisma.$queryRaw<PlanetClassificationRow[]>(Prisma.sql`
      SELECT
        c.*,
        json_build_object(
          'id', a.id,
          'content', a.content,
          'anomalytype', a.anomalytype,
          'mass', a.mass,
          'radius', a.radius,
          'density', a.density,
          'gravity', a.gravity,
          'temperature', a.temperature,
          'orbital_period', a.orbital_period,
          'avatar_url', a.avatar_url,
          'created_at', a.created_at
        ) AS anomaly_data
      FROM classifications c
      LEFT JOIN anomalies a ON a.id = c.anomaly
      WHERE (c."classificationConfiguration" ->> 'parentPlanetLocation') = ${String(parentPlanetLocation)}
      ORDER BY c.created_at DESC
      LIMIT 500
    `);
  }

  const relatedIds = relatedRows.map((row) => row.id);
  let voteCounts = new Map<number, number>();
  if (relatedIds.length > 0) {
    const voteRows = await prisma.$queryRaw<VoteCountRow[]>(Prisma.sql`
      SELECT classification_id, COUNT(*)::bigint AS count
      FROM votes
      WHERE classification_id IN (${Prisma.join(relatedIds)})
      GROUP BY classification_id
    `);
    voteCounts = new Map(voteRows.map((row) => [row.classification_id, Number(row.count)]));
  }

  const normalize = (row: PlanetClassificationRow) => ({
    ...row,
    anomaly: row.anomaly_data,
    votes: voteCounts.get(row.id) ?? 0,
  });

  return NextResponse.json({
    classification: normalize(classification),
    relatedClassifications: relatedRows.map(normalize),
  });
}
