"use server";

import { revalidatePath } from "next/cache";

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
  const { data: existingVote, error: existingError } = await supabase
    .from("votes")
    .select("id, vote_type")
    .eq("user_id", user.id)
    .eq("classification_id", classificationId)
    .maybeSingle();

  if (existingError) {
    return { ok: false as const, error: existingError.message };
  }

  if (existingVote) {
    if (existingVote.vote_type === voteType) {
      const { error } = await supabase.from("votes").delete().eq("id", existingVote.id);
      if (error) {
        return { ok: false as const, error: error.message };
      }
      revalidatePath(`/posts/${classificationId}`);
      return { ok: true as const, userVote: null as VoteType | null };
    }

    const { error } = await supabase.from("votes").update({ vote_type: voteType }).eq("id", existingVote.id);
    if (error) {
      return { ok: false as const, error: error.message };
    }
    revalidatePath(`/posts/${classificationId}`);
    return { ok: true as const, userVote: voteType as VoteType };
  }

  const { error: insertError } = await supabase.from("votes").insert({
    user_id: user.id,
    classification_id: classificationId,
    vote_type: voteType,
  });

  if (insertError) {
    return { ok: false as const, error: insertError.message };
  }

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

  const { error } = await supabase.from("comments").insert({
    content: trimmed,
    author: user.id,
    classification_id: classificationId,
    parent_comment_id: parentCommentId || null,
  });

  if (error) {
    return { ok: false as const, error: error.message };
  }

  revalidatePath(`/posts/${classificationId}`);
  return { ok: true as const };
}

