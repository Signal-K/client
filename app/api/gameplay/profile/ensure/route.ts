import { NextResponse } from "next/server";

import { prisma } from "@/lib/server/prisma";
import { getRouteUser } from "@/lib/server/supabaseRoute";

export const dynamic = "force-dynamic";

export async function POST() {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.$queryRaw<Array<{ id: string }>>`
    SELECT id FROM profiles WHERE id = ${user.id} LIMIT 1
  `;

  if (existing.length === 0) {
    await prisma.$executeRaw`
      INSERT INTO profiles (id) VALUES (${user.id})
    `;
  }

  return NextResponse.json({ success: true });
}
