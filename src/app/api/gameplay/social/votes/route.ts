import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/server/prisma";
import { getRouteUser } from "@/lib/server/supabaseRoute";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const classificationId = Number(request.nextUrl.searchParams.get("classificationId"));
  if (!Number.isFinite(classificationId)) {
    return NextResponse.json({ error: "classificationId is required" }, { status: 400 });
  }

  const { user } = await getRouteUser();
  const rows = await prisma.$queryRaw<Array<{ vote_type: "up" | "down"; user_id: string }>>`
    SELECT vote_type, user_id
    FROM votes
    WHERE classification_id = ${classificationId}
  `;
  const upvotes = rows.filter((v: any) => v.vote_type === "up").length;
  const downvotes = rows.filter((v: any) => v.vote_type === "down").length;

  let userVote: "up" | "down" | null = null;
  if (user?.id) {
    const mine = rows.find((v: any) => v.user_id === user.id);
    userVote = (mine?.vote_type as "up" | "down" | undefined) || null;
  }

  return NextResponse.json({
    voteTotal: upvotes - downvotes,
    userVote,
    upvotes,
    downvotes,
  });
}

type VoteBody = {
  classificationId?: number | string;
  anomalyId?: number | string | null;
  voteType?: "up" | "down";
};

export async function POST(request: NextRequest) {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as VoteBody;
  const classificationId = Number(body?.classificationId);
  const voteType = body?.voteType === "down" ? "down" : "up";

  if (!Number.isFinite(classificationId)) {
    return NextResponse.json({ error: "Invalid classificationId" }, { status: 400 });
  }

  const existingVoteRows = await prisma.$queryRaw<Array<{ id: number }>>`
    SELECT id
    FROM votes
    WHERE classification_id = ${classificationId}
      AND user_id = ${user.id}
    LIMIT 1
  `;
  const existingVote = existingVoteRows[0];

  if (existingVote?.id) {
    return NextResponse.json({ success: true, alreadyVoted: true });
  }

  const insertPayload: Record<string, unknown> = {
    user_id: user.id,
    classification_id: classificationId,
    vote_type: voteType,
  };

  if (body?.anomalyId !== undefined && body?.anomalyId !== null) {
    insertPayload.anomaly_id = body.anomalyId;
  }

  await prisma.$executeRaw`
    INSERT INTO votes (user_id, classification_id, vote_type, anomaly_id)
    VALUES (
      ${insertPayload.user_id as string},
      ${insertPayload.classification_id as number},
      ${insertPayload.vote_type as "up" | "down"},
      ${(insertPayload.anomaly_id as number | string | undefined) ?? null}
    )
  `;

  revalidatePath(`/posts/${classificationId}`);

  return NextResponse.json({ success: true, alreadyVoted: false });
}
