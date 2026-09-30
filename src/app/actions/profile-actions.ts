// Client stubs for the former server actions (SSC-31). Implementations live in
// src/server/actions/profile-actions.ts and run behind /api/actions/[name].
import { callAction } from "@/lib/actions/callAction";
import type * as impl from "@/src/server/actions/profile-actions";

export const getCurrentProfileAction = (...args: Parameters<typeof impl.getCurrentProfileAction>) =>
  callAction<Awaited<ReturnType<typeof impl.getCurrentProfileAction>>>("getCurrentProfileAction", args);

export const updateProfileSetupAction = (...args: Parameters<typeof impl.updateProfileSetupAction>) =>
  callAction<Awaited<ReturnType<typeof impl.updateProfileSetupAction>>>("updateProfileSetupAction", args);

export const completeProfileAction = (...args: Parameters<typeof impl.completeProfileAction>) =>
  callAction<Awaited<ReturnType<typeof impl.completeProfileAction>>>("completeProfileAction", args);

export const getReferralPanelDataAction = (...args: Parameters<typeof impl.getReferralPanelDataAction>) =>
  callAction<Awaited<ReturnType<typeof impl.getReferralPanelDataAction>>>("getReferralPanelDataAction", args);

export const submitReferralCodeAction = (...args: Parameters<typeof impl.submitReferralCodeAction>) =>
  callAction<Awaited<ReturnType<typeof impl.submitReferralCodeAction>>>("submitReferralCodeAction", args);
