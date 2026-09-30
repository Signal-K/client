// Client stubs for the former server actions (SSC-31). Implementations live in
// src/server/actions/classification-actions.ts and run behind /api/actions/[name].
import { callAction } from "@/lib/actions/callAction";
import type * as impl from "@/src/server/actions/classification-actions";
export type { CreateClassificationInput } from "@/src/server/actions/classification-actions";

export const createClassificationAction = (...args: Parameters<typeof impl.createClassificationAction>) =>
  callAction<Awaited<ReturnType<typeof impl.createClassificationAction>>>("createClassificationAction", args);
