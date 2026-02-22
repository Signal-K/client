import { NextResponse } from "next/server";

import { prisma } from "@/lib/server/prisma";
import { getRouteUser } from "@/lib/server/supabaseRoute";

export const dynamic = "force-dynamic";

export async function GET() {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [latestPlanetRows, classificationCountRows, upgrades, existingDeployRows] = await Promise.all([
    prisma.$queryRaw<Array<Record<string, unknown>>>`
      SELECT c.*, row_to_json(a) as anomaly
      FROM classifications c
      LEFT JOIN anomalies a ON a.id = c.anomaly
      WHERE c.classificationtype = 'planet'
        AND c.author = ${user.id}
      ORDER BY c.created_at DESC
      LIMIT 1
    `,
    prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*)::bigint AS count
      FROM classifications
      WHERE author = ${user.id}
    `,
    prisma.$queryRaw<Array<{ tech_type: string }>>`
      SELECT tech_type
      FROM researched
      WHERE user_id = ${user.id}
        AND tech_type IN ('roverwaypoints', 'findMinerals')
    `,
    prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*)::bigint AS count
      FROM linked_anomalies
      WHERE author = ${user.id}
        AND automaton = 'Rover'
    `,
  ]);

  const latestPlanet = latestPlanetRows[0] || null;
  const hasRoverWaypoints = upgrades.some((u: any) => u.tech_type === "roverwaypoints");
  const hasFindMinerals = upgrades.some((u: any) => u.tech_type === "findMinerals");
  const classificationCount = Number(classificationCountRows[0]?.count ?? 0);

  return NextResponse.json({
    planetClassification: latestPlanet,
    planetAnomaly: latestPlanet?.anomaly || null,
    userClassificationCount: classificationCount,
    isFastDeployEnabled: classificationCount < 4,
    roverUpgrades: {
      roverwaypoints: hasRoverWaypoints,
      findMinerals: hasFindMinerals,
    },
    maxWaypoints: hasRoverWaypoints ? 6 : 4,
    hasExistingRoverDeployment: Number(existingDeployRows[0]?.count ?? 0) > 0,
  });
}
