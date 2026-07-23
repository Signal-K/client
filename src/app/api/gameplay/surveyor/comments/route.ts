import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { getRouteUser } from "@/lib/server/routeAuth";
import { createPocketbaseAdminClient } from "@/lib/pocketbase/adminClient";

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

  const pb = await createPocketbaseAdminClient();
  const latest = await pb.collection("comments").getList(1, 1, { sort: "-legacyId", fields: "legacyId" });
  const nextLegacyId = (latest.items[0]?.legacyId ?? 0) + 1;

  await pb.collection("comments").create({
    legacyId: nextLegacyId,
    createdAt: new Date().toISOString(),
    content,
    classificationId,
    author: user.id,
    configuration: body?.configuration && typeof body.configuration === "object" ? body.configuration : null,
    surveyor: typeof body?.surveyor === "string" ? body.surveyor : null,
    category: typeof body?.category === "string" ? body.category : null,
    value: typeof body?.value === "string" ? body.value : null,
  });

  revalidatePath(`/planets/${classificationId}`);
  revalidatePath(`/posts/surveyor/${classificationId}`);

  return NextResponse.json({ success: true });
}
