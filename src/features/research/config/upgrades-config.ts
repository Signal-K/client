export type UpgradeCategory = "telescope" | "satellite" | "rover";
export type UpgradeSubcategory = "equipment" | "project" | "mining";

export interface ResearchUpgrade {
  id: string;
  techType: string;
  title: string;
  description: string;
  category: UpgradeCategory;
  subcategory: UpgradeSubcategory;
  cost: number;
  max?: number;
  getRequirement?: (data: any) => { isLocked: boolean; text?: string };
  getCurrent?: (upgrades: any) => number;
  isUnlocked?: (upgrades: any) => boolean;
}

export const UPGRADES_CONFIG: ResearchUpgrade[] = [
  // EQUIPMENT UPGRADES
  {
    id: "telescope-receptors",
    techType: "probereceptors",
    title: "Telescope Receptors",
    description: "Extend your telescope's receptors to see deeper dips in lightcurves, revealing hidden anomalies. Increases anomaly detection by 2 per scan.",
    category: "telescope",
    subcategory: "equipment",
    cost: 10,
    max: 2,
    getCurrent: (upgrades) => upgrades.telescopeReceptors,
  },
  {
    id: "satellite-count",
    techType: "satellitecount",
    title: "Additional Satellite",
    description: "Deploy an additional weather satellite to your fleet for enhanced planetary coverage. Increases observation capacity across multiple worlds.",
    category: "satellite",
    subcategory: "equipment",
    cost: 10,
    max: 2,
    getCurrent: (upgrades) => upgrades.satelliteCount,
  },
  {
    id: "rover-waypoints",
    techType: "roverwaypoints",
    title: "Rover Navigation System",
    description: "Upgrade your rover's navigation system to support 2 additional waypoints (total 6). Allows for more complex exploration routes and increased discovery potential.",
    category: "rover",
    subcategory: "equipment",
    cost: 10,
    max: 6, // The API returns the actual count (4, 6)
    getCurrent: (upgrades) => upgrades.roverWaypoints,
  },

  // PROJECT/DATA UPGRADES
  {
    id: "spectroscopy",
    techType: "spectroscopy",
    title: "Spectroscopy Data",
    description: "Access detailed atmospheric composition data from telescope observations of planets. Unlock spectroscopic analysis for enhanced planetary characterization.",
    category: "telescope",
    subcategory: "project",
    cost: 2,
    isUnlocked: (upgrades) => upgrades.spectroscopyUnlocked,
  },
  {
    id: "ngtsAccess",
    techType: "ngtsAccess",
    title: "Planet Hunters: Next Generation",
    description: "Unlock access to NGTS (Next-Generation Transit Survey) data from ESO's robotic telescope array in Chile. Detect exoplanet transits with high-precision measurements for mass and composition analysis.",
    category: "telescope",
    subcategory: "project",
    cost: 2,
    getRequirement: (data) => ({
      isLocked: (data.counts.planet || 0) < 4,
      text: (data.counts.planet || 0) < 4 ? `${data.counts.planet || 0}/4 planet classifications` : undefined,
    }),
    isUnlocked: (upgrades) => upgrades.ngtsAccessUnlocked,
  },

  // MINING UPGRADES
  {
    id: "findMinerals",
    techType: "findMinerals",
    title: "Find Mineral Deposits",
    description: "Your rovers can now detect and locate mineral and soil deposits during AI4Mars terrain surveys. Enables future extraction of iron oxide, silicates, and other valuable resources.",
    category: "rover",
    subcategory: "mining",
    cost: 2,
    isUnlocked: (upgrades) => upgrades.findMineralsUnlocked,
  },
  {
    id: "p4Minerals",
    techType: "p4Minerals",
    title: "Find Icy Deposits",
    description: "Your satellites can now identify and track water & CO2-ice sources through Planet Four and Cloudspotting missions. Combine sublimation data with cloud patterns for precise ice location.",
    category: "satellite",
    subcategory: "mining",
    cost: 2,
    isUnlocked: (upgrades) => upgrades.p4MineralsUnlocked,
  },
  {
    id: "roverExtraction",
    techType: "roverExtraction",
    title: "Rover Mineral Extraction",
    description: "Equip your rovers with drilling and excavation tools to extract mineral deposits from the Martian surface. Unlock active harvesting of iron ore, silicates, and other resources.",
    category: "rover",
    subcategory: "mining",
    cost: 2,
    getRequirement: (data) => ({
      isLocked: !data.upgrades.findMineralsUnlocked,
      text: !data.upgrades.findMineralsUnlocked ? "Requires Mineral Detection" : undefined,
    }),
    isUnlocked: (upgrades) => upgrades.roverExtractionUnlocked,
  },
  {
    id: "satelliteExtraction",
    techType: "satelliteExtraction",
    title: "Atmospheric Resource Collection",
    description: "Deploy atmospheric collectors and spectral analysis equipment to your satellites. Extract water ice, CO2 ice, and atmospheric vapours from exoplanets.",
    category: "satellite",
    subcategory: "mining",
    cost: 2,
    getRequirement: (data) => ({
      isLocked: !data.upgrades.p4MineralsUnlocked,
      text: !data.upgrades.p4MineralsUnlocked ? "Requires Ice Detection" : undefined,
    }),
    isUnlocked: (upgrades) => upgrades.satelliteExtractionUnlocked,
  },
];
