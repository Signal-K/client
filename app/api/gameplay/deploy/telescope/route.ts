import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/server/prisma";
import { getRouteUser } from "@/lib/server/supabaseRoute";

export const dynamic = "force-dynamic";

type DeploymentType = "stellar" | "planetary";

type DeployBody = {
  deploymentType?: DeploymentType;
  anomalyIds?: number[];
};

function computeSetsToFetch(
  deploymentType: DeploymentType,
  options: { includeActiveAsteroids: boolean; includeNgts: boolean }
) {
  if (deploymentType === "stellar") {
    return ["diskDetective", "superwasp-variable", "telescope-superwasp-variable"];
  }

  const sets = ["telescope-tess", "telescope-minorPlanet"];
  if (options.includeActiveAsteroids) {
    sets.push("active-asteroids");
  }
  if (options.includeNgts) {
    sets.push("telescope-ngts");
  }
  return sets;
}

export async function GET(request: NextRequest) {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const action = request.nextUrl.searchParams.get("action");

  if (action === "anomalies") {
    const deploymentType = request.nextUrl.searchParams.get("deploymentType") as DeploymentType | null;
    if (deploymentType !== "stellar" && deploymentType !== "planetary") {
      return NextResponse.json({ error: "Invalid deploymentType" }, { status: 400 });
    }

    let includeActiveAsteroids = false;
    let includeNgts = false;

    if (deploymentType === "planetary") {
      const [minorPlanetRows, ngtsData] = await Promise.all([
        prisma.$queryRaw<Array<{ count: bigint }>>`
          SELECT COUNT(*)::bigint AS count
          FROM classifications
          WHERE author = ${user.id}
            AND classificationtype = 'telescope-minorPlanet'
        `,
        prisma.$queryRaw<Array<{ tech_type: string }>>`
          SELECT tech_type
          FROM researched
          WHERE user_id = ${user.id}
            AND tech_type = 'ngtsAccess'
          LIMIT 1
        `,
      ]);

      includeActiveAsteroids = Number(minorPlanetRows[0]?.count ?? 0) >= 2;
      includeNgts = ngtsData.length > 0;
    }

    const setsToFetch = computeSetsToFetch(deploymentType, {
      includeActiveAsteroids,
      includeNgts,
    });

    const data = await prisma.$queryRaw<Array<Record<string, unknown>>>`
      SELECT *
      FROM anomalies
      WHERE "anomalySet" = ANY(${setsToFetch}::text[])
    `;

    return NextResponse.json({ anomalies: data });
  }

  if (action === "status") {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const [linkedRes, commentsRes, votesRes] = await Promise.all([
      prisma.$queryRaw<Array<{ id: number }>>`
        SELECT id
        FROM linked_anomalies
        WHERE automaton = 'Telescope'
          AND author = ${user.id}
          AND date >= ${oneWeekAgo.toISOString()}
      `,
      prisma.$queryRaw<Array<{ id: number; classification_author: string | null }>>`
        SELECT c.id, cls.author AS classification_author
        FROM comments c
        LEFT JOIN classifications cls ON cls.id = c.classification_id
        WHERE c.author = ${user.id}
          AND c.created_at >= ${oneWeekAgo.toISOString()}
      `,
      prisma.$queryRaw<Array<{ id: number; classification_author: string | null }>>`
        SELECT v.id, cls.author AS classification_author
        FROM votes v
        LEFT JOIN classifications cls ON cls.id = v.classification_id
        WHERE v.user_id = ${user.id}
          AND v.vote_type = 'up'
          AND v.created_at >= ${oneWeekAgo.toISOString()}
      `,
    ]);

    const linkedCount = linkedRes.length;
    const validComments = commentsRes.filter((c) => c.classification_author && c.classification_author !== user.id);
    const validVotes = votesRes.filter((v) => v.classification_author && v.classification_author !== user.id);

    const additionalDeploys = Math.floor(validVotes.length / 3) + validComments.length;
    const userCanRedeploy = linkedCount + additionalDeploys > linkedCount;

    if (linkedCount === 0) {
      return NextResponse.json({ alreadyDeployed: false, deploymentMessage: null });
    }

    if (userCanRedeploy) {
      return NextResponse.json({
        alreadyDeployed: false,
        deploymentMessage: "You have earned additional deploys by interacting with the community this week!",
      });
    }

    return NextResponse.json({
      alreadyDeployed: true,
      deploymentMessage: "Telescope has already been deployed this week. Recalibrate & search again next week.",
    });
  }

  if (action === "skill-progress") {
    const start = new Date("2000-01-01").toISOString();

    const [telescopeRows, weatherRows] = await Promise.all([
      prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*)::bigint AS count
        FROM classifications
        WHERE author = ${user.id}
          AND classificationtype IN ('planet', 'telescope-minorPlanet')
          AND created_at >= ${start}
      `,
      prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*)::bigint AS count
        FROM classifications
        WHERE author = ${user.id}
          AND classificationtype IN ('cloud', 'lidar-jovianVortexHunter')
          AND created_at >= ${start}
      `,
    ]);

    return NextResponse.json({
      skillProgress: {
        telescope: Number(telescopeRows[0]?.count ?? 0),
        weather: Number(weatherRows[0]?.count ?? 0),
      },
    });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

export async function POST(request: NextRequest) {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as DeployBody;
  const deploymentType = body?.deploymentType;
  const anomalyIds = Array.isArray(body?.anomalyIds)
    ? body.anomalyIds.map((id) => Number(id)).filter((id) => Number.isFinite(id))
    : [];

  if (deploymentType !== "stellar" && deploymentType !== "planetary") {
    return NextResponse.json({ error: "Invalid deploymentType" }, { status: 400 });
  }

  if (anomalyIds.length === 0) {
    return NextResponse.json({ error: "No anomalies selected" }, { status: 400 });
  }

  const upgradeRows = await prisma.$queryRaw<Array<{ tech_type: string }>>`
    SELECT tech_type
    FROM researched
    WHERE user_id = ${user.id}
      AND tech_type = 'probereceptors'
  `;

  const maxAnomalies = (upgradeRows || []).length > 0 ? 6 : 4;
  const uniqueIds = Array.from(new Set(anomalyIds)).slice(0, maxAnomalies);

  const rows = uniqueIds.map((anomalyId) => ({
    author: user.id,
    anomaly_id: anomalyId,
    classification_id: null,
    automaton: "Telescope",
  }));

  await prisma.$executeRaw`
    INSERT INTO linked_anomalies (author, anomaly_id, classification_id, automaton)
    SELECT x.author, x.anomaly_id, x.classification_id, x.automaton
    FROM jsonb_to_recordset(${JSON.stringify(rows)}::jsonb)
      AS x(author text, anomaly_id int, classification_id int, automaton text)
  `;

  revalidatePath("/activity/deploy");
  revalidatePath("/structures/telescope");
  revalidatePath("/game");

  return NextResponse.json({ success: true, inserted: rows.length });
}
