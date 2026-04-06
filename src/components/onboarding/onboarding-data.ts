import { Telescope, Car, Satellite, Sun, Target } from "lucide-react";
import { ProjectType } from "@/src/hooks/useUserPreferences";

export const PROJECTS = [
  {
    id: "planet-hunting" as ProjectType,
    name: "Planet Hunting",
    icon: Telescope,
    color: "text-teal-400",
    bg: "bg-teal-500/10",
    border: "border-teal-500/30",
    glow: "glow-teal",
    structure: "Telescope",
    description: "Search for dips in light from distant stars using TESS data. Discover new worlds."
  },
  {
    id: "asteroid-hunting" as ProjectType,
    name: "Asteroid Hunting",
    icon: Target,
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
    glow: "glow-orange",
    structure: "Telescope",
    description: "Track near-Earth asteroids and minor planets. Flag potential hazards before they go unnoticed."
  },
  {
    id: "solar-monitoring" as ProjectType,
    name: "Solar Monitoring",
    icon: Sun,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
    glow: "glow-yellow",
    structure: "Solar Observatory",
    description: "Count sunspots and classify active regions using live SDO imagery. Watch our star breathe."
  },
  {
    id: "rover-training" as ProjectType,
    name: "Rover Training",
    icon: Car,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    glow: "glow-amber",
    structure: "Rover",
    description: "Analyse Martian terrain images to help autonomous rovers navigate safely."
  },
  {
    id: "cloud-tracking" as ProjectType,
    name: "Cloud Spotting",
    icon: Satellite,
    color: "text-sky-400",
    bg: "bg-sky-500/10",
    border: "border-sky-500/30",
    glow: "glow-sky",
    structure: "Satellite",
    description: "Track Martian clouds and Jovian vortices using orbital imagery. Map planetary weather."
  }
];

export const SETUP_MAP: Record<string, string> = {
  "planet-hunting": "/setup/telescope",
  "rover-training": "/setup/rover",
  "cloud-tracking": "/setup/satellite",
  "asteroid-hunting": "/setup/telescope",
  "ice-tracking": "/setup/satellite",
  "solar-monitoring": "/setup/solar"
};
