import type { Project } from "@/types/Structures/telescope"
import { SpaceIcon as Planet, Sun, Asterisk, Disc } from "lucide-react"

// Telescope/space projects
export const projects: Project[] = [
  {
    id: "planet-hunters",
    name: "Planet Hunters",
    description: "Search for exoplanet candidates in stellar light curves",
    anomalyType: "exoplanet",
    completed: 23,
    total: 50,
    icon: <Planet className="h-5 w-5" />,
    color: "from-[#EBCB8B] to-[#D08770]",
    bgGradient: "linear-gradient(135deg, #EBCB8B, #D08770)",
  },
  {
    id: "sunspots",
    name: "Sunspots",
    description: "Identify and classify solar surface features",
    anomalyType: "sunspot",
    completed: 45,
    total: 60,
    icon: <Sun className="h-5 w-5" />,
    color: "from-[#D08770] to-[#BF616A]",
    bgGradient: "linear-gradient(135deg, #D08770, #BF616A)",
  },
  {
    id: "daily-minor-planet",
    name: "Daily Minor Planet",
    description: "Track and catalog asteroid movements",
    anomalyType: "asteroid",
    completed: 12,
    total: 30,
    icon: <Asterisk className="h-5 w-5" />,
    color: "from-[#B48EAD] to-[#81A1C1]",
    bgGradient: "linear-gradient(135deg, #B48EAD, #81A1C1)",
  },
  {
    id: "disk-detective",
    name: "DiskDetective",
    description: "Discover early solar systems and accretion discs",
    anomalyType: "accretion_disc",
    completed: 8,
    total: 25,
    icon: <Disc className="h-5 w-5" />,
    color: "from-[#88C0D0] to-[#5E81AC]",
    bgGradient: "linear-gradient(135deg, #88C0D0, #5E81AC)",
  },
];

// Rover/surface exploration projects
import { Mountain, Gem } from "lucide-react"

export const roverProjects = [
  {
    id: "geological-survey",
    name: "SeisCAM Geological Survey",
    description: "Analyze rock formations and geological structures on planetary surfaces",
    icon: <Mountain className="h-4 w-4" />,
    bgGradient: "linear-gradient(135deg, #8D6E63 0%, #5D4037 100%)",
    color: "#8D6E63",
    anomalyTypes: ["rock_formation", "geological_feature"],
  },
  {
    id: "mineral-analysis",
    name: "SeisCAM Mineral Analysis",
    description: "Identify and catalog mineral deposits and rare earth elements",
    icon: <Gem className="h-4 w-4" />,
    bgGradient: "linear-gradient(135deg, #7E57C2 0%, #512DA8 100%)",
    color: "#7E57C2",
    anomalyTypes: ["mineral_deposit", "dust_storm"],
  },
]