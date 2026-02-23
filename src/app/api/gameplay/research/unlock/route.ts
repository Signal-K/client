import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/server/prisma";
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
  const [researched, classificationCountRows, surveyRewards] = await Promise.all([
    prisma.$queryRaw<Array<{ tech_type: string }>>`
      SELECT tech_type FROM researched WHERE user_id = ${userId}
    `,
    prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*)::bigint AS count
      FROM classifications
      WHERE author = ${userId}
    `,
    prisma.$queryRaw<Array<{ stardust_granted: number }>>`
      SELECT stardust_granted FROM survey_rewards WHERE user_id = ${userId}::uuid
    `,
  ]);
  const classificationCount = Number(classificationCountRows[0]?.count ?? 0);
  const surveyBonus = surveyRewards.reduce((sum, r) => sum + (r.stardust_granted ?? 0), 0);

  const researchedRows = researched;
  const researchedSet = new Set(researchedRows.map((r) => r.tech_type));

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
    const planetCountRows = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*)::bigint AS count
      FROM classifications
      WHERE author = ${userId}
        AND classificationtype = 'planet'
    `;
    const planetCount = Number(planetCountRows[0]?.count ?? 0);
    if ((planetCount || 0) < 4) {
      return NextResponse.json({ error: "Requires 4 planet classifications" }, { status: 400 });
    }
  }

  const spent = researchedRows.reduce((total, row) => total + techCost(row.tech_type), 0);
  const availableStardust = Math.max(0, classificationCount + surveyBonus - spent);
  const cost = techCost(techType);

  if (availableStardust < cost) {
    return NextResponse.json(
      { error: "Insufficient stardust", availableStardust, required: cost },
      { status: 400 }
    );
  }

  await prisma.$executeRaw`
    INSERT INTO researched (user_id, tech_type)
    VALUES (${userId}, ${techType})
  `;

  revalidatePath("/research");
  revalidatePath("/game");
  revalidatePath("/inventory");

  return NextResponse.json({ success: true });
}
