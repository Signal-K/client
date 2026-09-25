// Client stubs for the former server actions (SSC-31). Implementations live in
// src/server/actions/social-actions.ts and run behind /api/actions/[name].
import { callAction } from "@/lib/actions/callAction";
import type * as impl from "@/src/server/actions/social-actions";

export const toggleVoteAction = (...args: Parameters<typeof impl.toggleVoteAction>) =>
  callAction<Awaited<ReturnType<typeof impl.toggleVoteAction>>>("toggleVoteAction", args);

export const submitCommentAction = (...args: Parameters<typeof impl.submitCommentAction>) =>
  callAction<Awaited<ReturnType<typeof impl.submitCommentAction>>>("submitCommentAction", args);
