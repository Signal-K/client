"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { MECHANIC_SURVEYS, SURVEY_DISPLAY_DELAY_MS, surveyStorageKey } from "../mechanic-surveys";
import type { MechanicMicroSurvey } from "../types";

export function useGameSurveys(userId?: string) {
  const searchParams = useSearchParams();
  const view = searchParams.get("view") || "base";
  
  const [activeSurvey, setActiveSurvey] = useState<MechanicMicroSurvey | null>(null);

  useEffect(() => {
    if (!userId) return;

    // Reset when view changes
    setActiveSurvey(null);

    const timer = setTimeout(() => {
      // Find a relevant survey for the current view
      const candidate = MECHANIC_SURVEYS.find(s => {
        // Map views to survey triggers
        const viewMap: Record<string, string> = {
          "telescope": "mechanic_telescope_loop_v1",
          "rover": "mechanic_rover_loop_v1",
          "satellite": "mechanic_satellite_loop_v1",
          "solar": "mechanic_solar_loop_v1",
          "inventory": "feature_inventory_v1",
          "base": "feature_profile_v1" // Just an example mapping
        };

        if (s.id === viewMap[view]) {
           // Check if already completed
           const key = surveyStorageKey(s.id, userId);
           return !localStorage.getItem(key);
        }
        return false;
      });

      if (candidate) {
        setActiveSurvey(candidate);
      }
    }, SURVEY_DISPLAY_DELAY_MS);

    return () => clearTimeout(timer);
  }, [userId, view]);

  const dismissSurvey = () => {
    if (activeSurvey && userId) {
      const key = surveyStorageKey(activeSurvey.id, userId);
      localStorage.setItem(key, "dismissed");
      setActiveSurvey(null);
    }
  };

  const completeSurvey = () => {
    if (activeSurvey && userId) {
      const key = surveyStorageKey(activeSurvey.id, userId);
      localStorage.setItem(key, "completed");
      setActiveSurvey(null);
    }
  };

  return { activeSurvey, dismissSurvey, completeSurvey };
}
