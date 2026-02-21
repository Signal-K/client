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

  const idsParam = request.nextUrl.searchParams.get("classificationIds");
  const category = request.nextUrl.searchParams.get("category");
  const limit = Number(request.nextUrl.searchParams.get("limit") || 2000);
  const ids = (idsParam || "")
    .split(",")
    .map((x) => Number(x.trim()))
    .filter((x) => Number.isFinite(x));

  const commentWhere: Prisma.Sql[] = [Prisma.sql`author = ${user.id}`];
  const voteWhere: Prisma.Sql[] = [Prisma.sql`user_id = ${user.id}`];

  if (ids.length > 0) {
    commentWhere.push(Prisma.sql`classification_id IN (${Prisma.join(ids)})`);
    voteWhere.push(Prisma.sql`classification_id IN (${Prisma.join(ids)})`);
  }
  if (category) {
    commentWhere.push(Prisma.sql`category = ${category}`);
  }

  const [comments, votes] = await Promise.all([
    prisma.$queryRaw<Array<Record<string, unknown>>>(Prisma.sql`
      SELECT *
      FROM comments
      WHERE ${Prisma.join(commentWhere, " AND ")}
      ORDER BY created_at DESC
      LIMIT ${Math.max(1, Math.min(limit, 5000))}
    `),
    prisma.$queryRaw<Array<Record<string, unknown>>>(Prisma.sql`
      SELECT *
      FROM votes
      WHERE ${Prisma.join(voteWhere, " AND ")}
      ORDER BY id DESC
      LIMIT ${Math.max(1, Math.min(limit, 5000))}
    `),
  ]);

  return NextResponse.json({ comments, votes });
}

