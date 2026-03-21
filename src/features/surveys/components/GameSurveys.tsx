"use client";

import { usePostHog } from "posthog-js/react";
import { useGameSurveys } from "../hooks/useGameSurveys";
import MechanicPulseSurvey from "./MechanicPulseSurvey";

export function GameSurveys({ userId }: { userId?: string }) {
  const posthog = usePostHog();
  const { activeSurvey, dismissSurvey, completeSurvey } = useGameSurveys(userId);

  if (!activeSurvey) return null;

  return (
    <div className="fixed bottom-24 right-6 z-50 animate-in slide-in-from-bottom-4 fade-in duration-500 w-full max-w-sm">
      <MechanicPulseSurvey 
        survey={activeSurvey} 
        onDismiss={dismissSurvey} 
        onSubmit={(answers) => {
          posthog?.capture("survey sent", {
            $survey_id: activeSurvey.id,
            $survey_name: activeSurvey.title,
            ...Object.fromEntries(
              Object.entries(answers).map(([k, v]) => [`$survey_response_${k}`, v])
            ),
          });
          completeSurvey();
        }} 
      />
    </div>
  );
}
