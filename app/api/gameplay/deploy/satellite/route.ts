import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/server/prisma";
import { getRouteUser } from "@/lib/server/supabaseRoute";

export const dynamic = "force-dynamic";

type InvestigationMode = "weather" | "p-4" | "planets";

type SatelliteDeployBody = {
  investigationMode?: InvestigationMode;
  planetId?: number;
};

function sampleIds(input: Array<{ id: number }>, count: number) {
  return [...input]
    .sort(() => 0.5 - Math.random())
    .slice(0, count)
    .map((item) => item.id);
}

export async function POST(request: NextRequest) {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as SatelliteDeployBody;
  const investigationMode = body?.investigationMode;
  const planetId = Number(body?.planetId);

  if (!["weather", "p-4", "planets"].includes(String(investigationMode))) {
    return NextResponse.json({ error: "Invalid investigation mode" }, { status: 400 });
  }

  if (!Number.isFinite(planetId)) {
    return NextResponse.json({ error: "Invalid planet ID" }, { status: 400 });
  }

  const [classificationCountRows, satelliteUpgradeRows, planetRows, planetClassifications] = await Promise.all([
    prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*)::bigint AS count
      FROM classifications
      WHERE author = ${user.id}
    `,
    prisma.$queryRaw<Array<{ tech_type: string }>>`
      SELECT tech_type
      FROM researched
      WHERE user_id = ${user.id}
        AND tech_type = 'satellitecount'
    `,
    prisma.$queryRaw<Array<{ id: number; content: string | null }>>`
      SELECT id, content
      FROM anomalies
      WHERE id = ${planetId}
      LIMIT 1
    `,
    prisma.$queryRaw<Array<{ id: number }>>`
      SELECT id
      FROM classifications
      WHERE author = ${user.id}
        AND anomaly = ${planetId}
        AND classificationtype = 'planet'
      LIMIT 1
    `,
  ]);

  const planet = (planetRows || [])[0];
  if (!planet) {
    return NextResponse.json({ error: "Planet not found" }, { status: 404 });
  }

  const userClassificationCount = Number(classificationCountRows[0]?.count ?? 0);
  const isFastDeployEnabled = userClassificationCount === 0;
  const deploymentDate = isFastDeployEnabled
    ? new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    : new Date().toISOString();
  const anomalyCount = (satelliteUpgradeRows || []).length > 0 ? 6 : 4;
  const classificationId = (planetClassifications || [])[0]?.id || null;

  let selectedIds: number[] = [];

  if (investigationMode === "planets") {
    selectedIds = [planetId];
  } else if (investigationMode === "weather") {
    const cloudCountRows = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*)::bigint AS count
      FROM classifications
      WHERE author = ${user.id}
        AND classificationtype IN ('cloud', 'vortex', 'radar')
    `;
    const userCloudClassifications = Number(cloudCountRows[0]?.count ?? 0);

    const anomalySets =
      userCloudClassifications >= 2
        ? ["lidar-jovianVortexHunter", "cloudspottingOnMars", "balloon-marsCloudShapes"]
        : ["cloudspottingOnMars"];

    const cloudRows = await prisma.$queryRaw<Array<{ id: number }>>`
      SELECT id
      FROM anomalies
      WHERE "anomalySet" = ANY(${anomalySets}::text[])
    `;

    selectedIds = sampleIds(cloudRows, anomalyCount);
  } else {
    const p4Rows = await prisma.$queryRaw<Array<{ id: number }>>`
      SELECT id
      FROM anomalies
      WHERE "anomalySet" = 'satellite-planetFour'
    `;

    selectedIds = sampleIds(p4Rows, anomalyCount);
  }

  if (selectedIds.length === 0) {
    return NextResponse.json({ error: "No anomalies available for this deployment" }, { status: 400 });
  }

  const rows = selectedIds.map((id) => ({
    author: user.id,
    anomaly_id: id,
    classification_id: classificationId,
    date: deploymentDate,
    automaton: "WeatherSatellite",
    unlocked: false,
    unlock_time: null,
  }));

  await prisma.$executeRaw`
    INSERT INTO linked_anomalies (author, anomaly_id, classification_id, date, automaton, unlocked, unlock_time)
    SELECT x.author, x.anomaly_id, x.classification_id, x.date::timestamptz, x.automaton, x.unlocked, x.unlock_time
    FROM jsonb_to_recordset(${JSON.stringify(rows)}::jsonb)
      AS x(author text, anomaly_id int, classification_id int, date text, automaton text, unlocked boolean, unlock_time timestamptz)
  `;

  revalidatePath("/viewports/satellite/deploy");
  revalidatePath("/viewports/satellite");
  revalidatePath("/game");

  return NextResponse.json({
    success: true,
    anomalyIds: selectedIds,
    sectorName: planet.content || `TIC ${planet.id}`,
  });
}
