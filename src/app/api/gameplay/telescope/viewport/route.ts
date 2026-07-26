import { NextResponse } from "next/server";

import { createPocketbaseAdminClient } from "@/lib/pocketbase/adminClient";
import { mapAnomalyToRow, mapClassificationToRow } from "@/lib/pocketbase/legacyShapes";
import { getRouteUser } from "@/lib/server/routeAuth";

export const dynamic = "force-dynamic";

export async function GET() {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return NextResponse.json({
      anomalies: [],
      userClassifications: [],
      allClassifications: [],
      authenticated: false,
    });
  }

  const userId = user.id;

  try {
    const pb = await createPocketbaseAdminClient();
    const linkedRows = await pb.collection("linked_anomalies").getFullList({
      filter: pb.filter("author = {:author} && (automaton = {:telescope} || automaton = {:planet})", {
        author: userId,
        telescope: "Telescope",
        planet: "TelescopePlanet",
      }),
      fields: "legacyId,anomalyId,classificationId",
    });

    const anomalyIds = linkedRows
      .map((r: Record<string, unknown>) => r.anomalyId)
      .filter((id): id is number => id != null);

    let anomalies: Record<string, unknown>[] = [];
    if (anomalyIds.length > 0) {
      const filter = [...new Set(anomalyIds)].map((id) => pb.filter("legacyId = {:id}", { id })).join(" || ");
      const anomalyData = await pb.collection("anomalies").getFullList({ filter });
      anomalies = anomalyData.map(mapAnomalyToRow);
    }

    const [userClassifications, allClassifications] = await Promise.all([
      pb.collection("ss_classifications").getFullList({
        filter: pb.filter("author = {:author}", { author: userId }),
        sort: "-createdAt",
      }),
      pb.collection("ss_classifications").getList(1, 50, {
        sort: "-createdAt",
      }).then((result) => result.items),
    ]);

    return NextResponse.json({
      anomalies,
      userClassifications: userClassifications.map(mapClassificationToRow),
      allClassifications: allClassifications.map(mapClassificationToRow),
      authenticated: true,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[telescope/viewport] unexpected error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
