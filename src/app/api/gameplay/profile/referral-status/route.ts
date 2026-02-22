import { NextResponse } from "next/server";

import { prisma } from "@/lib/server/prisma";
import { getRouteUser } from "@/lib/server/supabaseRoute";

export const dynamic = "force-dynamic";

export async function GET() {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return NextResponse.json({ authenticated: false, hasReferral: false }, { status: 200 });
  }

  const data = await prisma.$queryRaw<Array<{ id: number }>>`
    SELECT id FROM referrals WHERE referree_id = ${user.id} LIMIT 1
  `;

  return NextResponse.json({ authenticated: true, hasReferral: data.length > 0 });
}
