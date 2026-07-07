import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { getRouteUser } from "@/lib/server/supabaseRoute";
import { createPocketbaseAdminClient } from "@/lib/pocketbase/adminClient";
import { recursiveSerialize } from "@/utils/serialization";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const classificationId = Number(request.nextUrl.searchParams.get("classificationId"));
  if (!Number.isFinite(classificationId)) {
    return NextResponse.json(recursiveSerialize({ error: "classificationId is required" }), { status: 400 });
  }

  const { user } = await getRouteUser();
  const pb = await createPocketbaseAdminClient();
  const rows = await pb.collection("votes").getFullList({
    filter: pb.filter("classificationId = {:id}", { id: classificationId }),
    fields: "voteType,userId",
  });

  const upvotes = rows.filter((v) => v.voteType === "up").length;
  const downvotes = rows.filter((v) => v.voteType === "down").length;

  let userVote: "up" | "down" | null = null;
  if (user?.id) {
    const mine = rows.find((v) => v.userId === user.id);
    userVote = (mine?.voteType as "up" | "down" | undefined) || null;
  }

  return NextResponse.json(recursiveSerialize({
    voteTotal: upvotes - downvotes,
    userVote,
    upvotes,
    downvotes,
  }));
}

type VoteBody = {
  classificationId?: number | string;
  anomalyId?: number | string | null;
  voteType?: "up" | "down";
};

export async function POST(request: NextRequest) {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return NextResponse.json(recursiveSerialize({ error: "Unauthorized" }), { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as VoteBody;
  const classificationId = Number(body?.classificationId);
  const voteType = body?.voteType === "down" ? "down" : "up";

  if (!Number.isFinite(classificationId)) {
    return NextResponse.json(recursiveSerialize({ error: "Invalid classificationId" }), { status: 400 });
  }

  const pb = await createPocketbaseAdminClient();
  const existingVote = await pb
    .collection("votes")
    .getFirstListItem(
      pb.filter("classificationId = {:cid} && userId = {:uid}", { cid: classificationId, uid: user.id })
    )
    .catch(() => null);

  if (existingVote) {
    return NextResponse.json(recursiveSerialize({ success: true, alreadyVoted: true }));
  }

  const latest = await pb.collection("votes").getList(1, 1, { sort: "-legacyId", fields: "legacyId" });
  const nextLegacyId = (latest.items[0]?.legacyId ?? 0) + 1;

  await pb.collection("votes").create({
    legacyId: nextLegacyId,
    createdAt: new Date().toISOString(),
    userId: user.id,
    classificationId,
    voteType,
    anomalyId: body?.anomalyId != null ? Number(body.anomalyId) : null,
  });

  revalidatePath(`/posts/${classificationId}`);

  return NextResponse.json(recursiveSerialize({ success: true, alreadyVoted: false }));
}
