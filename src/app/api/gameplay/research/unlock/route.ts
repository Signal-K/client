import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/server/prisma";
import { getResearchedProgressForUser, getSurveyBonusForUser, unlockTechForUser } from "@/lib/server/researched";
import { getRouteUser } from "@/lib/server/supabaseRoute";

export const dynamic = "force-dynamic";

const ALLOWED_TECHS = new Set([
  "probereceptors",
  "satellitecount",
  "roverwaypoints",
  "spectroscopy",
  "findMinerals",
  "p4Minerals",
  "roverExtraction",
  "satelliteExtraction",
  "ngtsAccess",
  "planet-hunters",
  "asteroid-hunting",
  "planet-exploration",
  "cloudspotting",
  "active-asteroids",
]);

const QUANTITY_UPGRADES = new Set(["probereceptors", "satellitecount", "roverwaypoints"]);
const ONE_TIME_UPGRADES = new Set([
  "spectroscopy",
  "findMinerals",
  "p4Minerals",
  "roverExtraction",
  "satelliteExtraction",
  "ngtsAccess",
  "planet-hunters",
  "asteroid-hunting",
  "planet-exploration",
  "cloudspotting",
  "active-asteroids",
]);

function techCost(techType: string) {
  return QUANTITY_UPGRADES.has(techType) ? 10 : 2;
}

export async function POST(request: NextRequest) {
  const { user, authError } = await getRouteUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const techType = typeof body?.techType === "string" ? body.techType : "";

  if (!ALLOWED_TECHS.has(techType)) {
    return NextResponse.json({ error: "Invalid tech type" }, { status: 400 });
  }

  const userId = user.id;
  const [researchProgress, classificationCount, surveyBonus] = await Promise.all([
    getResearchedProgressForUser(userId),
    prisma.classification.count({
      where: { author: userId },
    }),
    getSurveyBonusForUser(userId),
  ]);

  const researchedRows = researchProgress.entries;
  const researchedSet = researchProgress.techSet;

  const existingCount = researchedRows.filter((r) => r.tech_type === techType).length;
  if (ONE_TIME_UPGRADES.has(techType) && existingCount > 0) {
    return NextResponse.json({ error: "Upgrade already unlocked" }, { status: 409 });
  }
  if (QUANTITY_UPGRADES.has(techType) && existingCount > 0) {
    return NextResponse.json({ error: "Upgrade maxed out" }, { status: 409 });
  }

  if (techType === "roverExtraction" && !researchedSet.has("findMinerals")) {
    return NextResponse.json({ error: "Requires findMinerals first" }, { status: 400 });
  }
  if (techType === "satelliteExtraction" && !researchedSet.has("p4Minerals")) {
    return NextResponse.json({ error: "Requires p4Minerals first" }, { status: 400 });
  }
  if (techType === "ngtsAccess") {
    const planetCount = await prisma.classification.count({
      where: {
        author: userId,
        classificationtype: "planet",
      },
    });
    if ((planetCount || 0) < 4) {
      return NextResponse.json({ error: "Requires 4 planet classifications" }, { status: 400 });
    }
  }

  const spent = researchProgress.spent;
  const availableStardust = Math.max(0, classificationCount + surveyBonus - spent);
  const cost = techCost(techType);

  if (availableStardust < cost) {
    return NextResponse.json(
      { error: "Insufficient stardust", availableStardust, required: cost },
      { status: 400 }
    );
  }

  await unlockTechForUser(userId, techType);

  revalidatePath("/research");
  revalidatePath("/game");
  revalidatePath("/inventory");

  return NextResponse.json({ success: true });
}
