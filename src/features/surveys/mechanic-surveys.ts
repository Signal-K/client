import type { MechanicMicroSurvey, ProjectEngagementSurvey } from "@/src/features/surveys/types";

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
    minClassificationsRequired: 3,
    relevantClassificationTypes: ["planet", "telescope-tess", "telescope-minorPlanet"],
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
    minClassificationsRequired: 3,
    relevantClassificationTypes: ["rover"],
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
    minClassificationsRequired: 3,
    relevantClassificationTypes: ["cloud", "lidar-jovianVortexHunter"],
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
    minClassificationsRequired: 3,
    relevantClassificationTypes: ["telescope-sunspot"],
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

// ── Project engagement surveys ───────────────────────────────────────────────
// Shown when a user reaches the contribution threshold for a project,
// asking whether they'd like to try a dedicated standalone minigame.
// The user's Supabase UUID is captured in PostHog alongside the response.

export const PROJECT_ENGAGEMENT_SURVEYS: readonly ProjectEngagementSurvey[] = [
  {
    id: "project_engage_planet_hunters_v1",
    title: "Planet Hunter Alert",
    subtitle: "You've been busy finding planets — want to go further?",
    triggerSurface: "game",
    projectType: "planet-hunters",
    contributionThreshold: 5,
    questions: [
      {
        id: "dedicated_interest",
        prompt:
          "Would you play a dedicated planet-hunting game with mining, expeditions, and discoveries?",
        options: ["Not for me", "Maybe later", "Yes, sign me up"],
        required: true,
      },
    ],
  },
  {
    id: "project_engage_asteroid_hunting_v1",
    title: "Asteroid Tracker",
    subtitle: "Your asteroid discoveries are stacking up.",
    triggerSurface: "game",
    projectType: "asteroid-hunting",
    contributionThreshold: 5,
    questions: [
      {
        id: "dedicated_interest",
        prompt: "Would you play a specialised asteroid mining and tracking game?",
        options: ["Not for me", "Maybe later", "Yes, sign me up"],
        required: true,
      },
    ],
  },
  {
    id: "project_engage_rover_v1",
    title: "Rover Specialist",
    subtitle: "You have a knack for terrain navigation.",
    triggerSurface: "game",
    projectType: "rover",
    contributionThreshold: 5,
    questions: [
      {
        id: "dedicated_interest",
        prompt: "Would you try a dedicated rover navigation sim with real Mars terrain data?",
        options: ["Not for me", "Maybe later", "Yes, sign me up"],
        required: true,
      },
    ],
  },
  {
    id: "project_engage_cloudspotting_v1",
    title: "Cloud Analyst",
    subtitle: "Your atmosphere data is piling up.",
    triggerSurface: "game",
    projectType: "cloudspotting",
    contributionThreshold: 5,
    questions: [
      {
        id: "dedicated_interest",
        prompt: "Would you play a dedicated atmospheric science minigame?",
        options: ["Not for me", "Maybe later", "Yes, sign me up"],
        required: true,
      },
    ],
  },
  {
    id: "project_engage_sunspots_v1",
    title: "Solar Observer",
    subtitle: "You've logged significant solar data.",
    triggerSurface: "game",
    projectType: "sunspots",
    contributionThreshold: 5,
    questions: [
      {
        id: "dedicated_interest",
        prompt: "Would you play a dedicated solar observation game with real SOHO data?",
        options: ["Not for me", "Maybe later", "Yes, sign me up"],
        required: true,
      },
    ],
  },
];
