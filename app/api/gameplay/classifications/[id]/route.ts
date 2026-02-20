import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/server/prisma";

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Invalid classification ID" }, { status: 400 });
  }

  const rows = await prisma.$queryRaw<Array<Record<string, unknown>>>`
    SELECT *
    FROM classifications
    WHERE id = ${id}
    LIMIT 1
  `;
  const classification = rows[0];
  if (!classification) {
    return NextResponse.json({ error: "Classification not found" }, { status: 404 });
  }

  const sourceId = Number(
    (classification.classificationConfiguration as Record<string, unknown> | undefined)?.source_classification_id
  );
  let sourceMedia: unknown[] = [];
  if (Number.isFinite(sourceId)) {
    const sourceRows = await prisma.$queryRaw<Array<{ media: unknown[] | null }>>`
      SELECT media
      FROM classifications
      WHERE id = ${sourceId}
      LIMIT 1
    `;
    sourceMedia = sourceRows[0]?.media || [];
  }

  return NextResponse.json({ classification, sourceMedia });
}
