import type { Mission } from "@/types/Structures/telescope"
import { Sparkles, Sun, Rocket, Award } from "lucide-react"

// Sample missions with icons
export const missions: Mission[] = [
  {
    id: "mission-1",
    title: "First Light",
    description: "Classify your first exoplanet candidate",
    project: "planet-hunters",
    reward: "100 XP",
    difficulty: "easy",
    completed: true,
    icon: <Sparkles className="h-5 w-5 text-[#EBCB8B]" />,
  },
  {
    id: "mission-2",
    title: "Solar Observer",
    description: "Classify 5 sunspots in a single session",
    project: "sunspots",
    reward: "250 XP",
    difficulty: "medium",
    completed: false,
    icon: <Sun className="h-5 w-5 text-[#D08770]" />,
  },
  {
    id: "mission-3",
    title: "Asteroid Hunter",
    description: "Find an asteroid with unusual trajectory",
    project: "daily-minor-planet",
    reward: "300 XP + Badge",
    difficulty: "hard",
    completed: false,
    icon: <Rocket className="h-5 w-5 text-[#B48EAD]" />,
  },
  {
    id: "mission-4",
    title: "Disc Jockey",
    description: "Classify 3 accretion discs",
    project: "disk-detective",
    reward: "200 XP",
    difficulty: "medium",
    completed: false,
    icon: <Award className="h-5 w-5 text-[#88C0D0]" />,
  },
  {
    id: "mission-5",
    title: "Exoplanet Explorer",
    description: "Classify exoplanets in 3 different sectors",
    project: "planet-hunters",
    reward: "350 XP",
    difficulty: "hard",
    completed: false,
    icon: <Sparkles className="h-5 w-5 text-[#EBCB8B]" />,
  },
  {
    id: "mission-6",
    title: "Solar Cartographer",
    description: "Create a map of sunspot activity",
    project: "sunspots",
    reward: "200 XP",
    difficulty: "medium",
    completed: false,
    icon: <Sun className="h-5 w-5 text-[#D08770]" />,
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
}
