import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/server/prisma";
import { getRouteUser } from "@/lib/server/supabaseRoute";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const classificationIdParam = request.nextUrl.searchParams.get("classificationId");
  const classificationId = classificationIdParam ? Number(classificationIdParam) : null;
  if (classificationIdParam && !Number.isFinite(classificationId)) {
    return NextResponse.json({ error: "Invalid classificationId" }, { status: 400 });
  }

  const [classifications, comments] = await Promise.all([
    classificationId
      ? prisma.$queryRaw<Array<Record<string, unknown>>>`
          SELECT *
          FROM classifications
          WHERE id = ${classificationId}
        `
      : prisma.$queryRaw<Array<Record<string, unknown>>>`
          SELECT *
          FROM classifications
          WHERE classificationtype = 'planet'
        `,
    classificationId
      ? prisma.$queryRaw<Array<Record<string, unknown>>>`
          SELECT
            c.id,
            c.content,
            c.configuration,
            c.classification_id,
            json_build_object(
              'id', p.id,
              'full_name', p.full_name,
              'avatar_url', p.avatar_url
            ) AS author
          FROM comments c
          LEFT JOIN profiles p ON p.id = c.author
          WHERE c.classification_id = ${classificationId}
        `
      : prisma.$queryRaw<Array<Record<string, unknown>>>`
          SELECT
            c.id,
            c.content,
            c.configuration,
            c.classification_id,
            json_build_object(
              'id', p.id,
              'full_name', p.full_name,
              'avatar_url', p.avatar_url
            ) AS author
          FROM comments c
          LEFT JOIN profiles p ON p.id = c.author
        `,
  ]);

  return NextResponse.json({ classifications, comments });
}
