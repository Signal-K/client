import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/server/prisma";
import { getRouteUser } from "@/lib/server/supabaseRoute";

export const dynamic = "force-dynamic";

type CommentBody = {
  classificationId?: number | string;
  content?: string;
  configuration?: Record<string, unknown>;
};

type CommentRow = {
  id: number;
  classification_id: number;
  author: string;
  content: string;
  created_at: string;
  surveyor?: boolean;
  value?: string | null;
  category?: string | null;
};

export async function GET(request: NextRequest) {
  const classificationId = Number(request.nextUrl.searchParams.get("classificationId"));
  if (!Number.isFinite(classificationId)) {
    return NextResponse.json({ error: "classificationId is required" }, { status: 400 });
  }

  const surveyorParam = request.nextUrl.searchParams.get("surveyor");
  const categoryParam = request.nextUrl.searchParams.get("category");
  const order = request.nextUrl.searchParams.get("order") === "asc" ? "ASC" : "DESC";
  const whereClauses: Prisma.Sql[] = [Prisma.sql`classification_id = ${classificationId}`];

  if (surveyorParam === "true") {
    whereClauses.push(Prisma.sql`surveyor = TRUE`);
  } else if (surveyorParam === "false") {
    whereClauses.push(Prisma.sql`surveyor = FALSE`);
  }
  if (categoryParam) {
    whereClauses.push(Prisma.sql`category = ${categoryParam}`);
  }

  try {
    const rows = await prisma.$queryRaw<CommentRow[]>(Prisma.sql`
      SELECT *
      FROM comments
      WHERE ${Prisma.join(whereClauses, " AND ")}
      ORDER BY created_at ${Prisma.raw(order)}
    `);
    return NextResponse.json({ comments: rows });
  } catch (_error) {
    // Older DBs may not have the surveyor column; retry without surveyor filtering.
    const rows = await prisma.$queryRaw<CommentRow[]>`
      SELECT *
      FROM comments
      WHERE classification_id = ${classificationId}
      ORDER BY created_at ${Prisma.raw(order)}
    `;
    return NextResponse.json({ comments: rows });
  }
}

export async function POST(request: NextRequest) {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as CommentBody;
  const classificationId = Number(body?.classificationId);
  const content = typeof body?.content === "string" ? body.content.trim() : "";

  if (!Number.isFinite(classificationId) || !content) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const insertPayload: Record<string, unknown> = {
    author: user.id,
    classification_id: classificationId,
    content,
  };

  if (body?.configuration && typeof body.configuration === "object") {
    insertPayload.configuration = body.configuration;
  }
  const configurationJson = insertPayload.configuration
    ? JSON.stringify(insertPayload.configuration as Record<string, unknown>)
    : null;

  await prisma.$executeRaw`
    INSERT INTO comments (author, classification_id, content, configuration)
    VALUES (
      ${insertPayload.author as string},
      ${insertPayload.classification_id as number},
      ${insertPayload.content as string},
      ${configurationJson}::jsonb
    )
  `;

  revalidatePath(`/posts/${classificationId}`);
  revalidatePath(`/planets/${classificationId}`);

  return NextResponse.json({ success: true });
}
