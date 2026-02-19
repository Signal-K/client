import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { getRouteSupabaseWithUser } from "@/lib/server/supabaseRoute";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const classificationId = Number(request.nextUrl.searchParams.get("classificationId"));
  if (!Number.isFinite(classificationId)) {
    return NextResponse.json({ error: "classificationId is required" }, { status: 400 });
  }

  const { supabase, user } = await getRouteSupabaseWithUser();
  const { data: votes, error } = await supabase
    .from("votes")
    .select("vote_type, user_id")
    .eq("classification_id", classificationId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = votes || [];
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
  const { supabase, user, authError } = await getRouteSupabaseWithUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as VoteBody;
  const classificationId = Number(body?.classificationId);
  const voteType = body?.voteType === "down" ? "down" : "up";

  if (!Number.isFinite(classificationId)) {
    return NextResponse.json({ error: "Invalid classificationId" }, { status: 400 });
  }

  const { data: existingVote, error: existingVoteError } = await supabase
    .from("votes")
    .select("id")
    .eq("classification_id", classificationId)
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (existingVoteError) {
    return NextResponse.json({ error: existingVoteError.message }, { status: 500 });
  }

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

  const { error } = await supabase.from("votes").insert([insertPayload]);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath(`/posts/${classificationId}`);

  return NextResponse.json({ success: true, alreadyVoted: false });
}
