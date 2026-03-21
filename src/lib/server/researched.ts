import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/server/prisma";

export const QUANTITY_UPGRADES = ["probereceptors", "satellitecount", "roverwaypoints"] as const;

export type ResearchTechType = string;

export interface ResearchedEntry {
  tech_type: string;
  created_at: string | null;
}

export interface ResearchedProgress {
  entries: ResearchedEntry[];
  techTypes: ResearchTechType[];
  techSet: Set<ResearchTechType>;
  spent: number;
}

function techCost(techType: string) {
  return QUANTITY_UPGRADES.includes(techType as (typeof QUANTITY_UPGRADES)[number]) ? 10 : 2;
}

export async function getResearchedProgressForUser(userId: string): Promise<ResearchedProgress> {
  const rows = await prisma.researched.findMany({
    where: { userId },
    select: {
      id: true,
      techType: true,
      createdAt: true,
    },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
  });

  const techTypes = rows.map((row) => row.techType).filter(Boolean);

  return {
    entries: rows.map((row) => ({
      tech_type: row.techType,
      created_at: row.createdAt?.toISOString() ?? null,
    })),
    techTypes,
    techSet: new Set(techTypes),
    spent: techTypes.reduce((total, techType) => total + techCost(techType), 0),
  };
}

export async function getSurveyBonusForUser(userId: string) {
  const surveyRewardTotals = await prisma.surveyReward.aggregate({
    where: { userId },
    _sum: { stardustGranted: true },
  });

  return surveyRewardTotals._sum.stardustGranted ?? 0;
}

export async function unlockTechForUser(userId: string, techType: string) {
  return prisma.researched.create({
    data: {
      userId,
      techType,
    },
  });
}

export function isPrismaUniqueConstraintError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}
