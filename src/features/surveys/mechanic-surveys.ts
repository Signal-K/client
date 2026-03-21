import type { MechanicMicroSurvey } from "@/src/features/surveys/types";

export const MECHANIC_SURVEYS: readonly MechanicMicroSurvey[] = [
  // ── Phase 5 trigger surveys ──────────────────────────────────────────────
  {
    id: "trigger_first_classification_v1",
    title: "First Contact",
    subtitle: "What drew you to this project?",
    triggerSurface: "game",
    questions: [
      {
        id: "draw",
        prompt: "What drew you to this project?",
        options: ["The science", "The gameplay", "Just exploring"],
        required: true,
      },
    ],
  },
  {
    id: "trigger_structure_deployed_v1",
    title: "Deployment Complete",
    subtitle: "How did that feel?",
    triggerSurface: "game",
    questions: [
      {
        id: "feel",
        prompt: "How did deploying feel?",
        options: ["Confusing", "Smooth", "Exciting"],
        required: true,
      },
    ],
  },
  {
    id: "trigger_session_5th_classification_v1",
    title: "Mission Check-In",
    subtitle: "Would you try a standalone experiment for this?",
    triggerSurface: "game",
    questions: [
      {
        id: "standalone",
        prompt: "Would you try a standalone experiment for this project?",
        options: ["Not really", "Maybe", "Definitely"],
        required: true,
      },
    ],
  },
  {
    id: "trigger_return_visit_3d_v1",
    title: "Welcome Back",
    subtitle: "What brings you back?",
    triggerSurface: "game",
    questions: [
      {
        id: "reason",
        prompt: "What brings you back?",
        options: ["The science", "Progression", "Habit"],
        required: true,
      },
    ],
  },
  // ── Mechanic loop surveys ────────────────────────────────────────────────
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
    id: "mechanic_satellite_loop_v1",
    title: "Satellite Ops",
    subtitle: "Feedback on cloud tracking.",
    triggerSurface: "game",
    questions: [
      {
        id: "ui",
        prompt: "Interface clarity",
        options: ["Cluttered", "Clear", "Intuitive"],
        required: true,
      },
    ],
  },
  {
    id: "mechanic_solar_loop_v1",
    title: "Solar Array",
    subtitle: "Energy collection efficiency.",
    triggerSurface: "game",
    questions: [
      {
        id: "complexity",
        prompt: "Mechanic complexity",
        options: ["Too simple", "Just right", "Too complex"],
        required: true,
      },
    ],
  },
  {
    id: "feature_inventory_v1",
    title: "Cargo Bay",
    subtitle: "Inventory management feedback.",
    triggerSurface: "game",
    questions: [
      {
        id: "organization",
        prompt: "Item sorting",
        options: ["Messy", "Okay", "Organized"],
        required: true,
      },
    ],
  },
  {
    id: "feature_profile_v1",
    title: "Profile Card",
    subtitle: "Your sailor identity.",
    triggerSurface: "game",
    questions: [
      {
        id: "customization",
        prompt: "Customization options",
        options: ["Lacking", "Sufficient", "Plentiful"],
        required: true,
      },
    ],
  },
  {
    id: "feature_leaderboard_v1",
    title: "Rankings",
    subtitle: "Competitive drive check.",
    triggerSurface: "game",
    questions: [
      {
        id: "motivation",
        prompt: "Does this motivate you?",
        options: ["No", "Somewhat", "Yes!"],
        required: true,
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

export const SURVEY_DISPLAY_DELAY_MS = 5000; // Reduced for testing

export function surveyStorageKey(surveyId: string, userId: string): string {
  return `starsailors_mechanic_survey_${surveyId}_${userId}_v1`;
}
