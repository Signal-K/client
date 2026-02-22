import { NextResponse } from "next/server";

import { prisma } from "@/lib/server/prisma";
import { getRouteUser } from "@/lib/server/supabaseRoute";

export const dynamic = "force-dynamic";

export async function GET() {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return NextResponse.json({ referralCode: null }, { status: 200 });
  }

  const rows = await prisma.$queryRaw<Array<{ referral_code: string | null }>>`
    SELECT referral_code FROM profiles WHERE id::text = ${user.id} LIMIT 1
  `;

  return NextResponse.json({ referralCode: rows[0]?.referral_code ?? null });
}
