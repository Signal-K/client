import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/server/prisma";
import { getRouteUser } from "@/lib/server/supabaseRoute";

export const dynamic = "force-dynamic";

type SurveyorCommentBody = {
  classificationId?: number | string;
  content?: string;
  configuration?: Record<string, unknown>;
  surveyor?: string;
  category?: string;
  value?: string;
};

export async function POST(request: NextRequest) {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as SurveyorCommentBody;
  const classificationId = Number(body?.classificationId);
  const content = typeof body?.content === "string" ? body.content : "";

  if (!Number.isFinite(classificationId) || !content.trim()) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const insertPayload: Record<string, unknown> = {
    content,
    classification_id: classificationId,
    author: user.id,
  };

  if (body?.configuration && typeof body.configuration === "object") {
    insertPayload.configuration = body.configuration;
  }
  if (typeof body?.surveyor === "string") {
    insertPayload.surveyor = body.surveyor;
  }
  if (typeof body?.category === "string") {
    insertPayload.category = body.category;
  }
  if (typeof body?.value === "string") {
    insertPayload.value = body.value;
  }

  const configurationJson = insertPayload.configuration
    ? JSON.stringify(insertPayload.configuration as Record<string, unknown>)
    : null;
  const surveyor = (insertPayload.surveyor as string | undefined) ?? null;
  const category = (insertPayload.category as string | undefined) ?? null;
  const value = (insertPayload.value as string | undefined) ?? null;

  await prisma.$executeRaw`
    INSERT INTO comments (content, classification_id, author, configuration, surveyor, category, value)
    VALUES (
      ${insertPayload.content as string},
      ${insertPayload.classification_id as number},
      ${insertPayload.author as string},
      ${configurationJson}::jsonb,
      ${surveyor},
      ${category},
      ${value}
    )
  `;

  revalidatePath(`/planets/${classificationId}`);
  revalidatePath(`/posts/surveyor/${classificationId}`);

  return NextResponse.json({ success: true });
}
