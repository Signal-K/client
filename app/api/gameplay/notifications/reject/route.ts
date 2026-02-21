import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/server/prisma";
import { getRouteUser } from "@/lib/server/supabaseRoute";

export const dynamic = "force-dynamic";

export async function POST() {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.$queryRaw<Array<{ id: number }>>`
    SELECT id
    FROM notification_rejections
    WHERE profile_id = ${user.id}
    LIMIT 1
  `;
  if (existing.length > 0) {
    return NextResponse.json({ success: true, alreadyExists: true });
  }

  await prisma.$executeRaw`
    INSERT INTO notification_rejections (profile_id)
    VALUES (${user.id})
  `;

  revalidatePath("/game");
  return NextResponse.json({ success: true, alreadyExists: false });
}
