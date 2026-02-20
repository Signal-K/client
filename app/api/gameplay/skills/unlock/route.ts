import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/server/prisma";
import { getRouteUser } from "@/lib/server/supabaseRoute";

export const dynamic = "force-dynamic";

type UnlockBody = {
  skillId?: string;
};

export async function POST(request: NextRequest) {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as UnlockBody;
  const skillId = typeof body?.skillId === "string" ? body.skillId.trim() : "";
  if (!skillId) {
    return NextResponse.json({ error: "Invalid skillId" }, { status: 400 });
  }

  const existingRows = await prisma.$queryRaw<Array<{ id: number }>>`
    SELECT id
    FROM user_skills
    WHERE user_id = ${user.id}
      AND skill_id = ${skillId}
    LIMIT 1
  `;
  const existing = existingRows[0];

  if (existing?.id) {
    return NextResponse.json({ success: true, alreadyUnlocked: true });
  }

  await prisma.$executeRaw`
    INSERT INTO user_skills (user_id, skill_id, unlocked_at)
    VALUES (${user.id}, ${skillId}, ${new Date().toISOString()})
  `;

  revalidatePath("/game");
  revalidatePath("/activity/deploy");

  return NextResponse.json({ success: true, alreadyUnlocked: false });
}
