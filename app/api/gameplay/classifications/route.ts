import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { getRouteSupabaseWithUser } from "@/lib/server/supabaseRoute";

export const dynamic = "force-dynamic";

type CreateClassificationPayload = {
  anomaly?: number | string | null;
  classificationtype?: string;
  content?: string | null;
  media?: any;
  classificationConfiguration?: any;
  classificationParent?: number | string | null;
};

export async function POST(request: NextRequest) {
  const { supabase, user, authError } = await getRouteSupabaseWithUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as CreateClassificationPayload;

  const anomaly = body?.anomaly == null ? null : Number(body.anomaly);
  const classificationtype =
    typeof body?.classificationtype === "string" ? body.classificationtype.trim() : "";

  if (!Number.isFinite(anomaly) || !classificationtype) {
    return NextResponse.json(
      { error: "Invalid payload: anomaly and classificationtype are required" },
      { status: 400 }
    );
  }

  const insertPayload: Record<string, any> = {
    author: user.id,
    anomaly,
    classificationtype,
    content: typeof body?.content === "string" ? body.content : "",
  };

  if (body?.media !== undefined) {
    insertPayload.media = body.media;
  }
  if (body?.classificationConfiguration !== undefined) {
    insertPayload.classificationConfiguration = body.classificationConfiguration;
  }
  if (body?.classificationParent !== undefined && body?.classificationParent !== null) {
    const parentId = Number(body.classificationParent);
    if (Number.isFinite(parentId)) {
      insertPayload.classificationParent = parentId;
    }
  }

  const { data, error } = await supabase
    .from("classifications")
    .insert(insertPayload)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath("/game");
  revalidatePath("/research");
  revalidatePath("/viewports/satellite");
  revalidatePath("/viewports/solar");
  revalidatePath("/viewports/roover");
  revalidatePath(`/next/${data.id}`);

  return NextResponse.json(data);
}
