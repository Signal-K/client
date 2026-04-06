/**
 * Level / XP / Rank system for Star Sailors.
 *
 * XP is earned through:
 *   - Citizen science classifications (varying XP by difficulty/rarity)
 *   - Mineral discoveries
 *   - Planet completions
 *   - Referrals
 *   - Research unlocks
 *
 * Ranks follow a naval/space-explorer progression consistent with the
 * station-command narrative.
 */

export interface Rank {
  level: number;
  title: string;
  subtitle: string;
  minXp: number;
  color: string;
  /** Tailwind gradient classes */
  gradient: string;
  /** Short narrative flavour text */
  lore: string;
  /** Icon name from lucide-react */
  icon: string;
}

export const RANKS: Rank[] = [
  {
    level: 1,
    title: "Signal Cadet",
    subtitle: "Level 1",
    minXp: 0,
    color: "text-muted-foreground",
    gradient: "from-slate-600 to-slate-500",
    lore: "First signals received. Station systems nominal. Your mission begins.",
    icon: "Radio",
  },
  {
    level: 2,
    title: "Observer",
    subtitle: "Level 2",
    minXp: 50,
    color: "text-sky-400",
    gradient: "from-sky-700 to-sky-500",
    lore: "Logs show consistent engagement. Instruments calibrated. Keep watching the skies.",
    icon: "Eye",
  },
  {
    level: 3,
    title: "Analyst",
    subtitle: "Level 3",
    minXp: 150,
    color: "text-teal-400",
    gradient: "from-teal-700 to-teal-500",
    lore: "Data quality exceeds baseline. HQ has flagged your contributions for review.",
    icon: "LineChart",
  },
  {
    level: 4,
    title: "Field Scientist",
    subtitle: "Level 4",
    minXp: 350,
    color: "text-green-400",
    gradient: "from-green-700 to-green-500",
    lore: "Three discoveries confirmed by secondary review. You're the real thing.",
    icon: "Microscope",
  },
  {
    level: 5,
    title: "Senior Researcher",
    subtitle: "Level 5",
    minXp: 700,
    color: "text-amber-400",
    gradient: "from-amber-700 to-amber-500",
    lore: "Citation count rising. Other sailors are asking for your methodology reports.",
    icon: "BookOpen",
  },
  {
    level: 6,
    title: "Mission Specialist",
    subtitle: "Level 6",
    minXp: 1200,
    color: "text-orange-400",
    gradient: "from-orange-700 to-orange-500",
    lore: "Station Commander notes: exceptional cross-mission versatility. Promoted.",
    icon: "Rocket",
  },
  {
    level: 7,
    title: "Navigator",
    subtitle: "Level 7",
    minXp: 2000,
    color: "text-violet-400",
    gradient: "from-violet-700 to-violet-500",
    lore: "Charting courses others haven't mapped. Navigation systems slaved to your input.",
    icon: "Navigation",
  },
  {
    level: 8,
    title: "Commander",
    subtitle: "Level 8",
    minXp: 3500,
    color: "text-purple-400",
    gradient: "from-purple-700 to-purple-500",
    lore: "Command authority granted. Station systems respond to your voice print.",
    icon: "Shield",
  },
  {
    level: 9,
    title: "Captain",
    subtitle: "Level 9",
    minXp: 6000,
    color: "text-pink-400",
    gradient: "from-pink-700 to-pink-500",
    lore: "Deep space anomalies bearing your name. The fleet follows your heading.",
    icon: "Star",
  },
  {
    level: 10,
    title: "Admiral",
    subtitle: "Level 10",
    minXp: 10000,
    color: "text-yellow-400",
    gradient: "from-yellow-600 to-yellow-400",
    lore: "Your data has changed what we know about the universe. Godspeed, Admiral.",
    icon: "Crown",
  },
];

/**
 * XP granted per classification type.
 * Higher XP for rarer, more complex, or more impactful tasks.
 */
export const XP_PER_CLASSIFICATION: Record<string, number> = {
  // Telescope missions
  planet: 15,
  "planet-inspection": 10,
  sunspot: 8,
  DiskDetective: 12,
  "telescope-minorPlanet": 10,
  galaxyZoo: 12,
  kilonovaSeeker: 20, // Most impactful — real-time transient detection
  spaceWarps: 15, // Gravitational lensing
  variableStar: 12,
  backyardWorlds: 14,
  // Satellite missions
  cloud: 8,
  "lidar-jovianVortexHunter": 10,
  "satellite-planetFour": 8,
  "balloon-marsCloudShapes": 8,
  // Rover missions
  "automaton-aiForMars": 10,
  // Default fallback
  default: 5,
};

/** XP for non-classification actions */
export const XP_ACTIONS = {
  mineralDiscovery: 25,
  planetCompletion: 50,
  referralSuccess: 30,
  researchUnlock: 15,
  firstClassification: 50, // Bonus for first-ever classification
  dailyStreak: 10,         // Streak bonus (once per day)
} as const;

/**
 * Calculate total XP from classification counts, minerals, and planet completions.
 */
export function calculateTotalXp(data: {
  classificationCounts: Record<string, number>;
  mineralDeposits: number;
  completedPlanets: number;
  referralCount: number;
  researchUnlocks: number;
}): number {
  let xp = 0;

  for (const [type, count] of Object.entries(data.classificationCounts)) {
    const xpEach = XP_PER_CLASSIFICATION[type] ?? XP_PER_CLASSIFICATION.default;
    xp += xpEach * count;
  }

  xp += data.mineralDeposits * XP_ACTIONS.mineralDiscovery;
  xp += data.completedPlanets * XP_ACTIONS.planetCompletion;
  xp += data.referralCount * XP_ACTIONS.referralSuccess;
  xp += data.researchUnlocks * XP_ACTIONS.researchUnlock;

  return Math.max(0, xp);
}

/**
 * Get the current rank for a given XP amount.
 */
export function getRankForXp(xp: number): Rank {
  let current = RANKS[0];
  for (const rank of RANKS) {
    if (xp >= rank.minXp) current = rank;
    else break;
  }
  return current;
}

/**
 * Get the next rank (or null if at max level).
 */
export function getNextRank(currentXp: number): Rank | null {
  const current = getRankForXp(currentXp);
  const idx = RANKS.findIndex((r) => r.level === current.level);
  return RANKS[idx + 1] ?? null;
}

/**
 * Get progress percentage towards the next rank.
 */
export function getProgressToNextRank(currentXp: number): number {
  const current = getRankForXp(currentXp);
  const next = getNextRank(currentXp);
  if (!next) return 100;

  const range = next.minXp - current.minXp;
  const earned = currentXp - current.minXp;
  return Math.min(100, Math.floor((earned / range) * 100));
}

/**
 * XP needed to reach the next rank.
 */
export function xpToNextRank(currentXp: number): number {
  const next = getNextRank(currentXp);
  if (!next) return 0;
  return Math.max(0, next.minXp - currentXp);
}

export interface LevelSummary {
  xp: number;
  rank: Rank;
  nextRank: Rank | null;
  progressPercent: number;
  xpToNext: number;
}

export function getLevelSummary(xp: number): LevelSummary {
  return {
    xp,
    rank: getRankForXp(xp),
    nextRank: getNextRank(xp),
    progressPercent: getProgressToNextRank(xp),
    xpToNext: xpToNextRank(xp),
  };
}
