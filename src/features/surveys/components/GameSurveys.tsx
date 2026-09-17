"use client";

import { usePostHog } from "posthog-js/react";
import { useGameSurveys } from "../hooks/useGameSurveys";
import { useProjectEngagementSurveys } from "../hooks/useProjectEngagementSurveys";
import type { ClassificationForSurvey } from "../hooks/useProjectEngagementSurveys";
import type { ClassificationForMechanicSurvey } from "../hooks/useGameSurveys";
import InMechanicSurveyStep from "./InMechanicSurveyStep";
import MechanicPulseSurvey from "./MechanicPulseSurvey";

interface GameSurveysProps {
  userId?: string;
  classifications?: ClassificationForSurvey[];
  mechanicId?: string;
}

export function GameSurveys({
  userId,
  classifications = [],
  mechanicId,
}: GameSurveysProps) {
  const posthog = usePostHog();

  const {
    activeQuestion,
    dismissSurvey: dismissMechanic,
    completeSurvey: completeMechanic,
    shownCount,
    quota,
    playthroughId,
    classificationType,
  } = useGameSurveys(userId, classifications as ClassificationForMechanicSurvey[], mechanicId);

  const {
    activeSurvey: activeEngagementSurvey,
    dismissSurvey: dismissEngagement,
    completeSurvey: completeEngagement,
  } = useProjectEngagementSurveys(userId, classifications);

  const showEngagement = !activeQuestion && Boolean(activeEngagementSurvey) && mechanicId !== "base";

  if (activeQuestion) {
    return (
      <InMechanicSurveyStep
        question={activeQuestion}
        step={shownCount + 1}
        of={quota}
        playthroughId={playthroughId}
        classificationType={classificationType}
        onSkip={() => {
          posthog?.capture("mechanic_survey_skipped", {
            $survey_id: activeQuestion.id,
            mechanic: activeQuestion.mechanicId,
            coverage: activeQuestion.coverage,
            playthrough_id: playthroughId,
            classification_type: classificationType,
            playthrough_step: shownCount + 1,
            playthrough_quota: quota,
          });
          dismissMechanic();
        }}
        onSubmit={(answer) => {
          posthog?.capture("survey sent", {
            $survey_id: activeQuestion.id,
            $survey_name: activeQuestion.prompt,
            $survey_response: answer,
            mechanic: activeQuestion.mechanicId,
            coverage: activeQuestion.coverage,
            playthrough_id: playthroughId,
            classification_type: classificationType,
            playthrough_step: shownCount + 1,
            playthrough_quota: quota,
          });
          posthog?.capture("mechanic_survey_answered", {
            $survey_id: activeQuestion.id,
            mechanic: activeQuestion.mechanicId,
            coverage: activeQuestion.coverage,
            answer,
            playthrough_id: playthroughId,
            classification_type: classificationType,
            playthrough_step: shownCount + 1,
            playthrough_quota: quota,
          });
          completeMechanic();
        }}
      />
    );
  }

  if (!showEngagement || !activeEngagementSurvey) return null;

  return (
    <div className="mb-4">
      <MechanicPulseSurvey
        survey={activeEngagementSurvey}
        onDismiss={dismissEngagement}
        onSubmit={(answers) => {
          const capturePayload: Record<string, string | undefined> = {
            $survey_id: activeEngagementSurvey.id,
            $survey_name: activeEngagementSurvey.title,
            ...Object.fromEntries(
              Object.entries(answers).map(([k, v]) => [`$survey_response_${k}`, v]),
            ),
          };
          if (userId) capturePayload.user_uuid = userId;
          posthog?.capture("survey sent", capturePayload);
          completeEngagement();
        }}
      />
    </div>
  );
}
