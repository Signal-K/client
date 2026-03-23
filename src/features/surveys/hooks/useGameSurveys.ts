"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { MECHANIC_SURVEYS, SURVEY_DISPLAY_DELAY_MS, surveyStorageKey } from "../mechanic-surveys";
import type { MechanicMicroSurvey } from "../types";

export type ClassificationForMechanicSurvey = {
  classificationtype?: string | null;
};

export function useGameSurveys(
  userId?: string,
  classifications: ClassificationForMechanicSurvey[] = []
) {
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
          "base": "feature_profile_v1",
        };

        if (s.id !== viewMap[view]) return false;

        // Check if already completed or dismissed
        const key = surveyStorageKey(s.id, userId);
        if (localStorage.getItem(key)) return false;

        // For mechanic surveys, enforce a minimum classification threshold
        // so new users are not immediately shown surveys about tools they've never used
        if (s.minClassificationsRequired && s.minClassificationsRequired > 0) {
          const relevantTypes = s.relevantClassificationTypes;
          const count = classifications.filter((c) => {
            if (!c.classificationtype) return false;
            // If no specific types are defined, count all classifications
            if (!relevantTypes || relevantTypes.length === 0) return true;
            return relevantTypes.includes(c.classificationtype);
          }).length;
          if (count < s.minClassificationsRequired) return false;
        }

        return true;
      });

      if (candidate) {
        setActiveSurvey(candidate);
      }
    }, SURVEY_DISPLAY_DELAY_MS);

    return () => clearTimeout(timer);
  }, [userId, view, classifications]);

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
