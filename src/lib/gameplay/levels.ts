/**
 * Level / XP system for Star Sailors.
 *
 * XP is earned through:
 *   - Citizen science classifications
 *   - Mineral discoveries
 *   - Planet completions
 *   - Referrals
 *   - Research unlocks
 */

export interface Rank {
  level: number;
  title: string;
  subtitle: string;
  minXp: number;
  color: string;
  /** Tailwind gradient classes */
  gradient: string;
  /** Technical status or milestone text */
  lore: string;
  /** Icon name from lucide-react */
  icon: string;
}

export const RANKS: Rank[] = [
  {
    level: 1,
    title: "Level 1",
    subtitle: "Baseline",
    minXp: 0,
    color: "text-muted-foreground",
    gradient: "from-slate-600 to-slate-500",
    lore: "Systems online. Initializing data collection protocol.",
    icon: "Radio",
  },
  {
    level: 2,
    title: "Level 2",
    subtitle: "Initialized",
    minXp: 50,
    color: "text-sky-400",
    gradient: "from-sky-700 to-sky-500",
    lore: "Calibration complete. Data ingestion within normal parameters.",
    icon: "Eye",
  },
  {
    level: 3,
    title: "Level 3",
    subtitle: "Verified",
    minXp: 150,
    color: "text-teal-400",
    gradient: "from-teal-700 to-teal-500",
    lore: "Threshold reached. Analysis quality exceeds standard baseline.",
    icon: "LineChart",
  },
  {
    level: 4,
    title: "Level 4",
    subtitle: "Advanced",
    minXp: 350,
    color: "text-green-400",
    gradient: "from-green-700 to-green-500",
    lore: "Multiple discoveries confirmed via peer-review protocols.",
    icon: "Microscope",
  },
  {
    level: 5,
    title: "Level 5",
    subtitle: "Expert",
    minXp: 700,
    color: "text-amber-400",
    gradient: "from-amber-700 to-amber-500",
    lore: "Metadata consistency high. Advanced research access enabled.",
    icon: "BookOpen",
  },
  {
    level: 6,
    title: "Level 6",
    subtitle: "Lead",
    minXp: 1200,
    color: "text-orange-400",
    gradient: "from-orange-700 to-orange-500",
    lore: "Cross-mission versatility demonstrated. Coordinating complex datasets.",
    icon: "Rocket",
  },
  {
    level: 7,
    title: "Level 7",
    subtitle: "Distinguished",
    minXp: 2000,
    color: "text-violet-400",
    gradient: "from-violet-700 to-violet-500",
    lore: "Mapping anomalies in high-resolution sectors.",
    icon: "Navigation",
  },
  {
    level: 8,
    title: "Level 8",
    subtitle: "Principal",
    minXp: 3500,
    color: "text-purple-400",
    gradient: "from-purple-700 to-purple-500",
    lore: "Directing large-scale research streams. System throughput maximized.",
    icon: "Shield",
  },
  {
    level: 9,
    title: "Level 9",
    subtitle: "Elite",
    minXp: 6000,
    color: "text-pink-400",
    gradient: "from-pink-700 to-pink-500",
    lore: "Significant scientific impact. System integrity and accuracy high.",
    icon: "Star",
  },
  {
    level: 10,
    title: "Level 10",
    subtitle: "Master",
    minXp: 10000,
    color: "text-yellow-400",
    gradient: "from-yellow-600 to-yellow-400",
    lore: "Full system mastery. Critical contribution to global knowledge base.",
    icon: "Crown",
  },
];

/**
 * XP granted per classification type.
 */
export const XP_PER_CLASSIFICATION: Record<string, number> = {
  planet: 15,
  "planet-inspection": 10,
  sunspot: 8,
  DiskDetective: 12,
  "telescope-minorPlanet": 10,
  galaxyZoo: 12,
  kilonovaSeeker: 20,
  spaceWarps: 15,
  variableStar: 12,
  backyardWorlds: 14,
  cloud: 8,
  "lidar-jovianVortexHunter": 10,
  "satellite-planetFour": 8,
  "balloon-marsCloudShapes": 8,
  "automaton-aiForMars": 10,
  default: 5,
};

export const XP_ACTIONS = {
  mineralDiscovery: 25,
  planetCompletion: 50,
  referralSuccess: 30,
  researchUnlock: 15,
  firstClassification: 50,
  dailyStreak: 10,
} as const;

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

export function getRankForXp(xp: number): Rank {
  let current = RANKS[0];
  for (const rank of RANKS) {
    if (xp >= rank.minXp) current = rank;
    else break;
  }
  return current;
}

export function getNextRank(currentXp: number): Rank | null {
  const current = getRankForXp(currentXp);
  const idx = RANKS.findIndex((r) => r.level === current.level);
  return RANKS[idx + 1] ?? null;
}

export function getProgressToNextRank(currentXp: number): number {
  const current = getRankForXp(currentXp);
  const next = getNextRank(currentXp);
  if (!next) return 100;
  const range = next.minXp - current.minXp;
  const earned = currentXp - current.minXp;
  return Math.min(100, Math.floor((earned / range) * 100));
}

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
