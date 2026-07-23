import { NextResponse } from "next/server";

import { createPocketbaseAdminClient } from "@/lib/pocketbase/adminClient";
import { getRouteUser } from "@/lib/server/routeAuth";

export const dynamic = "force-dynamic";

export async function GET() {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pb = await createPocketbaseAdminClient();
  const linkedRows = await pb.collection("linked_anomalies").getFullList({
    filter: pb.filter("author = {:author} && unlocked = false", { author: user.id }),
    sort: "-date",
    fields: "legacyId,anomalyId,date,automaton,unlocked",
  });

  const anomalyIds = [...new Set(linkedRows.map((row) => row.anomalyId).filter(Boolean))];
  const anomaliesById = new Map<number, Record<string, unknown>>();
  if (anomalyIds.length > 0) {
    const filter = anomalyIds.map((id) => pb.filter("legacyId = {:id}", { id })).join(" || ");
    const anomalies = await pb.collection("anomalies").getFullList({
      filter,
      fields: "legacyId,content,anomalytype,anomalySet",
    });
    for (const anomaly of anomalies) {
      anomaliesById.set(anomaly.legacyId, {
        id: anomaly.legacyId,
        content: anomaly.content,
        anomalytype: anomaly.anomalytype,
        anomalySet: anomaly.anomalySet,
      });
    }
  }

  const linkedAnomalies = linkedRows.map((item) => ({
    id: item.legacyId,
    anomaly_id: item.anomalyId,
    date: item.date,
    automaton: item.automaton,
    unlocked: item.unlocked,
    anomaly: anomaliesById.get(item.anomalyId) ?? null,
  }));

  return NextResponse.json({ linkedAnomalies });
}
