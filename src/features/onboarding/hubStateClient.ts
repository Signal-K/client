import {
  defaultOnboarding,
  parseOnboarding,
  type HubOnboarding,
  type HubState,
} from "@/src/features/onboarding/hubState";
import { hydrateGardenState, isPristineGarden, type GardenState } from "@/src/features/garden/gardenLogic";

export const PREFS_STORAGE_KEY = "star-sailors-preferences-v2";
export const DEVICE_COMPLETE_KEY = "star-sailors-onboarding-complete-v2";
export const ONBOARDING_STEP_KEY = "ss_onboarding_step_v2";
export const ONBOARDING_PROJECT_KEY = "ss_onboarding_project_v2";
export const GARDEN_V3_KEY = "ssc.garden.v3";
export const GARDEN_V2_KEY = "ssc.garden.v2";
export const GARDEN_V1_KEY = "ssc.garden.v1";

let inflight: Promise<HubState & { authenticated: boolean; failed?: boolean }> | null = null;

function storageGet(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function storageRemove(key: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export function readOnboardingLeftovers(userId?: string | null): HubOnboarding | null {
  const scoped = userId ? storageGet(`${PREFS_STORAGE_KEY}:${userId}`) : null;
  const raw = scoped ?? storageGet(PREFS_STORAGE_KEY);
  let parsed = defaultOnboarding();
  if (raw) {
    try {
      parsed = parseOnboarding(JSON.parse(raw));
    } catch {
      parsed = defaultOnboarding();
    }
  }
  const step = storageGet(ONBOARDING_STEP_KEY);
  const project = storageGet(ONBOARDING_PROJECT_KEY);
  const deviceComplete = storageGet(DEVICE_COMPLETE_KEY) === "1";
  const leftover = parseOnboarding({
    ...parsed,
    hasCompletedOnboarding: parsed.hasCompletedOnboarding || deviceComplete,
    inProgressStep: parsed.inProgressStep ?? step,
    inProgressProject: parsed.inProgressProject ?? project,
  });
  const hasAnything =
    leftover.hasCompletedOnboarding ||
    leftover.projectInterests.length > 0 ||
    leftover.inProgressStep ||
    leftover.inProgressProject ||
    Object.keys(leftover.completedTutorials).length > 0 ||
    leftover.telescopeFocus ||
    leftover.hasSeenStructureGuide ||
    leftover.hasSeenDeploymentTutorial ||
    leftover.hasSeenMineralGuide;
  return hasAnything ? leftover : null;
}

export function readGardenLeftovers(userId?: string | null): GardenState | null {
  const raw =
    (userId ? storageGet(`${GARDEN_V3_KEY}:${userId}`) : null) ?? storageGet(GARDEN_V3_KEY);
  if (!raw) return null;
  try {
    const garden = hydrateGardenState(JSON.parse(raw));
    return isPristineGarden(garden) ? null : garden;
  } catch {
    return null;
  }
}

export function clearOnboardingLeftovers(userId?: string | null) {
  storageRemove(PREFS_STORAGE_KEY);
  storageRemove(DEVICE_COMPLETE_KEY);
  storageRemove(ONBOARDING_STEP_KEY);
  storageRemove(ONBOARDING_PROJECT_KEY);
  if (userId) storageRemove(`${PREFS_STORAGE_KEY}:${userId}`);
}

export function clearGardenLeftovers(userId?: string | null) {
  storageRemove(GARDEN_V1_KEY);
  storageRemove(GARDEN_V2_KEY);
  storageRemove(GARDEN_V3_KEY);
  if (userId) {
    storageRemove(`${GARDEN_V2_KEY}:${userId}`);
    storageRemove(`${GARDEN_V3_KEY}:${userId}`);
  }
}

export async function fetchHubState(): Promise<HubState & { authenticated: boolean; failed?: boolean }> {
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const res = await fetch("/api/gameplay/hub/state");
      if (res.status === 401) {
        return { onboarding: defaultOnboarding(), garden: null, authenticated: false };
      }
      if (!res.ok) {
        return { onboarding: defaultOnboarding(), garden: null, authenticated: true, failed: true };
      }
      const data = (await res.json()) as HubState;
      return {
        onboarding: parseOnboarding(data.onboarding),
        garden: data.garden == null ? null : hydrateGardenState(data.garden),
        authenticated: true,
      };
    } catch {
      return { onboarding: defaultOnboarding(), garden: null, authenticated: true, failed: true };
    }
  })().finally(() => {
    inflight = null;
  });
  return inflight;
}

export async function patchHubState(patch: {
  onboarding?: HubOnboarding | Partial<HubOnboarding>;
  garden?: GardenState | null;
}): Promise<(HubState & { persisted: boolean }) | null> {
  try {
    const res = await fetch("/api/gameplay/hub/state", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as HubState & { persisted?: boolean };
    return {
      onboarding: parseOnboarding(data.onboarding),
      garden: data.garden == null ? null : hydrateGardenState(data.garden),
      persisted: data.persisted !== false,
    };
  } catch {
    return null;
  }
}
