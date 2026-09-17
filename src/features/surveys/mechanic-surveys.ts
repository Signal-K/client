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
    title: "Session Resumed",
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
    minClassificationsRequired: 1,
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
    subtitle: "User Identity Profile.",
    triggerSurface: "game",
    minClassificationsRequired: 1,
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

export const SURVEY_DISPLAY_DELAY_MS = 800;

export const PLAYTHROUGH_SURVEY_MIN = 3;
export const PLAYTHROUGH_SURVEY_MAX = 5;

export const MECHANIC_CLASSIFICATION_TYPES: Record<
  import("@/src/features/surveys/types").MechanicId,
  readonly string[]
> = {
  telescope: ["planet", "telescope-tess", "telescope-minorPlanet"],
  satellite: ["cloud", "lidar-jovianVortexHunter"],
  rover: ["rover"],
  solar: ["telescope-sunspot", "sunspot"],
  inventory: [],
};

export const MECHANIC_QUESTION_BANKS: Record<
  import("@/src/features/surveys/types").MechanicId,
  readonly import("@/src/features/surveys/types").MechanicQuestion[]
> = {
  telescope: [
    { id: "tel_what_v1", mechanicId: "telescope", coverage: "comprehension", prompt: "What were you just looking at?", options: ["A light-curve dip", "A planet photo", "Not sure"] },
    { id: "tel_next_v1", mechanicId: "telescope", coverage: "clarity", prompt: "Was the next action obvious?", options: ["No", "Mostly", "Yes"] },
    { id: "tel_sure_v1", mechanicId: "telescope", coverage: "confidence", prompt: "How sure were you of that mark?", options: ["Guessing", "Okay", "Confident"] },
    { id: "tel_pace_v1", mechanicId: "telescope", coverage: "pace", prompt: "How did this pass feel?", options: ["Too slow", "Fine", "Rushed"] },
    { id: "tel_hop_v1", mechanicId: "telescope", coverage: "intent", prompt: "Would you fly a longer planet-hunting mission?", options: ["Not now", "Maybe", "Yes"] },
    { id: "tel_data_v1", mechanicId: "telescope", coverage: "comprehension", prompt: "Did the plot mean something to you?", options: ["No idea", "Sort of", "I know what a transit is"] },
    { id: "tel_ui_v1", mechanicId: "telescope", coverage: "clarity", prompt: "Could you tell signal from noise?", options: ["No", "With effort", "Easily"] },
    { id: "tel_again_v1", mechanicId: "telescope", coverage: "intent", prompt: "Would you classify another target?", options: ["Done for now", "One more", "Keep going"] },
  ],
  satellite: [
    { id: "sat_what_v1", mechanicId: "satellite", coverage: "comprehension", prompt: "What were you tagging?", options: ["Clouds / atmosphere", "The planet itself", "Not sure"] },
    { id: "sat_next_v1", mechanicId: "satellite", coverage: "clarity", prompt: "Was the tagging step obvious?", options: ["No", "Mostly", "Yes"] },
    { id: "sat_sure_v1", mechanicId: "satellite", coverage: "confidence", prompt: "How sure were those labels?", options: ["Guessing", "Okay", "Confident"] },
    { id: "sat_pace_v1", mechanicId: "satellite", coverage: "pace", prompt: "Downlink pace", options: ["Too slow", "Fine", "Rushed"] },
    { id: "sat_hop_v1", mechanicId: "satellite", coverage: "intent", prompt: "Would you run a dedicated atmosphere mission?", options: ["Not now", "Maybe", "Yes"] },
    { id: "sat_map_v1", mechanicId: "satellite", coverage: "clarity", prompt: "Could you read the map / image?", options: ["Unclear", "Usable", "Clear"] },
    { id: "sat_again_v1", mechanicId: "satellite", coverage: "intent", prompt: "Another orbital pass?", options: ["Done", "One more", "Keep going"] },
  ],
  rover: [
    { id: "rov_what_v1", mechanicId: "rover", coverage: "comprehension", prompt: "What was the rover asking you to do?", options: ["Label terrain", "Drive somewhere", "Not sure"] },
    { id: "rov_next_v1", mechanicId: "rover", coverage: "clarity", prompt: "Was the next waypoint obvious?", options: ["No", "Mostly", "Yes"] },
    { id: "rov_sure_v1", mechanicId: "rover", coverage: "confidence", prompt: "How sure were those terrain labels?", options: ["Guessing", "Okay", "Confident"] },
    { id: "rov_pace_v1", mechanicId: "rover", coverage: "pace", prompt: "Drive / classify pace", options: ["Too slow", "Fine", "Rushed"] },
    { id: "rov_hop_v1", mechanicId: "rover", coverage: "intent", prompt: "Would you take a longer rover outing?", options: ["Not now", "Maybe", "Yes"] },
    { id: "rov_ctrl_v1", mechanicId: "rover", coverage: "clarity", prompt: "Did the controls make sense?", options: ["Clunky", "Usable", "Natural"] },
    { id: "rov_again_v1", mechanicId: "rover", coverage: "intent", prompt: "Another traverse?", options: ["Dock", "One more", "Keep going"] },
  ],
  solar: [
    { id: "sol_what_v1", mechanicId: "solar", coverage: "comprehension", prompt: "What were you counting?", options: ["Sunspots / active regions", "The whole Sun", "Not sure"] },
    { id: "sol_next_v1", mechanicId: "solar", coverage: "clarity", prompt: "Was the count step obvious?", options: ["No", "Mostly", "Yes"] },
    { id: "sol_sure_v1", mechanicId: "solar", coverage: "confidence", prompt: "How sure was that count?", options: ["Guessing", "Okay", "Confident"] },
    { id: "sol_pace_v1", mechanicId: "solar", coverage: "pace", prompt: "Watch pace", options: ["Too slow", "Fine", "Rushed"] },
    { id: "sol_hop_v1", mechanicId: "solar", coverage: "intent", prompt: "Would you run a dedicated solar watch?", options: ["Not now", "Maybe", "Yes"] },
    { id: "sol_img_v1", mechanicId: "solar", coverage: "clarity", prompt: "Could you see the active regions?", options: ["Too faint", "Usable", "Clear"] },
    { id: "sol_again_v1", mechanicId: "solar", coverage: "intent", prompt: "Another capture?", options: ["Done", "One more", "Keep going"] },
  ],
  inventory: [
    { id: "inv_what_v1", mechanicId: "inventory", coverage: "comprehension", prompt: "Do you know what this cargo is for?", options: ["No", "Sort of", "Yes"] },
    { id: "inv_next_v1", mechanicId: "inventory", coverage: "clarity", prompt: "Can you find what you need?", options: ["No", "With effort", "Easily"] },
    { id: "inv_sure_v1", mechanicId: "inventory", coverage: "confidence", prompt: "Does this inventory feel like yours?", options: ["Random", "Okay", "Mine"] },
    { id: "inv_pace_v1", mechanicId: "inventory", coverage: "pace", prompt: "Sorting this stash", options: ["Tedious", "Fine", "Quick"] },
    { id: "inv_hop_v1", mechanicId: "inventory", coverage: "intent", prompt: "Would you bring this cargo into another game?", options: ["Not needed", "Maybe", "Yes"] },
  ],
};

export function surveyStorageKey(surveyId: string, userId: string): string {
  return `starsailors_mechanic_survey_${surveyId}_${userId}_v1`;
}

export function playthroughStorageKey(userId: string, mechanicId: string): string {
  return `starsailors_playthrough_${mechanicId}_${userId}_v1`;
}

export function pickPlaythroughQuota(random: () => number = Math.random): number {
  return (
    PLAYTHROUGH_SURVEY_MIN +
    Math.floor(random() * (PLAYTHROUGH_SURVEY_MAX - PLAYTHROUGH_SURVEY_MIN + 1))
  );
}

export function shuffleInPlace<T>(items: T[], random: () => number = Math.random): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const tmp = items[i];
    items[i] = items[j];
    items[j] = tmp;
  }
  return items;
}

export function samplePlaythroughQuestions(
  mechanicId: import("@/src/features/surveys/types").MechanicId,
  quota: number,
  alreadyUsedIds: readonly string[] = [],
  random: () => number = Math.random,
): import("@/src/features/surveys/types").MechanicQuestion[] {
  const bank = MECHANIC_QUESTION_BANKS[mechanicId] ?? [];
  const unused = bank.filter((q) => !alreadyUsedIds.includes(q.id));
  const pool = unused.length >= quota ? unused : [...bank];
  return shuffleInPlace([...pool], random).slice(0, Math.min(quota, pool.length));
}

// ── Project engagement surveys ───────────────────────────────────────────────
// Shown when a user reaches the contribution threshold for a project,
// asking whether they'd like to try a dedicated standalone minigame.
// The user's Clerk id is captured in PostHog alongside the response.

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
