import { NextResponse } from "next/server";

import { prisma } from "@/lib/server/prisma";
import { getRouteUser } from "@/lib/server/supabaseRoute";

export const dynamic = "force-dynamic";

export async function GET() {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await prisma.$queryRaw<
    Array<{
      avatar_url: string | null;
      username: string | null;
      full_name: string | null;
      referral_code: string | null;
    }>
  >`
    SELECT avatar_url, username, full_name, referral_code
    FROM profiles
    WHERE id = ${user.id}
    LIMIT 1
  `;

  return NextResponse.json({
    avatar_url: rows[0]?.avatar_url ?? null,
    username: rows[0]?.username ?? null,
    full_name: rows[0]?.full_name ?? null,
    referral_code: rows[0]?.referral_code ?? null,
  });
}
