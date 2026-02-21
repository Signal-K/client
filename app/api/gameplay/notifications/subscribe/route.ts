import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/server/prisma";
import { getRouteUser } from "@/lib/server/supabaseRoute";

export const dynamic = "force-dynamic";

type SubscribeBody = {
  endpoint?: string;
  auth?: string;
  p256dh?: string;
};

export async function POST(request: NextRequest) {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as SubscribeBody;
  const endpoint = typeof body?.endpoint === "string" ? body.endpoint.trim() : "";
  if (!endpoint) {
    return NextResponse.json({ error: "endpoint is required" }, { status: 400 });
  }

  const auth = typeof body?.auth === "string" ? body.auth : "";
  const p256dh = typeof body?.p256dh === "string" ? body.p256dh : "";

  const existing = await prisma.$queryRaw<Array<{ id: number }>>`
    SELECT id
    FROM push_subscriptions
    WHERE profile_id = ${user.id}
      AND endpoint = ${endpoint}
    LIMIT 1
  `;
  if (existing.length > 0) {
    return NextResponse.json({ success: true, alreadyExists: true });
  }

  await prisma.$executeRaw`
    INSERT INTO push_subscriptions (profile_id, endpoint, auth, p256dh)
    VALUES (${user.id}, ${endpoint}, ${auth}, ${p256dh})
  `;

  revalidatePath("/game");
  return NextResponse.json({ success: true, alreadyExists: false });
}
