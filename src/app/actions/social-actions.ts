"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/server/prisma";
import { getRouteUser } from "@/lib/server/supabaseRoute";

type VoteType = "up" | "down";

export async function toggleVoteAction(input: {
  classificationId: number;
  voteType: VoteType;
}) {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return { ok: false as const, error: "Not signed in" };
  }

  const { classificationId, voteType } = input;

  const existingVote = await prisma.vote.findFirst({
    where: { userId: user.id, classificationId },
  });

  if (existingVote) {
    if (existingVote.voteType === voteType) {
      await prisma.vote.delete({ where: { id: existingVote.id } });
      revalidatePath(`/posts/${classificationId}`);
      return { ok: true as const, userVote: null as VoteType | null };
    }

    await prisma.vote.update({
      where: { id: existingVote.id },
      data: { voteType },
    });
    revalidatePath(`/posts/${classificationId}`);
    return { ok: true as const, userVote: voteType as VoteType };
  }

  await prisma.vote.create({
    data: { userId: user.id, classificationId, voteType },
  });

  revalidatePath(`/posts/${classificationId}`);
  return { ok: true as const, userVote: voteType as VoteType };
}

export async function submitCommentAction(input: {
  classificationId: number;
  content: string;
  parentCommentId?: number;
}) {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return { ok: false as const, error: "Not signed in" };
  }

  const { classificationId, content, parentCommentId } = input;
  const trimmed = content.trim();
  if (!trimmed) {
    return { ok: false as const, error: "Empty comment" };
  }

  await prisma.comment.create({
    data: {
      content: trimmed,
      author: user.id,
      classificationId,
      parentCommentId: parentCommentId ?? null,
    },
  });

  revalidatePath(`/posts/${classificationId}`);
  return { ok: true as const };
}
