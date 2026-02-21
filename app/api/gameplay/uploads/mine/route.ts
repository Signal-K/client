import { NextResponse } from "next/server";

import { prisma } from "@/lib/server/prisma";
import { getRouteUser } from "@/lib/server/supabaseRoute";

export const dynamic = "force-dynamic";

export async function GET() {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const uploads = await prisma.$queryRaw<Array<Record<string, unknown>>>`
    SELECT *
    FROM uploads
    WHERE author = ${user.id}
    ORDER BY created_at DESC
  `;

  return NextResponse.json({ uploads });
}
