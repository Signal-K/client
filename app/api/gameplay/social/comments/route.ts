import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { getRouteSupabaseWithUser } from "@/lib/server/supabaseRoute";

export const dynamic = "force-dynamic";

type CommentBody = {
  classificationId?: number | string;
  content?: string;
  configuration?: Record<string, unknown>;
};

export async function POST(request: NextRequest) {
  const { supabase, user, authError } = await getRouteSupabaseWithUser();
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

  const { error } = await supabase.from("comments").insert([insertPayload]);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath(`/posts/${classificationId}`);
  revalidatePath(`/planets/${classificationId}`);

  return NextResponse.json({ success: true });
}
