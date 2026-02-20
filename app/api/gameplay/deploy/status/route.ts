import { NextResponse } from "next/server";

import { prisma } from "@/lib/server/prisma";
import { getRouteUser } from "@/lib/server/supabaseRoute";

export const dynamic = "force-dynamic";

export async function GET() {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const [planetClassifications, telescopeDeployments, satelliteDeployments, roverDeployments, userClassifications] =
    await Promise.all([
      prisma.$queryRaw<Array<{ anomaly: number; content: string | null }>>`
        SELECT c.anomaly, a.content
        FROM classifications c
        LEFT JOIN anomalies a ON a.id = c.anomaly
        WHERE c.author = ${user.id}
          AND c.classificationtype = 'planet'
      `,
      prisma.$queryRaw<Array<{ anomaly_id: number }>>`
        SELECT anomaly_id
        FROM linked_anomalies
        WHERE author = ${user.id}
          AND automaton = 'Telescope'
          AND date >= ${oneWeekAgo.toISOString()}
      `,
      prisma.$queryRaw<Array<{ anomaly_id: number }>>`
        SELECT anomaly_id
        FROM linked_anomalies
        WHERE author = ${user.id}
          AND automaton = 'WeatherSatellite'
      `,
      prisma.$queryRaw<Array<{ anomaly_id: number }>>`
        SELECT anomaly_id
        FROM linked_anomalies
        WHERE author = ${user.id}
          AND automaton = 'Rover'
      `,
      prisma.$queryRaw<Array<{ anomaly: number }>>`
        SELECT anomaly
        FROM classifications
        WHERE author = ${user.id}
      `,
    ]);

  const planetTargets = planetClassifications
    .map((c) => {
      const anomalyId = Number(c.anomaly);
      if (!Number.isFinite(anomalyId)) return null;
      return {
        id: anomalyId,
        name: c.content || `Planet #${anomalyId}`,
      };
    })
    .filter(Boolean);

  const classifiedAnomalyIds = new Set(
    userClassifications.map((c) => c.anomaly).filter(Boolean)
  );

  const telescopeUnclassified = telescopeDeployments.filter(
    (deployment: any) => !classifiedAnomalyIds.has(deployment.anomaly_id)
  ).length;
  const satelliteUnclassified = satelliteDeployments.filter(
    (deployment: any) => !classifiedAnomalyIds.has(deployment.anomaly_id)
  ).length;
  const roverUnclassified = roverDeployments.filter(
    (deployment: any) => !classifiedAnomalyIds.has(deployment.anomaly_id)
  ).length;

  return NextResponse.json({
    deploymentStatus: {
      telescope: {
        deployed: telescopeDeployments.length > 0,
        unclassifiedCount: telescopeUnclassified,
      },
      satellites: {
        deployed: satelliteDeployments.length > 0,
        unclassifiedCount: satelliteUnclassified,
        available: planetTargets.length > 0,
      },
      rover: {
        deployed: roverDeployments.length > 0,
        unclassifiedCount: roverUnclassified,
      },
    },
    planetTargets,
  });
}
