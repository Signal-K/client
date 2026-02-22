import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/server/prisma";
import { getRouteUser } from "@/lib/server/supabaseRoute";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const missionParam = Number(request.nextUrl.searchParams.get("mission"));
  if (!Number.isFinite(missionParam)) {
    return NextResponse.json({ error: "mission is required" }, { status: 400 });
  }

  const rows = await prisma.$queryRaw<Array<{ id: number }>>`
    SELECT id
    FROM missions
    WHERE "user" = ${user.id}
      AND mission = ${missionParam}
    LIMIT 1
  `;

  return NextResponse.json({ exists: rows.length > 0 });
}

