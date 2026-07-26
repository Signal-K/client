import { NextResponse } from "next/server";

import { getRouteUser } from "@/lib/server/routeAuth";
import { createPocketbaseAdminClient } from "@/lib/pocketbase/adminClient";
import { recursiveSerialize } from "@/utils/serialization";

export const dynamic = "force-dynamic";

const EMPTY_DEPLOYMENT_STATUS = {
  deploymentStatus: {
    telescope: {
      deployed: false,
      unclassifiedCount: 0,
    },
    satellites: {
      deployed: false,
      unclassifiedCount: 0,
      available: false,
    },
    rover: {
      deployed: false,
      unclassifiedCount: 0,
    },
  },
  planetTargets: [],
};

export async function GET() {
  try {
    const { user, authError } = await getRouteUser();
    if (authError || !user) {
      return NextResponse.json(recursiveSerialize(EMPTY_DEPLOYMENT_STATUS));
    }

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const pb = await createPocketbaseAdminClient();

    const [planetClassifications, telescopeDeployments, satelliteDeployments, roverDeployments, userClassifications] =
      await Promise.all([
        pb.collection("ss_classifications").getFullList({
          filter: pb.filter("author = {:author} && classificationtype = {:t}", { author: user.id, t: "planet" }),
          fields: "anomaly,legacyId",
        }).then(async (rows) => {
          const anomalyIds = [...new Set(rows.map((r) => r.anomaly).filter((a): a is number => a != null))];
          let contentByAnomalyId = new Map<number, string | null>();
          if (anomalyIds.length > 0) {
            const filter = anomalyIds.map((id) => pb.filter("legacyId = {:id}", { id })).join(" || ");
            const anomalies = await pb.collection("anomalies").getFullList({ filter, fields: "legacyId,content" });
            contentByAnomalyId = new Map(anomalies.map((a) => [a.legacyId, a.content ?? null]));
          }
          return rows.map((r) => ({ anomaly: r.anomaly, content: contentByAnomalyId.get(r.anomaly) ?? null }));
        }),
        pb.collection("linked_anomalies").getFullList({
          filter: pb.filter("author = {:author} && automaton = {:a} && date >= {:d}", {
            author: user.id,
            a: "Telescope",
            d: oneWeekAgo.toISOString(),
          }),
          fields: "anomalyId",
        }),
        pb.collection("linked_anomalies").getFullList({
          filter: pb.filter("author = {:author} && automaton = {:a}", { author: user.id, a: "WeatherSatellite" }),
          fields: "anomalyId",
        }),
        pb.collection("linked_anomalies").getFullList({
          filter: pb.filter("author = {:author} && automaton = {:a}", { author: user.id, a: "Rover" }),
          fields: "anomalyId",
        }),
        pb.collection("ss_classifications").getFullList({
          filter: pb.filter("author = {:author}", { author: user.id }),
          fields: "anomaly",
        }),
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
      userClassifications.map((c: any) => c.anomaly).filter(Boolean)
    );

    const telescopeUnclassified = telescopeDeployments.filter(
      (deployment: any) => !classifiedAnomalyIds.has(deployment.anomalyId)
    ).length;
    const satelliteUnclassified = satelliteDeployments.filter(
      (deployment: any) => !classifiedAnomalyIds.has(deployment.anomalyId)
    ).length;
    const roverUnclassified = roverDeployments.filter(
      (deployment: any) => !classifiedAnomalyIds.has(deployment.anomalyId)
    ).length;

    return NextResponse.json(recursiveSerialize({
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
    }));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[deploy-status] GET error:", message);
    return NextResponse.json(recursiveSerialize({ error: "Internal server error", message }), { status: 500 });
  }
}
