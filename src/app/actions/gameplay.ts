// Client stubs for the former server actions (SSC-31). Implementations live in
// src/server/actions/gameplay.ts and run behind /api/actions/[name].
import { callAction } from "@/lib/actions/callAction";
import type * as impl from "@/src/server/actions/gameplay";

export const submitNpsAction = (...args: Parameters<typeof impl.submitNpsAction>) =>
  callAction<Awaited<ReturnType<typeof impl.submitNpsAction>>>("submitNpsAction", args);

export const submitSurveyorCommentAction = (...args: Parameters<typeof impl.submitSurveyorCommentAction>) =>
  callAction<Awaited<ReturnType<typeof impl.submitSurveyorCommentAction>>>("submitSurveyorCommentAction", args);

export const getExtractionDepositAction = (...args: Parameters<typeof impl.getExtractionDepositAction>) =>
  callAction<Awaited<ReturnType<typeof impl.getExtractionDepositAction>>>("getExtractionDepositAction", args);

export const completeExtractionAction = (...args: Parameters<typeof impl.completeExtractionAction>) =>
  callAction<Awaited<ReturnType<typeof impl.completeExtractionAction>>>("completeExtractionAction", args);
