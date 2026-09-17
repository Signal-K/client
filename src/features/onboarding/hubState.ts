import type { GardenState } from "@/src/features/garden/gardenLogic";

export const PROJECT_TYPES = [
  "planet-hunting",
  "asteroid-hunting",
  "cloud-tracking",
  "rover-training",
  "ice-tracking",
  "solar-monitoring",
] as const;

export type ProjectType = (typeof PROJECT_TYPES)[number];

export type StructureType = "telescope" | "satellite" | "rover" | "solar";

export type TelescopeFocusType = "stellar" | "planetary";

export type TutorialId =
  | "welcome-tour"
  | "game-overview"
  | "telescope-intro"
  | "satellite-intro"
  | "rover-intro"
  | "solar-intro"
  | "telescope-deploy"
  | "satellite-deploy"
  | "rover-deploy"
  | "solar-deploy"
  | "planet-hunting"
  | "asteroid-hunting"
  | "cloud-tracking"
  | "jovian-vortex"
  | "ice-tracking"
  | "solar-monitoring"
  | "rover-terrain"
  | "research-page"
  | "inventory-page"
  | "leaderboard-page"
  | "mineral-guide"
  | "stardust-guide"
  | "init-seen";

export type HubOnboardingStep = "intro" | "project-selection" | "structure-intro";

export interface HubOnboarding {
  projectInterests: ProjectType[];
  hasCompletedOnboarding: boolean;
  hasSeenStructureGuide: boolean;
  hasSeenDeploymentTutorial: boolean;
  hasSeenMineralGuide: boolean;
  completedTutorials: Record<string, boolean>;
  structureOrder: StructureType[];
  telescopeFocus: TelescopeFocusType | null;
  lastPreferencesAsked: string | null;
  inProgressStep: HubOnboardingStep | null;
  inProgressProject: ProjectType | null;
}

export interface HubState {
  onboarding: HubOnboarding;
  garden: GardenState | null;
}

export interface HubStatePatch {
  onboarding?: Partial<HubOnboarding>;
  garden?: GardenState | null;
}

const STRUCTURE_ORDER: StructureType[] = ["telescope", "satellite", "rover", "solar"];
const ONBOARDING_STEPS: HubOnboardingStep[] = ["intro", "project-selection", "structure-intro"];
const PROJECT_TYPE_SET = new Set<string>(PROJECT_TYPES);
const STRUCTURE_TYPE_SET = new Set<string>(STRUCTURE_ORDER);
const FOCUS_SET = new Set<string>(["stellar", "planetary"]);

export function defaultOnboarding(): HubOnboarding {
  return {
    projectInterests: [],
    hasCompletedOnboarding: false,
    hasSeenStructureGuide: false,
    hasSeenDeploymentTutorial: false,
    hasSeenMineralGuide: false,
    completedTutorials: {},
    structureOrder: [...STRUCTURE_ORDER],
    telescopeFocus: null,
    lastPreferencesAsked: null,
    inProgressStep: null,
    inProgressProject: null,
  };
}

export function emptyHubState(): HubState {
  return { onboarding: defaultOnboarding(), garden: null };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function parseProjectList(value: unknown): ProjectType[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is ProjectType => typeof item === "string" && PROJECT_TYPE_SET.has(item));
}

function parseStructureOrder(value: unknown): StructureType[] {
  if (!Array.isArray(value)) return [...STRUCTURE_ORDER];
  const order = value.filter((item): item is StructureType => typeof item === "string" && STRUCTURE_TYPE_SET.has(item));
  return order.length ? order : [...STRUCTURE_ORDER];
}

function parseTutorials(value: unknown): Record<string, boolean> {
  const record = asRecord(value);
  if (!record) return {};
  const next: Record<string, boolean> = {};
  for (const [key, completed] of Object.entries(record)) {
    if (completed === true) next[key] = true;
  }
  return next;
}

function parseStep(value: unknown): HubOnboardingStep | null {
  return typeof value === "string" && ONBOARDING_STEPS.includes(value as HubOnboardingStep)
    ? (value as HubOnboardingStep)
    : null;
}

function parseProject(value: unknown): ProjectType | null {
  return typeof value === "string" && PROJECT_TYPE_SET.has(value) ? (value as ProjectType) : null;
}

function parseFocus(value: unknown): TelescopeFocusType | null {
  return typeof value === "string" && FOCUS_SET.has(value) ? (value as TelescopeFocusType) : null;
}

export function parseOnboarding(value: unknown): HubOnboarding {
  const record = asRecord(value);
  if (!record) return defaultOnboarding();
  return {
    projectInterests: parseProjectList(record.projectInterests),
    hasCompletedOnboarding: record.hasCompletedOnboarding === true,
    hasSeenStructureGuide: record.hasSeenStructureGuide === true,
    hasSeenDeploymentTutorial: record.hasSeenDeploymentTutorial === true,
    hasSeenMineralGuide: record.hasSeenMineralGuide === true,
    completedTutorials: parseTutorials(record.completedTutorials),
    structureOrder: parseStructureOrder(record.structureOrder),
    telescopeFocus: parseFocus(record.telescopeFocus),
    lastPreferencesAsked: typeof record.lastPreferencesAsked === "string" ? record.lastPreferencesAsked : null,
    inProgressStep: parseStep(record.inProgressStep),
    inProgressProject: parseProject(record.inProgressProject),
  };
}

export function mergeOnboarding(base: HubOnboarding, patch: Partial<HubOnboarding>): HubOnboarding {
  return {
    ...base,
    ...patch,
    projectInterests: patch.projectInterests ? parseProjectList(patch.projectInterests) : base.projectInterests,
    completedTutorials: patch.completedTutorials
      ? parseTutorials(patch.completedTutorials)
      : base.completedTutorials,
    structureOrder: patch.structureOrder ? parseStructureOrder(patch.structureOrder) : base.structureOrder,
    telescopeFocus: patch.telescopeFocus !== undefined ? parseFocus(patch.telescopeFocus) : base.telescopeFocus,
    lastPreferencesAsked:
      patch.lastPreferencesAsked !== undefined
        ? typeof patch.lastPreferencesAsked === "string"
          ? patch.lastPreferencesAsked
          : null
        : base.lastPreferencesAsked,
    inProgressStep: patch.inProgressStep !== undefined ? parseStep(patch.inProgressStep) : base.inProgressStep,
    inProgressProject:
      patch.inProgressProject !== undefined ? parseProject(patch.inProgressProject) : base.inProgressProject,
  };
}

export function applyHubStatePatch(current: HubState, patch: HubStatePatch): HubState {
  return {
    onboarding: patch.onboarding ? mergeOnboarding(current.onboarding, patch.onboarding) : current.onboarding,
    garden: patch.garden !== undefined ? patch.garden : current.garden,
  };
}

export function hasAccountOnboarding(onboarding: HubOnboarding): boolean {
  return onboarding.hasCompletedOnboarding || onboarding.projectInterests.length > 0;
}

export function needsRosterPrompt(onboarding: HubOnboarding): boolean {
  return !hasAccountOnboarding(onboarding);
}
