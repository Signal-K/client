import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { createPocketbaseAdminClient } from "@/lib/pocketbase/adminClient";
import { getRouteUser } from "@/lib/server/routeAuth";

export const dynamic = "force-dynamic";

type PreferredBody = {
  classificationId?: number | string;
  commentId?: number | string;
};

export async function POST(request: NextRequest) {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as PreferredBody;
  const classificationId = Number(body?.classificationId);
  const commentId = Number(body?.commentId);

  if (!Number.isFinite(classificationId) || !Number.isFinite(commentId)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const pb = await createPocketbaseAdminClient();
  const classification = await pb
    .collection("ss_classifications")
    .getFirstListItem(pb.filter("legacyId = {:id}", { id: classificationId }), {
      fields: "id,legacyId,author,classificationConfiguration",
    })
    .catch(() => null);

  if (!classification) {
    return NextResponse.json({ error: "Classification not found" }, { status: 404 });
  }

  if (classification.author !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const comment = await pb
    .collection("ss_comments")
    .getFirstListItem(
      pb.filter("legacyId = {:id} && classificationId = {:classificationId}", {
        id: commentId,
        classificationId,
      }),
      { fields: "id,legacyId,classificationId,configuration" }
    )
    .catch(() => null);

  if (!comment) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
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

  await pb.collection("ss_classifications").update(classification.id, {
    classificationConfiguration: updatedClassificationConfig,
  });

  const updatedCommentConfig = {
    ...(comment.configuration || {}),
    preferred: true,
  };

  await pb.collection("ss_comments").update(comment.id, { configuration: updatedCommentConfig });

  revalidatePath(`/planets/${classificationId}`);
  revalidatePath(`/posts/${classificationId}`);

  return NextResponse.json({ success: true });
}
