import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { getRouteSupabaseWithUser } from "@/lib/server/supabaseRoute";

export const dynamic = "force-dynamic";

type PreferredBody = {
  classificationId?: number | string;
  commentId?: number | string;
};

export async function POST(request: NextRequest) {
  const { supabase, user, authError } = await getRouteSupabaseWithUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as PreferredBody;
  const classificationId = Number(body?.classificationId);
  const commentId = Number(body?.commentId);

  if (!Number.isFinite(classificationId) || !Number.isFinite(commentId)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { data: classification, error: classificationError } = await supabase
    .from("classifications")
    .select("id, author, classificationConfiguration")
    .eq("id", classificationId)
    .single();

  if (classificationError || !classification) {
    return NextResponse.json({ error: classificationError?.message || "Classification not found" }, { status: 404 });
  }

  if (classification.author !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: comment, error: commentError } = await supabase
    .from("comments")
    .select("id, classification_id, configuration")
    .eq("id", commentId)
    .eq("classification_id", classificationId)
    .single();

  if (commentError || !comment) {
    return NextResponse.json({ error: commentError?.message || "Comment not found" }, { status: 404 });
  }

  const planetType = comment.configuration?.planetType;
  if (!planetType) {
    return NextResponse.json({ error: "Comment has no planetType" }, { status: 400 });
  }

  const currentConfig = (classification.classificationConfiguration as Record<string, any>) || {};
  const currentOptions = (currentConfig.classificationOptions as Record<string, any>) || {};
  const existingPlanetTypes = Array.isArray(currentOptions.planetType) ? currentOptions.planetType : [];

  const updatedClassificationConfig = {
    ...currentConfig,
    classificationOptions: {
      ...currentOptions,
      planetType: [...existingPlanetTypes, planetType],
    },
  };

  const { error: updateClassificationError } = await supabase
    .from("classifications")
    .update({ classificationConfiguration: updatedClassificationConfig })
    .eq("id", classificationId);

  if (updateClassificationError) {
    return NextResponse.json({ error: updateClassificationError.message }, { status: 500 });
  }

  const updatedCommentConfig = {
    ...(comment.configuration || {}),
    preferred: true,
  };

  const { error: updateCommentError } = await supabase
    .from("comments")
    .update({ configuration: updatedCommentConfig })
    .eq("id", commentId);

  if (updateCommentError) {
    return NextResponse.json({ error: updateCommentError.message }, { status: 500 });
  }

  revalidatePath(`/planets/${classificationId}`);
  revalidatePath(`/posts/${classificationId}`);

  return NextResponse.json({ success: true });
}
