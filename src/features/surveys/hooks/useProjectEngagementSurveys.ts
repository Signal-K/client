"use client";

import { useState, useEffect } from "react";
import {
  PROJECT_ENGAGEMENT_SURVEYS,
  surveyStorageKey,
} from "../mechanic-surveys";
import type { ProjectEngagementSurvey, ProjectType } from "../types";

// Maps classification types to project types
const CLASSIFICATION_TO_PROJECT: Record<string, ProjectType> = {
  planet: "planet-hunters",
  "telescope-tess": "planet-hunters",
  "telescope-minorPlanet": "asteroid-hunting",
  "active-asteroids": "asteroid-hunting",
  rover: "rover",
  cloud: "cloudspotting",
  "lidar-jovianVortexHunter": "cloudspotting",
  "telescope-sunspot": "sunspots",
};

export type ClassificationForSurvey = {
  classificationtype?: string | null;
};

export function useProjectEngagementSurveys(
  userId: string | undefined,
  classifications: ClassificationForSurvey[]
) {
  const [activeSurvey, setActiveSurvey] =
    useState<ProjectEngagementSurvey | null>(null);

  useEffect(() => {
    if (!userId || classifications.length === 0) return;

    // Count contributions per project type
    const counts: Partial<Record<ProjectType, number>> = {};
    for (const c of classifications) {
      const projectType =
        CLASSIFICATION_TO_PROJECT[c.classificationtype ?? ""];
      if (projectType) {
        counts[projectType] = (counts[projectType] ?? 0) + 1;
      }
    }

    // Find the first eligible project engagement survey
    for (const survey of PROJECT_ENGAGEMENT_SURVEYS) {
      const count = counts[survey.projectType] ?? 0;
      if (count < survey.contributionThreshold) continue;

      try {
        const key = surveyStorageKey(survey.id, userId);
        if (localStorage.getItem(key)) continue;
      } catch {
        // localStorage unavailable — skip this survey to avoid crashes
        continue;
      }

      setActiveSurvey(survey);
      return;
    }
  }, [userId, classifications]);

  const dismissSurvey = () => {
    if (!activeSurvey || !userId) return;
    try {
      localStorage.setItem(surveyStorageKey(activeSurvey.id, userId), "dismissed");
    } catch {
      // ignore
    }
    setActiveSurvey(null);
  };

  const completeSurvey = () => {
    if (!activeSurvey || !userId) return;
    try {
      localStorage.setItem(surveyStorageKey(activeSurvey.id, userId), "completed");
    } catch {
      // ignore
    }
    setActiveSurvey(null);
  };

  return { activeSurvey, dismissSurvey, completeSurvey };
}
