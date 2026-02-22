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

  const classificationtype = request.nextUrl.searchParams.get("classificationtype");
  const createdAtGte = request.nextUrl.searchParams.get("createdAtGte");
  const createdAtLt = request.nextUrl.searchParams.get("createdAtLt");

  const conditions: Prisma.Sql[] = [Prisma.sql`author = ${user.id}`];
  if (classificationtype) {
    conditions.push(Prisma.sql`classificationtype = ${classificationtype}`);
  }
  if (createdAtGte) {
    conditions.push(Prisma.sql`created_at >= ${createdAtGte}`);
  }
  if (createdAtLt) {
    conditions.push(Prisma.sql`created_at < ${createdAtLt}`);
  }

  const rows = await prisma.$queryRaw<Array<{ count: bigint | number }>>(Prisma.sql`
    SELECT COUNT(*)::bigint AS count
    FROM classifications
    WHERE ${Prisma.join(conditions, " AND ")}
  `);

  return NextResponse.json({ count: Number(rows[0]?.count ?? 0) });
}
