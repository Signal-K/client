import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { getRouteUser } from "@/lib/server/routeAuth";
import { createPocketbaseAdminClient } from "@/lib/pocketbase/adminClient";
import { mapCommentToRow } from "@/lib/pocketbase/legacyShapes";
import { recursiveSerialize } from "@/utils/serialization";

export const dynamic = "force-dynamic";

type CommentBody = {
  classificationId?: number | string;
  content?: string;
  configuration?: Record<string, unknown>;
};

export async function GET(request: NextRequest) {
  const classificationId = Number(request.nextUrl.searchParams.get("classificationId"));
  if (!Number.isFinite(classificationId)) {
    return NextResponse.json(recursiveSerialize({ error: "classificationId is required" }), { status: 400 });
  }

  const surveyorParam = request.nextUrl.searchParams.get("surveyor");
  const categoryParam = request.nextUrl.searchParams.get("category");
  const ascending = request.nextUrl.searchParams.get("order") === "asc";

  const pb = await createPocketbaseAdminClient();
  const filters = [pb.filter("classificationId = {:id}", { id: classificationId })];
  if (surveyorParam === "true") filters.push("surveyor = true");
  if (surveyorParam === "false") filters.push("surveyor = false");
  if (categoryParam) filters.push(pb.filter("category = {:c}", { c: categoryParam }));

  const rows = await pb.collection("comments").getFullList({
    filter: filters.join(" && "),
    sort: ascending ? "+createdAt" : "-createdAt",
  });

  return NextResponse.json(recursiveSerialize({ comments: rows.map(mapCommentToRow) }));
}

export async function POST(request: NextRequest) {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return NextResponse.json(recursiveSerialize({ error: "Unauthorized" }), { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as CommentBody;
  const classificationId = Number(body?.classificationId);
  const content = typeof body?.content === "string" ? body.content.trim() : "";

  if (!Number.isFinite(classificationId) || !content) {
    return NextResponse.json(recursiveSerialize({ error: "Invalid payload" }), { status: 400 });
  }

  const pb = await createPocketbaseAdminClient();
  const latest = await pb.collection("comments").getList(1, 1, { sort: "-legacyId", fields: "legacyId" });
  const nextLegacyId = (latest.items[0]?.legacyId ?? 0) + 1;

  await pb.collection("comments").create({
    legacyId: nextLegacyId,
    createdAt: new Date().toISOString(),
    author: user.id,
    classificationId,
    content,
    configuration: body?.configuration && typeof body.configuration === "object" ? body.configuration : null,
  });

  revalidatePath(`/posts/${classificationId}`);
  revalidatePath(`/planets/${classificationId}`);

  return NextResponse.json(recursiveSerialize({ success: true }));
}
