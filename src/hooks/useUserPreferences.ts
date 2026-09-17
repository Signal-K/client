"use client";

import { useState, useEffect, useCallback } from "react";

// Project types available in Star Sailors
export type ProjectType = 
  | "planet-hunting"      // TESS/NGTS exoplanet discovery
  | "asteroid-hunting"    // Daily Minor Planet
  | "cloud-tracking"      // Cloudspotting on Mars, JVH
  | "rover-training"      // AI for Mars terrain classification
  | "ice-tracking"        // Planet Four seasonal changes
  | "solar-monitoring";   // Sunspot classification

// Structure types
type StructureType = "telescope" | "satellite" | "rover" | "solar";

// Telescope focus types
export type TelescopeFocusType = "stellar" | "planetary";

// Tutorial identifiers - comprehensive list of all tutorials in the app
export type TutorialId = 
  // Overall app tutorials
  | "welcome-tour"           // First-time welcome tour
  | "game-overview"          // Overall game mechanics
  // Structure tutorials
  | "telescope-intro"        // What is the telescope?
  | "satellite-intro"        // What is the satellite?
  | "rover-intro"            // What is the rover?
  | "solar-intro"            // What is the solar observatory?
  // Deployment tutorials
  | "telescope-deploy"       // How to deploy telescope
  | "satellite-deploy"       // How to deploy satellite
  | "rover-deploy"           // How to deploy rover
  | "solar-deploy"           // Solar observatory deployment tutorial
  // Project-specific tutorials
  | "planet-hunting"         // TESS planet hunting
  | "asteroid-hunting"       // Minor planet/asteroid detection
  | "cloud-tracking"         // Mars cloud spotting
  | "jovian-vortex"          // Jupiter storm hunting
  | "ice-tracking"           // Planet Four ice/fans
  | "solar-monitoring"       // Sunspot classification
  | "rover-terrain"          // AI for Mars
  // Page tutorials
  | "research-page"          // Research page intro
  | "inventory-page"         // Inventory/minerals page
  | "leaderboard-page"       // Leaderboard explanation
  // Feature tutorials
  | "mineral-guide"          // Where do minerals come from
  | "stardust-guide"         // What is stardust
  | "init-seen";            // One-time initialization sequence on first visit

// Track which tutorials have been completed
interface TutorialCompletion {
  [key: string]: boolean;
}

interface UserPreferences {
  // Project interests (what the user wants to focus on)
  projectInterests: ProjectType[];
  
  // Has the user completed the initial onboarding?
  hasCompletedOnboarding: boolean;
  
  // Has the user seen the structure explanations?
  hasSeenStructureGuide: boolean;
  
  // Has the user seen the deployment tutorial?
  hasSeenDeploymentTutorial: boolean;
  
  // Has the user seen the mineral explanation?
  hasSeenMineralGuide: boolean;
  
  // Track individual tutorial completions
  completedTutorials: TutorialCompletion;
  
  // Preferred structure order on dashboard
  structureOrder: StructureType[];
  
  // Telescope focus preference (stellar vs planetary)
  telescopeFocus: TelescopeFocusType | null;
  
  // Last time preferences were asked (to avoid asking too often)
  lastPreferencesAsked: string | null;
  
  // Device ID for cross-device detection
  deviceId: string;
}

const STORAGE_KEY = "star-sailors-preferences";
const DEVICE_COMPLETE_KEY = "star-sailors-onboarding-complete";
const DEVICE_ID_KEY = "star-sailors-device-id";

function prefsKey(userId?: string | null) {
  return userId ? `${STORAGE_KEY}:${userId}` : STORAGE_KEY;
}

function storageGet(key: string): string | null {
  if (typeof window === "undefined") return null;
  try { return localStorage.getItem(key); } catch { return null; }
}

function storageSet(key: string, value: string) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(key, value); } catch { /* ignore */ }
}

function storageRemove(key: string) {
  if (typeof window === "undefined") return;
  try { localStorage.removeItem(key); } catch { /* ignore */ }
}

function generateDeviceId(): string {
  return `device-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function getDeviceId(): string {
  if (typeof window === "undefined") return "";
  return storageGet(DEVICE_ID_KEY) ?? (() => {
    const id = generateDeviceId();
    storageSet(DEVICE_ID_KEY, id);
    return id;
  })();
}

const defaultPreferences: UserPreferences = {
  projectInterests: [],
  hasCompletedOnboarding: false,
  hasSeenStructureGuide: false,
  hasSeenDeploymentTutorial: false,
  hasSeenMineralGuide: false,
  completedTutorials: {},
  structureOrder: ["telescope", "satellite", "rover", "solar"],
  telescopeFocus: null,
  lastPreferencesAsked: null,
  deviceId: "",
};

export function useUserPreferences(userId?: string | null) {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(true);
  const [needsPreferencesPrompt, setNeedsPreferencesPrompt] = useState(false);

  // Load preferences from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const stored = storageGet(prefsKey(userId)) ?? storageGet(STORAGE_KEY);
      const currentDeviceId = getDeviceId();
      const deviceComplete = storageGet(DEVICE_COMPLETE_KEY) === "1";
      
      if (stored) {
        const parsed = JSON.parse(stored) as UserPreferences;
        const isCompleted = parsed.hasCompletedOnboarding || deviceComplete;
        const hasInterests = Array.isArray(parsed.projectInterests) && parsed.projectInterests.length > 0;
        
        if (!isCompleted && !hasInterests) {
          setNeedsPreferencesPrompt(true);
        }
        setPreferences({
          ...parsed,
          hasCompletedOnboarding: isCompleted,
          deviceId: currentDeviceId,
        });
        if (userId && !storageGet(prefsKey(userId))) {
          storageSet(prefsKey(userId), JSON.stringify({
            ...parsed,
            hasCompletedOnboarding: isCompleted,
            deviceId: currentDeviceId,
          }));
        }
      } else if (deviceComplete) {
        setPreferences({
          ...defaultPreferences,
          hasCompletedOnboarding: true,
          deviceId: currentDeviceId,
        });
      } else {
        setNeedsPreferencesPrompt(true);
        setPreferences({
          ...defaultPreferences,
          deviceId: currentDeviceId,
        });
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
      setPreferences({
        ...defaultPreferences,
        deviceId: getDeviceId(),
      });
      setNeedsPreferencesPrompt(true);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const persist = useCallback((updated: UserPreferences) => {
    storageSet(prefsKey(userId), JSON.stringify(updated));
    storageSet(STORAGE_KEY, JSON.stringify(updated));
    if (updated.hasCompletedOnboarding) storageSet(DEVICE_COMPLETE_KEY, "1");
  }, [userId]);

  // Save preferences to localStorage
  const savePreferences = useCallback((newPreferences: Partial<UserPreferences>) => {
    setPreferences((prev) => {
      const updated = { ...prev, ...newPreferences };
      persist(updated);
      return updated;
    });
  }, [persist]);

  // Set project interests
  const setProjectInterests = useCallback((interests: ProjectType[]) => {
    savePreferences({
      projectInterests: interests,
      hasCompletedOnboarding: true,
      lastPreferencesAsked: new Date().toISOString(),
    });
    setNeedsPreferencesPrompt(false);
  }, [savePreferences]);

  // Mark onboarding as complete
  const completeOnboarding = useCallback(() => {
    savePreferences({ hasCompletedOnboarding: true });
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

  // Mark structure guide as seen
  const markStructureGuideSeen = useCallback(() => {
    savePreferences({ hasSeenStructureGuide: true });
  }, [savePreferences]);

  // Mark deployment tutorial as seen
  const markDeploymentTutorialSeen = useCallback(() => {
    savePreferences({ hasSeenDeploymentTutorial: true });
  }, [savePreferences]);

  // Mark mineral guide as seen
  const markMineralGuideSeen = useCallback(() => {
    savePreferences({ hasSeenMineralGuide: true });
  }, [savePreferences]);

  // Update structure order
  const setStructureOrder = useCallback((order: StructureType[]) => {
    savePreferences({ structureOrder: order });
  }, [savePreferences]);

  // Set telescope focus preference
  const setTelescopeFocus = useCallback((focus: TelescopeFocusType | null) => {
    savePreferences({ telescopeFocus: focus });
  }, [savePreferences]);

  // Dismiss the preferences prompt without setting preferences
  const dismissPreferencesPrompt = useCallback(() => {
    savePreferences({
      hasCompletedOnboarding: true,
      lastPreferencesAsked: new Date().toISOString(),
    });
    setNeedsPreferencesPrompt(false);
  }, [savePreferences]);

  // Force show preferences prompt
  const showPreferencesPrompt = useCallback(() => {
    setNeedsPreferencesPrompt(true);
  }, []);

  // Check if a specific project is in user's interests
  const isProjectInterested = useCallback((project: ProjectType) => {
    // If no preferences set, show all projects
    if (preferences.projectInterests.length === 0) return true;
    return preferences.projectInterests.includes(project);
  }, [preferences.projectInterests]);

  // Mark a specific tutorial as completed
  const markTutorialComplete = useCallback((tutorialId: TutorialId) => {
    setPreferences((prev) => {
      const updated = {
        ...prev,
        completedTutorials: {
          ...prev.completedTutorials,
          [tutorialId]: true,
        },
      };
      persist(updated);
      return updated;
    });
  }, [persist]);

  // Check if a specific tutorial has been completed
  const hasTutorialCompleted = useCallback((tutorialId: TutorialId): boolean => {
    return preferences.completedTutorials?.[tutorialId] === true;
  }, [preferences.completedTutorials]);

  // Reset a specific tutorial (allow user to replay)
  const resetTutorial = useCallback((tutorialId: TutorialId) => {
    setPreferences((prev) => {
      const updated = { ...prev.completedTutorials };
      delete updated[tutorialId];
      const newPrefs = { ...prev, completedTutorials: updated };
      persist(newPrefs);
      return newPrefs;
    });
  }, [persist]);

  // Reset all preferences (for testing)
  const resetPreferences = useCallback(() => {
    storageRemove(STORAGE_KEY);
    setPreferences({
      ...defaultPreferences,
      deviceId: getDeviceId(),
    });
    setNeedsPreferencesPrompt(true);
  }, []);

  return {
    preferences,
    isLoading,
    needsPreferencesPrompt,
    setProjectInterests,
    completeOnboarding,
    hydrateFromAccount,
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
