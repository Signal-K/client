import type { Mission } from "@/types/Structures/telescope"
import { Sparkles, Sun, Rocket, Award } from "lucide-react"

// Telescope missions
export const missions: Mission[] = [
  {
    id: "mission-1",
    // title: "First Light",
    description: "Classify your first exoplanet candidate",
    project: "planet-hunters",
    reward: "100 XP",
    // difficulty: "easy",
    completed: true,
    target: undefined,
    name: "",
    progress: 0
  },
  {
    id: "mission-2",
    // title: "Solar Observer",
    description: "Classify 5 sunspots in a single session",
    project: "sunspots",
    reward: "250 XP",
    // difficulty: "medium",
    completed: false,
    target: undefined,
    name: "",
    progress: 0
  },
  {
    id: "mission-3",
    // title: "Asteroid Hunter",
    description: "Find an asteroid with unusual trajectory",
    project: "daily-minor-planet",
    reward: "300 XP + Badge",
    // difficulty: "hard",
    completed: false,
    target: undefined,
    name: "",
    progress: 0
  },
  {
    id: "mission-4",
    // title: "Disc Jockey",
    description: "Classify 3 accretion discs",
    project: "disk-detective",
    reward: "200 XP",
    // difficulty: "medium",
    completed: false,
    target: undefined,
    name: "",
    progress: 0
  },
  {
    id: "mission-5",
    // title: "Exoplanet Explorer",
    description: "Classify exoplanets in 3 different sectors",
    project: "planet-hunters",
    reward: "350 XP",
    // difficulty: "hard",
    completed: false,
    target: undefined,
    name: "",
    progress: 0
  },
  {
    id: "mission-6",
    // title: "Solar Cartographer",
    description: "Create a map of sunspot activity",
    project: "sunspots",
    reward: "200 XP",
    // difficulty: "medium",
    completed: false,
    target: undefined,
    name: "",
    progress: 0
  },
]

// Base anomalies with just essential properties
export const baseAnomalies: { [key: string]: Array<{ id: string; name: string; type: string; project: string }> } = {
  "planet-hunters": Array.from({ length: 20 }, (_, i) => ({
    id: `exoplanet-${i + 1}`,
    name: `EXOPLANET-${String(i + 1).padStart(3, "0")}`,
    type: "exoplanet",
    project: "planet-hunters",
  })),
  sunspots: Array.from({ length: 20 }, (_, i) => ({
    id: `sunspot-${i + 1}`,
    name: `SUNSPOT-${String(i + 1).padStart(3, "0")}`,
    type: "sunspot",
    project: "sunspots",
  })),
  "daily-minor-planet": Array.from({ length: 20 }, (_, i) => ({
    id: `asteroid-${i + 1}`,
    name: `ASTEROID-${String(i + 1).padStart(3, "0")}`,
    type: "asteroid",
    project: "daily-minor-planet",
  })),
  "disk-detective": Array.from({ length: 20 }, (_, i) => ({
    id: `accretion_disc-${i + 1}`,
    name: `ACCRETION_DISC-${String(i + 1).padStart(3, "0")}`,
    type: "accretion_disc",
    project: "disk-detective",
  })),
};


// Rover-seiscam (automaton) missions
import { Mountain, Wind, Gem, Target, Search, MapPin, Zap } from "lucide-react";
import type { RoverMission } from "@/types/Structures/Rover";

export const roverMissions = [
  // SeisCAM Geological Survey Missions
  {
    id: "geological-survey-1",
    title: "Surface Rock Analysis",
    description: "Collect and analyze 5 different rock formation samples",
    project: "geological-survey",
    icon: <Mountain className="h-4 w-4" />,
    difficulty: "easy" as const,
    reward: "50 Credits",
    completed: false,
  },
  {
    id: "geological-survey-2",
    title: "Crater Investigation",
    description: "Map geological features around impact craters",
    project: "geological-survey",
    icon: <Search className="h-4 w-4" />,
    difficulty: "medium" as const,
    reward: "100 Credits",
    completed: false,
  },
  {
    id: "geological-survey-3",
    title: "Terrain Mapping",
    description: "Create detailed topographical maps of unexplored regions",
    project: "geological-survey",
    icon: <Mountain className="h-4 w-4" />,
    difficulty: "hard" as const,
    reward: "200 Credits",
    completed: false,
  },

  // SeisCAM Mineral Analysis Missions
  {
    id: "mineral-analysis-1",
    title: "Rare Earth Detection",
    description: "Locate and identify rare earth mineral deposits",
    project: "mineral-analysis",
    icon: <Gem className="h-4 w-4" />,
    difficulty: "easy" as const,
    reward: "75 Credits",
    completed: false,
  },
  {
    id: "mineral-analysis-2",
    title: "Subsurface Scanning",
    description: "Use seismic analysis to detect underground mineral veins",
    project: "mineral-analysis",
    icon: <Zap className="h-4 w-4" />,
    difficulty: "medium" as const,
    reward: "150 Credits",
    completed: false,
  },
  {
    id: "mineral-analysis-3",
    title: "Composition Analysis",
    description: "Perform detailed spectral analysis of mineral samples",
    project: "mineral-analysis",
    icon: <Gem className="h-4 w-4" />,
    difficulty: "hard" as const,
    reward: "250 Credits",
    completed: false,
  },
];