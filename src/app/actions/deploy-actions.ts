// Client stubs for the former server actions (SSC-31). Implementations live in
// src/server/actions/deploy-actions.ts and run behind /api/actions/[name].
import { callAction } from "@/lib/actions/callAction";
import type * as impl from "@/src/server/actions/deploy-actions";
export type { DeploymentType } from "@/src/server/actions/deploy-actions";

export const getTelescopeStatus = (...args: Parameters<typeof impl.getTelescopeStatus>) =>
  callAction<Awaited<ReturnType<typeof impl.getTelescopeStatus>>>("getTelescopeStatus", args);

export const getTelescopeAnomalies = (...args: Parameters<typeof impl.getTelescopeAnomalies>) =>
  callAction<Awaited<ReturnType<typeof impl.getTelescopeAnomalies>>>("getTelescopeAnomalies", args);

export const getTelescopeSkillProgress = (...args: Parameters<typeof impl.getTelescopeSkillProgress>) =>
  callAction<Awaited<ReturnType<typeof impl.getTelescopeSkillProgress>>>("getTelescopeSkillProgress", args);

export const deployTelescopeAction = (...args: Parameters<typeof impl.deployTelescopeAction>) =>
  callAction<Awaited<ReturnType<typeof impl.deployTelescopeAction>>>("deployTelescopeAction", args);

export const getLinkedAnomaly = (...args: Parameters<typeof impl.getLinkedAnomaly>) =>
  callAction<Awaited<ReturnType<typeof impl.getLinkedAnomaly>>>("getLinkedAnomaly", args);

export const updateLinkedAnomalyAction = (...args: Parameters<typeof impl.updateLinkedAnomalyAction>) =>
  callAction<Awaited<ReturnType<typeof impl.updateLinkedAnomalyAction>>>("updateLinkedAnomalyAction", args);
