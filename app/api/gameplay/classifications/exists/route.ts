import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/server/prisma";
import { getRouteUser } from "@/lib/server/supabaseRoute";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const classificationType = request.nextUrl.searchParams.get("classificationtype");
  if (!classificationType) {
    return NextResponse.json({ error: "classificationtype is required" }, { status: 400 });
  }

  const rows = await prisma.$queryRaw<Array<{ id: number }>>`
    SELECT id
    FROM classifications
    WHERE author = ${user.id}
      AND classificationtype = ${classificationType}
    LIMIT 1
  `;

  return NextResponse.json({
    exists: rows.length > 0,
  });
}
