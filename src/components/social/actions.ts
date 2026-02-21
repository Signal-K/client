"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/server/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/ssr";

type VoteType = "up" | "down";

export async function toggleVoteAction(input: {
  classificationId: number;
  voteType: VoteType;
}) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false as const, error: "Not signed in" };
  }

  const { classificationId, voteType } = input;
  const existingVoteRows = await prisma.$queryRaw<Array<{ id: number; vote_type: VoteType }>>`
    SELECT id, vote_type
    FROM votes
    WHERE user_id = ${user.id}
      AND classification_id = ${classificationId}
    LIMIT 1
  `;
  const existingVote = existingVoteRows[0];

  if (existingVote) {
    if (existingVote.vote_type === voteType) {
      await prisma.$executeRaw`
        DELETE FROM votes
        WHERE id = ${existingVote.id}
      `;
      revalidatePath(`/posts/${classificationId}`);
      return { ok: true as const, userVote: null as VoteType | null };
    }

    await prisma.$executeRaw`
      UPDATE votes
      SET vote_type = ${voteType}
      WHERE id = ${existingVote.id}
    `;
    revalidatePath(`/posts/${classificationId}`);
    return { ok: true as const, userVote: voteType as VoteType };
  }

  await prisma.$executeRaw`
    INSERT INTO votes (user_id, classification_id, vote_type)
    VALUES (${user.id}, ${classificationId}, ${voteType})
  `;

  revalidatePath(`/posts/${classificationId}`);
  return { ok: true as const, userVote: voteType as VoteType };
}

export async function submitCommentAction(input: {
  classificationId: number;
  content: string;
  parentCommentId?: number;
}) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false as const, error: "Not signed in" };
  }

  const { classificationId, content, parentCommentId } = input;
  const trimmed = content.trim();
  if (!trimmed) {
    return { ok: false as const, error: "Empty comment" };
  }

  await prisma.$executeRaw`
    INSERT INTO comments (content, author, classification_id, parent_comment_id)
    VALUES (${trimmed}, ${user.id}, ${classificationId}, ${parentCommentId || null})
  `;

  revalidatePath(`/posts/${classificationId}`);
  return { ok: true as const };
}
