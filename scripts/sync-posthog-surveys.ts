import axios from "axios";

// Inlined survey data to avoid import resolution issues in standalone script
const MECHANIC_SURVEYS = [
  {
    id: "mechanic_telescope_loop_v1",
    title: "Telescope Debrief",
    subtitle: "How did the detection loop feel this run?",
    triggerSurface: "game",
    questions: [
      { id: "pace", prompt: "Telescope mission pace", options: ["Too slow", "Balanced", "Too fast"], required: true },
      { id: "clarity", prompt: "Signal clarity", options: ["Confusing", "Okay", "Crystal clear"], required: false },
    ],
  },
  {
    id: "mechanic_rover_loop_v1",
    title: "Rover Debrief",
    subtitle: "Quick systems check from your terrain run.",
    triggerSurface: "game",
    questions: [
      { id: "control", prompt: "Rover control feel", options: ["Clunky", "Usable", "Excellent"], required: true },
      { id: "stakes", prompt: "Mission tension", options: ["Flat", "Good", "High"], required: false },
    ],
  },
  {
    id: "mechanic_satellite_loop_v1",
    title: "Satellite Ops",
    subtitle: "Feedback on cloud tracking.",
    triggerSurface: "game",
    questions: [
      { id: "ui", prompt: "Interface clarity", options: ["Cluttered", "Clear", "Intuitive"], required: true },
    ],
  },
  {
    id: "mechanic_solar_loop_v1",
    title: "Solar Array",
    subtitle: "Energy collection efficiency.",
    triggerSurface: "game",
    questions: [
      { id: "complexity", prompt: "Mechanic complexity", options: ["Too simple", "Just right", "Too complex"], required: true },
    ],
  },
  {
    id: "feature_inventory_v1",
    title: "Cargo Bay",
    subtitle: "Inventory management feedback.",
    triggerSurface: "game",
    questions: [
      { id: "organization", prompt: "Item sorting", options: ["Messy", "Okay", "Organized"], required: true },
    ],
  },
  {
    id: "feature_profile_v1",
    title: "Profile Card",
    subtitle: "Your sailor identity.",
    triggerSurface: "game",
    questions: [
      { id: "customization", prompt: "Customization options", options: ["Lacking", "Sufficient", "Plentiful"], required: true },
    ],
  },
  {
    id: "feature_leaderboard_v1",
    title: "Rankings",
    subtitle: "Competitive drive check.",
    triggerSurface: "game",
    questions: [
      { id: "motivation", prompt: "Does this motivate you?", options: ["No", "Somewhat", "Yes!"], required: true },
    ],
  },
  {
    id: "mechanic_ecosystem_minigame_v1",
    title: "Ecosystem Debrief",
    subtitle: "Which expansion should land first?",
    triggerSurface: "ecosystem",
    questions: [
      { id: "priority", prompt: "Next minigame priority", options: ["Mining prototype", "Planet hunter sim", "Guild contracts"], required: true },
      { id: "bridge", prompt: "Web <-> minigame connection", options: ["Light touch", "Shared rewards", "Full progression sync"], required: false },
    ],
  },
];

const API_KEY = process.env.POSTHOG_PERSONAL_API_KEY;
const PROJECT_ID = process.env.POSTHOG_PROJECT_ID;
const HOST = "https://us.posthog.com"; 

if (!API_KEY || !PROJECT_ID) {
  console.error("Missing POSTHOG_PERSONAL_API_KEY or POSTHOG_PROJECT_ID");
  process.exit(1);
}

async function syncSurveys() {
  console.log(`Syncing ${MECHANIC_SURVEYS.length} surveys to PostHog project ${PROJECT_ID}...`);

  try {
    const { data: existingSurveys } = await axios.get(
      `${HOST}/api/projects/${PROJECT_ID}/surveys/`,
      { headers: { Authorization: `Bearer ${API_KEY}` } }
    );

    console.log(`Found ${existingSurveys.results.length} existing surveys.`);

    for (const survey of MECHANIC_SURVEYS) {
      const existing = existingSurveys.results.find((s: any) => s.name === survey.title);

      const payload = {
        name: survey.title,
        description: survey.subtitle,
        type: "popover",
        questions: survey.questions.map((q) => ({
          type: "single_choice",
          question: q.prompt,
          choices: q.options,
        })),
        appearance: {
            backgroundColor: "#0f172a", // slate-900
            submitButtonColor: "#06b6d4", // cyan-500
            submitButtonText: "Send Data",
            displayState: "minimized"
        },
        conditions: null,
        start_date: new Date().toISOString(),
        end_date: null,
        archived: false,
      };

      if (existing) {
        console.log(`Updating survey: ${survey.title} (${existing.id})`);
        await axios.patch(
          `${HOST}/api/projects/${PROJECT_ID}/surveys/${existing.id}/`,
          payload,
          { headers: { Authorization: `Bearer ${API_KEY}` } }
        );
      } else {
        console.log(`Creating survey: ${survey.title}`);
        await axios.post(
          `${HOST}/api/projects/${PROJECT_ID}/surveys/`,
          payload,
          { headers: { Authorization: `Bearer ${API_KEY}` } }
        );
      }
    }

    console.log("Survey sync complete!");
  } catch (error: any) {
    console.error("Error syncing surveys:", error.response?.data || error.message);
    process.exit(1);
  }
}

syncSurveys();
