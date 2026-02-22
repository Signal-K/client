import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/server/prisma";
import { getRouteUser } from "@/lib/server/supabaseRoute";

export const dynamic = "force-dynamic";

type Body = {
  username?: string;
  fullName?: string;
  avatarUrl?: string;
};

export async function POST(request: NextRequest) {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as Body;
  const username = String(body?.username || "").trim();
  const fullName = String(body?.fullName || "").trim();
  const avatarUrl = String(body?.avatarUrl || "").trim();

  if (username.length < 3) {
    return NextResponse.json({ error: "Username must be at least 3 characters" }, { status: 400 });
  }
  if (!fullName) {
    return NextResponse.json({ error: "fullName is required" }, { status: 400 });
  }

  await prisma.$executeRaw`
    INSERT INTO profiles (id, username, full_name, avatar_url, updated_at)
    VALUES (${user.id}::uuid, ${username}, ${fullName}, ${avatarUrl || null}, NOW())
    ON CONFLICT (id)
    DO UPDATE SET
      username = EXCLUDED.username,
      full_name = EXCLUDED.full_name,
      avatar_url = EXCLUDED.avatar_url,
      updated_at = EXCLUDED.updated_at
  `;

  const rows = await prisma.$queryRaw<
    Array<{ id: string; username: string | null; full_name: string | null; avatar_url: string | null }>
  >`
    SELECT id::text AS id, username, full_name, avatar_url
    FROM profiles
    WHERE id::text = ${user.id}
    LIMIT 1
  `;

  return NextResponse.json({ ok: true, profile: rows[0] ?? null });
}
