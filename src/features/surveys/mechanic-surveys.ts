import type { MechanicMicroSurvey } from "@/src/features/surveys/types";

export const MECHANIC_SURVEYS: readonly MechanicMicroSurvey[] = [
  {
    id: "mechanic_telescope_loop_v1",
    title: "Telescope Debrief",
    subtitle: "How did the detection loop feel this run?",
    triggerSurface: "game",
    questions: [
      {
        id: "pace",
        prompt: "Telescope mission pace",
        options: ["Too slow", "Balanced", "Too fast"],
        required: true,
      },
      {
        id: "clarity",
        prompt: "Signal clarity",
        options: ["Confusing", "Okay", "Crystal clear"],
        required: false,
      },
    ],
  },
  {
    id: "mechanic_rover_loop_v1",
    title: "Rover Debrief",
    subtitle: "Quick systems check from your terrain run.",
    triggerSurface: "game",
    questions: [
      {
        id: "control",
        prompt: "Rover control feel",
        options: ["Clunky", "Usable", "Excellent"],
        required: true,
      },
      {
        id: "stakes",
        prompt: "Mission tension",
        options: ["Flat", "Good", "High"],
        required: false,
      },
    ],
  },
  {
    id: "mechanic_ecosystem_minigame_v1",
    title: "Ecosystem Debrief",
    subtitle: "Which expansion should land first?",
    triggerSurface: "ecosystem",
    questions: [
      {
        id: "priority",
        prompt: "Next minigame priority",
        options: ["Mining prototype", "Planet hunter sim", "Guild contracts"],
        required: true,
      },
      {
        id: "bridge",
        prompt: "Web <-> minigame connection",
        options: ["Light touch", "Shared rewards", "Full progression sync"],
        required: false,
      },
    ],
  },
];

export const SURVEY_DISPLAY_DELAY_MS = 10000;

export function surveyStorageKey(surveyId: string, userId: string): string {
  return `starsailors_mechanic_survey_${surveyId}_${userId}_v1`;
}
