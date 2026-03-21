import { prisma } from "./prisma";

export async function getActiveSailors(): Promise<number> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const result = await prisma.classification.findMany({
    where: { createdAt: { gte: since }, author: { not: null } },
    select: { author: true },
    distinct: ["author"],
  });
  return result.length;
}

export async function getTotalDiscoveries(): Promise<number> {
  return prisma.classification.count();
}

export async function getActiveProjects(): Promise<number> {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const result = await prisma.classification.findMany({
    where: { createdAt: { gte: since }, classificationtype: { not: null } },
    select: { classificationtype: true },
    distinct: ["classificationtype"],
  });
  return result.length;
}
