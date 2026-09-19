"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  defaultOnboarding,
  hasAccountOnboarding,
  mergeOnboarding,
  needsRosterPrompt,
  type HubOnboarding,
  type HubOnboardingStep,
  type ProjectType,
  type StructureType,
  type TelescopeFocusType,
  type TutorialId,
} from "@/src/features/onboarding/hubState";
import {
  clearOnboardingLeftovers,
  fetchHubState,
  patchHubState,
  readOnboardingLeftovers,
} from "@/src/features/onboarding/hubStateClient";

export type { ProjectType, TelescopeFocusType, TutorialId };

export interface UserPreferences extends HubOnboarding {
  deviceId: string;
}

const DEVICE_ID_KEY = "star-sailors-device-id";

function storageGet(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function storageSet(key: string, value: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

function generateDeviceId(): string {
  return `device-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function getDeviceId(): string {
  if (typeof window === "undefined") return "";
  return (
    storageGet(DEVICE_ID_KEY) ??
    (() => {
      const id = generateDeviceId();
      storageSet(DEVICE_ID_KEY, id);
      return id;
    })()
  );
}

function withDevice(onboarding: HubOnboarding): UserPreferences {
  return { ...onboarding, deviceId: getDeviceId() };
}

const defaultPreferences: UserPreferences = withDevice(defaultOnboarding());

export function useUserPreferences(userId?: string | null) {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(true);
  const [needsPreferencesPrompt, setNeedsPreferencesPrompt] = useState(false);
  const authenticatedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      const remote = await fetchHubState();
      if (cancelled) return;

      authenticatedRef.current = remote.authenticated;
      if (!remote.authenticated) {
        setPreferences(withDevice(defaultOnboarding()));
        setNeedsPreferencesPrompt(false);
        setIsLoading(false);
        return;
      }

      if (remote.failed) {
        // Backend unreachable: don't mistake an empty default for a fresh account.
        setPreferences(withDevice(defaultOnboarding()));
        setNeedsPreferencesPrompt(false);
        setIsLoading(false);
        return;
      }

      let onboarding = remote.onboarding;
      if (!hasAccountOnboarding(onboarding)) {
        const leftover = readOnboardingLeftovers(userId);
        if (leftover) {
          onboarding = mergeOnboarding(onboarding, leftover);
          void patchHubState({ onboarding });
        }
      }
      clearOnboardingLeftovers(userId);
      setPreferences(withDevice(onboarding));
      setNeedsPreferencesPrompt(needsRosterPrompt(onboarding));
      setIsLoading(false);
    }

    void hydrate();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const persist = useCallback((updated: HubOnboarding) => {
    if (!authenticatedRef.current) return;
    void patchHubState({ onboarding: updated });
  }, []);

  const savePreferences = useCallback((newPreferences: Partial<UserPreferences>) => {
    setPreferences((prev) => {
      const updated = mergeOnboarding(prev, newPreferences);
      persist(updated);
      return withDevice(updated);
    });
  }, [persist]);

  const setProjectInterests = useCallback((interests: ProjectType[]) => {
    savePreferences({
      projectInterests: interests,
      hasCompletedOnboarding: true,
      lastPreferencesAsked: new Date().toISOString(),
      inProgressStep: null,
      inProgressProject: null,
    });
    setNeedsPreferencesPrompt(false);
  }, [savePreferences]);

  const completeOnboarding = useCallback(() => {
    savePreferences({
      hasCompletedOnboarding: true,
      inProgressStep: null,
      inProgressProject: null,
    });
    setNeedsPreferencesPrompt(false);
  }, [savePreferences]);

  const hydrateFromAccount = useCallback((input: {
    interests?: ProjectType[];
    returning?: boolean;
  }) => {
    savePreferences({
      ...(input.interests && input.interests.length > 0 ? { projectInterests: input.interests } : {}),
      hasCompletedOnboarding: true,
      lastPreferencesAsked: new Date().toISOString(),
    });
    setNeedsPreferencesPrompt(false);
  }, [savePreferences]);

  const setOnboardingProgress = useCallback((input: {
    step?: HubOnboardingStep | null;
    project?: ProjectType | null;
  }) => {
    savePreferences({
      ...(input.step !== undefined ? { inProgressStep: input.step } : {}),
      ...(input.project !== undefined ? { inProgressProject: input.project } : {}),
    });
  }, [savePreferences]);

  const markStructureGuideSeen = useCallback(() => {
    savePreferences({ hasSeenStructureGuide: true });
  }, [savePreferences]);

  const markDeploymentTutorialSeen = useCallback(() => {
    savePreferences({ hasSeenDeploymentTutorial: true });
  }, [savePreferences]);

  const markMineralGuideSeen = useCallback(() => {
    savePreferences({ hasSeenMineralGuide: true });
  }, [savePreferences]);

  const setStructureOrder = useCallback((order: StructureType[]) => {
    savePreferences({ structureOrder: order });
  }, [savePreferences]);

  const setTelescopeFocus = useCallback((focus: TelescopeFocusType | null) => {
    savePreferences({ telescopeFocus: focus });
  }, [savePreferences]);

  const dismissPreferencesPrompt = useCallback(() => {
    savePreferences({
      hasCompletedOnboarding: true,
      lastPreferencesAsked: new Date().toISOString(),
    });
    setNeedsPreferencesPrompt(false);
  }, [savePreferences]);

  const showPreferencesPrompt = useCallback(() => {
    setNeedsPreferencesPrompt(true);
  }, []);

  const isProjectInterested = useCallback((project: ProjectType) => {
    if (preferences.projectInterests.length === 0) return true;
    return preferences.projectInterests.includes(project);
  }, [preferences.projectInterests]);

  const markTutorialComplete = useCallback((tutorialId: TutorialId) => {
    setPreferences((prev) => {
      const updated = mergeOnboarding(prev, {
        completedTutorials: {
          ...prev.completedTutorials,
          [tutorialId]: true,
        },
      });
      persist(updated);
      return withDevice(updated);
    });
  }, [persist]);

  const hasTutorialCompleted = useCallback((tutorialId: TutorialId): boolean => {
    return preferences.completedTutorials?.[tutorialId] === true;
  }, [preferences.completedTutorials]);

  const resetTutorial = useCallback((tutorialId: TutorialId) => {
    setPreferences((prev) => {
      const completedTutorials = { ...prev.completedTutorials };
      delete completedTutorials[tutorialId];
      const updated = mergeOnboarding(prev, { completedTutorials });
      persist(updated);
      return withDevice(updated);
    });
  }, [persist]);

  const resetPreferences = useCallback(() => {
    const next = defaultOnboarding();
    persist(next);
    setPreferences(withDevice(next));
    setNeedsPreferencesPrompt(true);
  }, [persist]);

  return {
    preferences,
    isLoading,
    needsPreferencesPrompt,
    setProjectInterests,
    completeOnboarding,
    hydrateFromAccount,
    setOnboardingProgress,
    markStructureGuideSeen,
    markDeploymentTutorialSeen,
    markMineralGuideSeen,
    markTutorialComplete,
    hasTutorialCompleted,
    resetTutorial,
    setStructureOrder,
    setTelescopeFocus,
    dismissPreferencesPrompt,
    showPreferencesPrompt,
    isProjectInterested,
    resetPreferences,
    savePreferences,
  };
}
