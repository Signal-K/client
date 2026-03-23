"use client";

import { usePostHog } from "posthog-js/react";
import { useGameSurveys } from "../hooks/useGameSurveys";
import { useProjectEngagementSurveys } from "../hooks/useProjectEngagementSurveys";
import type { ClassificationForSurvey } from "../hooks/useProjectEngagementSurveys";
import type { ClassificationForMechanicSurvey } from "../hooks/useGameSurveys";
import MechanicPulseSurvey from "./MechanicPulseSurvey";

interface GameSurveysProps {
  userId?: string;
  classifications?: ClassificationForSurvey[];
}

export function GameSurveys({ userId, classifications = [] }: GameSurveysProps) {
  const posthog = usePostHog();

  const {
    activeSurvey: activeMechanicSurvey,
    dismissSurvey: dismissMechanic,
    completeSurvey: completeMechanic,
  } = useGameSurveys(userId, classifications as ClassificationForMechanicSurvey[]);

  const {
    activeSurvey: activeEngagementSurvey,
    dismissSurvey: dismissEngagement,
    completeSurvey: completeEngagement,
  } = useProjectEngagementSurveys(userId, classifications);

  // Mechanic surveys take priority; engagement surveys surface after they are dismissed/completed
  const isEngagement = !activeMechanicSurvey && Boolean(activeEngagementSurvey);
  const activeSurvey = activeMechanicSurvey ?? activeEngagementSurvey;

  if (!activeSurvey) return null;

  const handleDismiss = isEngagement ? dismissEngagement : dismissMechanic;
  const handleComplete = isEngagement ? completeEngagement : completeMechanic;

  return (
    // Responsive positioning:
    // Mobile  — full-width minus 12px gutters, 80px above the bottom edge
    // sm+     — pinned to bottom-right corner, capped at max-w-sm
    <div className="fixed bottom-20 left-3 right-3 z-50 mx-auto max-w-sm animate-in slide-in-from-bottom-4 fade-in duration-500 sm:bottom-24 sm:left-auto sm:right-6 sm:w-full">
      <MechanicPulseSurvey
        survey={activeSurvey}
        onDismiss={handleDismiss}
        onSubmit={(answers) => {
          const capturePayload: Record<string, string | undefined> = {
            $survey_id: activeSurvey.id,
            $survey_name: activeSurvey.title,
            ...Object.fromEntries(
              Object.entries(answers).map(([k, v]) => [`$survey_response_${k}`, v])
            ),
          };

          // For project engagement surveys, always record the user's Supabase UUID
          // so responses can be linked back to accounts for follow-up.
          if (isEngagement && userId) {
            capturePayload.user_uuid = userId;
          }

          posthog?.capture("survey sent", capturePayload);
          handleComplete();
        }}
      />
    </div>
  );
}
