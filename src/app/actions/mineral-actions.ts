// Client stubs for the former server actions (SSC-31). Implementations live in
// src/server/actions/mineral-actions.ts and run behind /api/actions/[name].
import { callAction } from "@/lib/actions/callAction";
import type * as impl from "@/src/server/actions/mineral-actions";
export type { CreateMineralDepositInput } from "@/src/server/actions/mineral-actions";

export const createMineralDepositAction = (...args: Parameters<typeof impl.createMineralDepositAction>) =>
  callAction<Awaited<ReturnType<typeof impl.createMineralDepositAction>>>("createMineralDepositAction", args);

export const getMineralDeposits = (...args: Parameters<typeof impl.getMineralDeposits>) =>
  callAction<Awaited<ReturnType<typeof impl.getMineralDeposits>>>("getMineralDeposits", args);
