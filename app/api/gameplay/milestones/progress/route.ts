import { NextResponse } from "next/server";

import { getRouteSupabaseWithUser } from "@/lib/server/supabaseRoute";
import {
  ALL_MINERAL_TYPES,
  ALL_RESEARCH_UPGRADES,
  CLASSIFICATION_ROUTES,
  type ClassificationType,
} from "@/src/types/achievement";

export const dynamic = "force-dynamic";

const VALID_TYPES: ClassificationType[] = [
  "DiskDetective",
  "automaton-aiForMars",
  "balloon-marsCloudShapes",
  "cloud",
  "lidar-jovianVortexHunter",
  "planet",
  "planet-inspection",
  "sunspot",
  "satellite-planetFour",
];

export async function GET() {
  const { supabase, user, authError } = await getRouteSupabaseWithUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = user.id;

  const [{ data: researchData, error: researchError }, { data: classificationData, error: classificationsError }, { data: mineralsData, error: mineralsError }] =
    await Promise.all([
      supabase.from("researched").select("tech_type").eq("user_id", userId),
      supabase.from("classifications").select("classificationtype").eq("author", userId),
      supabase.from("mineralDeposits").select("mineralconfiguration").eq("owner", userId),
    ]);

  if (researchError || classificationsError || mineralsError) {
    return NextResponse.json(
      {
        error:
          researchError?.message || classificationsError?.message || mineralsError?.message || "Failed to load milestones",
      },
      { status: 500 }
    );
  }

  const unlockedUpgrades = new Set((researchData || []).map((r: any) => r.tech_type));
  const allUpgrades = {
    type: "all-upgrades" as const,
    total: ALL_RESEARCH_UPGRADES.length,
    unlocked: ALL_RESEARCH_UPGRADES.filter((u) => unlockedUpgrades.has(u.techType)).length,
    upgrades: ALL_RESEARCH_UPGRADES.map((upgrade) => ({
      name: upgrade.name,
      techType: upgrade.techType,
      isUnlocked: unlockedUpgrades.has(upgrade.techType),
    })),
  };

  const classificationCounts: Record<string, number> = {};
  (classificationData || []).forEach((row: any) => {
    const type = row.classificationtype;
    if (VALID_TYPES.includes(type as ClassificationType)) {
      classificationCounts[type] = (classificationCounts[type] || 0) + 1;
    }
  });

  const classificationDiversity = {
    type: "classification-diversity" as const,
    total: VALID_TYPES.length,
    completed: VALID_TYPES.filter((type) => (classificationCounts[type] || 0) > 0).length,
    classifications: VALID_TYPES.map((type) => {
      const routeInfo = CLASSIFICATION_ROUTES[type];
      return {
        type,
        name: type,
        count: classificationCounts[type] || 0,
        isComplete: (classificationCounts[type] || 0) > 0,
        route: routeInfo.route,
        hint: routeInfo.hint,
      };
    }),
  };

  const extractedTypes = new Set<string>();
  (mineralsData || []).forEach((deposit: any) => {
    const config = deposit.mineralconfiguration;
    if (!config) return;
    const type = config.type || config.mineralType;
    if (!type) return;

    const normalizedType = ALL_MINERAL_TYPES.find((mt) => {
      return mt.toLowerCase().replace(/[^a-z0-9]/g, "") === String(type).toLowerCase().replace(/[^a-z0-9]/g, "");
    });
    if (normalizedType) {
      extractedTypes.add(normalizedType);
    }
  });

  const resourceExtraction = {
    type: "resource-extraction" as const,
    total: ALL_MINERAL_TYPES.length,
    extracted: extractedTypes.size,
    resources: ALL_MINERAL_TYPES.map((type) => ({
      type,
      name: type,
      isExtracted: extractedTypes.has(type),
    })),
  };

  return NextResponse.json({
    allUpgrades,
    classificationDiversity,
    resourceExtraction,
  });
}

