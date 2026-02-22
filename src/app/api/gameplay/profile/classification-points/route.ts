import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/server/prisma";
import { getRouteUser } from "@/lib/server/supabaseRoute";

export const dynamic = "force-dynamic";

type IncrementBody = {
  amount?: number;
};

export async function POST(request: NextRequest) {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as IncrementBody;
  const amount = Number(body?.amount ?? 1);
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  const rows = await prisma.$queryRaw<Array<{ id: string; classificationPoints: number | null }>>`
    SELECT id, "classificationPoints"
    FROM profiles
    WHERE id::text = ${user.id}
    LIMIT 1
  `;
  const profile = rows[0];

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const nextPoints = (profile.classificationPoints || 0) + amount;
  await prisma.$executeRaw`
    UPDATE profiles
    SET "classificationPoints" = ${nextPoints}
    WHERE id::text = ${user.id}
  `;

  revalidatePath("/game");
  revalidatePath("/profile");

  return NextResponse.json({ success: true, classificationPoints: nextPoints });
}
