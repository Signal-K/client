import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/server/prisma";
import { getRouteUser } from "@/lib/server/supabaseRoute";

export const dynamic = "force-dynamic";

type CreateClassificationPayload = {
  anomaly?: number | string | null;
  classificationtype?: string;
  content?: string | null;
  media?: any;
  classificationConfiguration?: any;
  classificationParent?: number | string | null;
};

export async function GET(request: NextRequest) {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const idParam = request.nextUrl.searchParams.get("id");
  const idsParam = request.nextUrl.searchParams.get("ids");
  const author = request.nextUrl.searchParams.get("author");
  const classificationtype = request.nextUrl.searchParams.get("classificationtype");
  const anomalyParam = request.nextUrl.searchParams.get("anomaly");
  const anomaliesParam = request.nextUrl.searchParams.get("anomalies");
  const classificationParentParam = request.nextUrl.searchParams.get("classificationParent");
  const orderByParam = request.nextUrl.searchParams.get("orderBy");
  const ascending = request.nextUrl.searchParams.get("ascending") === "true";
  const includeAnomaly = request.nextUrl.searchParams.get("includeAnomaly") === "true";
  const limit = Number(request.nextUrl.searchParams.get("limit") || 200);

  const whereClauses: Prisma.Sql[] = [];

  if (idParam) {
    const id = Number(idParam);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }
    whereClauses.push(Prisma.sql`c.id = ${id}`);
  }

  if (idsParam) {
    const ids = idsParam
      .split(",")
      .map((x) => Number(x.trim()))
      .filter((x) => Number.isFinite(x));
    if (ids.length > 0) {
      whereClauses.push(Prisma.sql`c.id IN (${Prisma.join(ids)})`);
    }
  }

  if (author) {
    whereClauses.push(Prisma.sql`c.author = ${author}`);
  }

  if (classificationtype) {
    whereClauses.push(Prisma.sql`c.classificationtype = ${classificationtype}`);
  }

  if (anomalyParam) {
    const anomaly = Number(anomalyParam);
    if (!Number.isFinite(anomaly)) {
      return NextResponse.json({ error: "Invalid anomaly" }, { status: 400 });
    }
    whereClauses.push(Prisma.sql`c.anomaly = ${anomaly}`);
  }

  if (anomaliesParam) {
    const anomalies = anomaliesParam
      .split(",")
      .map((x) => Number(x.trim()))
      .filter((x) => Number.isFinite(x));
    if (anomalies.length > 0) {
      whereClauses.push(Prisma.sql`c.anomaly IN (${Prisma.join(anomalies)})`);
    }
  }

  if (classificationParentParam) {
    const parent = Number(classificationParentParam);
    if (!Number.isFinite(parent)) {
      return NextResponse.json({ error: "Invalid classificationParent" }, { status: 400 });
    }
    whereClauses.push(Prisma.sql`c."classificationParent" = ${parent}`);
  }

  const orderBy =
    orderByParam === "id" || orderByParam === "updated_at" || orderByParam === "created_at"
      ? orderByParam
      : "created_at";
  const orderDirection = ascending ? Prisma.sql`ASC` : Prisma.sql`DESC`;
  const validatedLimit = Math.max(1, Math.min(limit, 2000));

  const baseWhere =
    whereClauses.length > 0 ? Prisma.sql`WHERE ${Prisma.join(whereClauses, " AND ")}` : Prisma.empty;

  if (includeAnomaly) {
    const rows = await prisma.$queryRaw<Array<Record<string, unknown>>>(Prisma.sql`
      SELECT c.*, row_to_json(a.*) AS anomaly
      FROM classifications c
      LEFT JOIN anomalies a ON a.id = c.anomaly
      ${baseWhere}
      ORDER BY c.${Prisma.raw(orderBy)} ${orderDirection}
      LIMIT ${validatedLimit}
    `);
    return NextResponse.json({ classifications: rows });
  }

  const rows = await prisma.$queryRaw<Array<Record<string, unknown>>>(Prisma.sql`
    SELECT c.*
    FROM classifications c
    ${baseWhere}
    ORDER BY c.${Prisma.raw(orderBy)} ${orderDirection}
    LIMIT ${validatedLimit}
  `);
  return NextResponse.json({ classifications: rows });
}

export async function POST(request: NextRequest) {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as CreateClassificationPayload;

  const anomaly = body?.anomaly == null ? null : Number(body.anomaly);
  const classificationtype =
    typeof body?.classificationtype === "string" ? body.classificationtype.trim() : "";

  if (!Number.isFinite(anomaly) || !classificationtype) {
    return NextResponse.json(
      { error: "Invalid payload: anomaly and classificationtype are required" },
      { status: 400 }
    );
  }

  const insertPayload: Record<string, any> = {
    author: user.id,
    anomaly,
    classificationtype,
    content: typeof body?.content === "string" ? body.content : "",
  };

  if (body?.media !== undefined) {
    insertPayload.media = body.media;
  }
  if (body?.classificationConfiguration !== undefined) {
    insertPayload.classificationConfiguration = body.classificationConfiguration;
  }
  if (body?.classificationParent !== undefined && body?.classificationParent !== null) {
    const parentId = Number(body.classificationParent);
    if (Number.isFinite(parentId)) {
      insertPayload.classificationParent = parentId;
    }
  }

  const rows = await prisma.$queryRaw<Array<Record<string, unknown>>>`
    INSERT INTO classifications (author, anomaly, classificationtype, content, media, "classificationConfiguration", "classificationParent")
    VALUES (
      ${insertPayload.author as string},
      ${insertPayload.anomaly as number},
      ${insertPayload.classificationtype as string},
      ${insertPayload.content as string},
      ${(insertPayload.media ?? null) ? JSON.stringify(insertPayload.media) : null}::jsonb,
      ${(insertPayload.classificationConfiguration ?? null)
        ? JSON.stringify(insertPayload.classificationConfiguration)
        : null}::jsonb,
      ${(insertPayload.classificationParent as number | null | undefined) ?? null}
    )
    RETURNING *
  `;
  const data = rows[0];
  if (!data) return NextResponse.json({ error: "Failed to create classification" }, { status: 500 });

  revalidatePath("/game");
  revalidatePath("/research");
  revalidatePath("/viewports/satellite");
  revalidatePath("/viewports/solar");
  revalidatePath("/viewports/roover");
  revalidatePath(`/next/${String(data.id)}`);

  return NextResponse.json(data);
}
