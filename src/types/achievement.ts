export type ClassificationType =
  | "DiskDetective"
  | "automaton-aiForMars"
  | "balloon-marsCloudShapes"
  | "cloud"
  | "lidar-jovianVortexHunter"
  | "planet"
  | "planet-inspection"
  | "sunspot"
  | "satellite-planetFour";

export type MilestoneTier = 1 | 5 | 10 | 25;

export interface ClassificationAchievement {
  type: "classification";
  classificationType: ClassificationType;
  count: number;
  milestones: {
    tier: MilestoneTier;
    isUnlocked: boolean;
  }[];
}

interface MineralDepositAchievement {
  type: "mineral-deposit";
  count: number;
  milestones: {
    tier: MilestoneTier;
    isUnlocked: boolean;
  }[];
}

interface PlanetCompletionAchievement {
  type: "planet-completion";
  count: number;
  milestones: {
    tier: MilestoneTier;
    isUnlocked: boolean;
  }[];
}

interface AllUpgradesProgress {
  type: "all-upgrades";
  total: number;
  unlocked: number;
  upgrades: {
    name: string;
    techType: string;
    isUnlocked: boolean;
  }[];
}

interface ClassificationDiversityProgress {
  type: "classification-diversity";
  total: number;
  completed: number;
  classifications: {
    type: ClassificationType;
    name: string;
    count: number;
    isComplete: boolean;
    route: string;
    hint: string;
  }[];
}

interface ResourceExtractionProgress {
  type: "resource-extraction";
  total: number;
  extracted: number;
  resources: {
    type: string;
    name: string;
    isExtracted: boolean;
  }[];
}

type Achievement =
  | ClassificationAchievement
  | MineralDepositAchievement
  | PlanetCompletionAchievement;

export interface AchievementProgress {
  classifications: ClassificationAchievement[];
  mineralDeposits: MineralDepositAchievement;
  planetCompletions: PlanetCompletionAchievement;
  totalUnlocked: number;
  totalAchievements: number;
}

interface MilestoneProgress {
  allUpgrades: AllUpgradesProgress;
  classificationDiversity: ClassificationDiversityProgress;
  resourceExtraction: ResourceExtractionProgress;
}

export const CLASSIFICATION_LABELS: Record<ClassificationType, string> = {
  DiskDetective: "Disk Detective",
  "automaton-aiForMars": "AI Mars Analyst",
  "balloon-marsCloudShapes": "Mars Cloud Mapper",
  cloud: "Cloud Spotter",
  "lidar-jovianVortexHunter": "Jovian Storm Chaser",
  planet: "Planet Hunter",
  "planet-inspection": "Planet Inspector",
  sunspot: "Solar Observer",
  "satellite-planetFour": "Mars Feature Finder",
};

export const MILESTONE_TIERS: MilestoneTier[] = [1, 5, 10, 25];

export const ALL_RESEARCH_UPGRADES = [
  { techType: "probereceptors", name: "Telescope Receptors" },
  { techType: "satellitecount", name: "Satellite Count" },
  { techType: "roverwaypoints", name: "Rover Waypoints" },
  { techType: "spectroscopy", name: "Spectroscopy" },
  { techType: "findMinerals", name: "Find Minerals" },
  { techType: "p4Minerals", name: "Planet Four Minerals" },
  { techType: "roverExtraction", name: "Rover Extraction" },
  { techType: "satelliteExtraction", name: "Satellite Extraction" },
  { techType: "ngtsAccess", name: "NGTS Access" },
];

export const CLASSIFICATION_ROUTES: Record<ClassificationType, { route: string; hint: string }> = {
  "DiskDetective": { route: "/app/projects/disk-detective", hint: "Use the Disk Detective telescope project" },
  "automaton-aiForMars": { route: "/app/projects/ai-for-mars", hint: "Analyze Mars terrain with AI" },
  "balloon-marsCloudShapes": { route: "/app/projects/mars-cloud-shapes", hint: "Classify Mars cloud formations" },
  "cloud": { route: "/app/projects/cloudspotting", hint: "Spot clouds on Mars" },
  "lidar-jovianVortexHunter": { route: "/app/projects/jovian-vortex-hunter", hint: "Hunt for vortices on Jupiter" },
  "planet": { route: "/viewports/telescope", hint: "Discover and classify planets using your telescope" },
  "planet-inspection": { route: "/viewports/satellite", hint: "Deploy satellites to inspect planets" },
  "sunspot": { route: "/app/projects/sunspots", hint: "Observe and classify sunspots" },
  "satellite-planetFour": { route: "/app/projects/planet-four", hint: "Study Mars surface features" },
};

export const ALL_MINERAL_TYPES = [
  "Iron Oxide",
  "Silicate",
  "Carbonates",
  "Sulfates",
  "Hydrated Minerals",
  "Olivine",
  "Pyroxene",
  "dust",
  "soil",
  "water-vapour",
  "water-ice",
  "co2-ice",
  "metallic-hydrogen",
  "metallic-helium",
  "methane",
  "ammonia",
];
