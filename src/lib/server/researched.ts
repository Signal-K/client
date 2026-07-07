import { createPocketbaseAdminClient } from "@/lib/pocketbase/adminClient";

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
  const pb = await createPocketbaseAdminClient();
  const rows = await pb.collection("researched").getFullList({
    filter: pb.filter("userId = {:id}", { id: userId }),
    sort: "+createdAt,+legacyId",
  });

  const techTypes = rows.map((row) => row.techType).filter(Boolean);

  return {
    entries: rows.map((row) => ({
      tech_type: row.techType,
      created_at: row.createdAt ?? null,
    })),
    techTypes,
    techSet: new Set(techTypes),
    spent: techTypes.reduce((total, techType) => total + techCost(techType), 0),
  };
}

export async function getSurveyBonusForUser(userId: string) {
  const pb = await createPocketbaseAdminClient();
  const rows = await pb.collection("survey_rewards").getFullList({
    filter: pb.filter("userId = {:id}", { id: userId }),
    fields: "stardustGranted",
  });
  return rows.reduce((total, r) => total + (r.stardustGranted ?? 0), 0);
}

export async function hasResearchedTech(userId: string, techType: string): Promise<boolean> {
  const pb = await createPocketbaseAdminClient();
  const match = await pb
    .collection("researched")
    .getFirstListItem(pb.filter("userId = {:id} && techType = {:t}", { id: userId, t: techType }))
    .catch(() => null);
  return match !== null;
}

export async function unlockTechForUser(userId: string, techType: string) {
  const pb = await createPocketbaseAdminClient();
  const latest = await pb.collection("researched").getList(1, 1, { sort: "-legacyId", fields: "legacyId" });
  const nextLegacyId = (latest.items[0]?.legacyId ?? 0) + 1;

  return pb.collection("researched").create({
    legacyId: nextLegacyId,
    userId,
    techType,
    createdAt: new Date().toISOString(),
  });
}
