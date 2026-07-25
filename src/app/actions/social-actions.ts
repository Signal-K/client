"use server";

import { revalidatePath } from "next/cache";

import { getRouteUser } from "@/lib/server/routeAuth";
import { createPocketbaseAdminClient } from "@/lib/pocketbase/adminClient";

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
  const pb = await createPocketbaseAdminClient();

  const existingVote = await pb
    .collection("votes")
    .getFirstListItem(
      pb.filter("userId = {:u} && classificationId = {:c}", { u: user.id, c: classificationId })
    )
    .catch(() => null);

  if (existingVote) {
    if (existingVote.voteType === voteType) {
      await pb.collection("votes").delete(existingVote.id);
      revalidatePath(`/posts/${classificationId}`);
      return { ok: true as const, userVote: null as VoteType | null };
    }

    await pb.collection("votes").update(existingVote.id, { voteType });
    revalidatePath(`/posts/${classificationId}`);
    return { ok: true as const, userVote: voteType as VoteType };
  }

  const latest = await pb.collection("votes").getList(1, 1, { sort: "-legacyId", fields: "legacyId" });
  const nextLegacyId = (latest.items[0]?.legacyId ?? 0) + 1;

  await pb.collection("votes").create({
    legacyId: nextLegacyId,
    createdAt: new Date().toISOString(),
    userId: user.id,
    classificationId,
    voteType,
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

  const pb = await createPocketbaseAdminClient();
  const latest = await pb.collection("ss_comments").getList(1, 1, { sort: "-legacyId", fields: "legacyId" });
  const nextLegacyId = (latest.items[0]?.legacyId ?? 0) + 1;

  await pb.collection("ss_comments").create({
    legacyId: nextLegacyId,
    createdAt: new Date().toISOString(),
    content: trimmed,
    author: user.id,
    classificationId,
    parentCommentId: parentCommentId ?? null,
  });

  revalidatePath(`/posts/${classificationId}`);
  return { ok: true as const };
}
