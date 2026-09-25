// Server implementations behind /api/actions/[name] (SSC-31).
//
// These used to be Next.js server actions. The Cloudflare static export cannot
// contain server actions, so client components call the same functions through
// src/lib/actions/callAction.ts, and the route handler dispatches here. Only
// names listed in this map are callable.
import * as classification from "./classification-actions";
import * as deploy from "./deploy-actions";
import * as gameplay from "./gameplay";
import * as mineral from "./mineral-actions";
import * as profile from "./profile-actions";
import * as social from "./social-actions";

type ServerAction = (...args: any[]) => Promise<unknown>;

export const serverActions: Record<string, ServerAction> = {
  createClassificationAction: classification.createClassificationAction,

  getTelescopeStatus: deploy.getTelescopeStatus,
  getTelescopeAnomalies: deploy.getTelescopeAnomalies,
  getTelescopeSkillProgress: deploy.getTelescopeSkillProgress,
  deployTelescopeAction: deploy.deployTelescopeAction,
  getLinkedAnomaly: deploy.getLinkedAnomaly,
  updateLinkedAnomalyAction: deploy.updateLinkedAnomalyAction,

  submitNpsAction: gameplay.submitNpsAction,
  submitSurveyorCommentAction: gameplay.submitSurveyorCommentAction,
  getExtractionDepositAction: gameplay.getExtractionDepositAction,
  completeExtractionAction: gameplay.completeExtractionAction,

  createMineralDepositAction: mineral.createMineralDepositAction,
  getMineralDeposits: mineral.getMineralDeposits,

  getCurrentProfileAction: profile.getCurrentProfileAction,
  updateProfileSetupAction: profile.updateProfileSetupAction,
  completeProfileAction: profile.completeProfileAction,
  getReferralPanelDataAction: profile.getReferralPanelDataAction,
  submitReferralCodeAction: profile.submitReferralCodeAction,

  toggleVoteAction: social.toggleVoteAction,
  submitCommentAction: social.submitCommentAction,
};
