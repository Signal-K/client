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
// baseAnomalies removed (unused)


// Rover-seiscam (automaton) missions
import { Mountain, Wind, Gem, Target, Search, MapPin, Zap } from "lucide-react";
import type { RoverMission } from "@/types/Structures/Rover";

// roverMissions removed (unused)