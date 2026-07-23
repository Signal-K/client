import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { getRouteUser } from "@/lib/server/routeAuth";
import { createPocketbaseAdminClient } from "@/lib/pocketbase/adminClient";
import { recursiveSerialize } from "@/utils/serialization";

export const dynamic = "force-dynamic";

function getWeekStart(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

export async function POST() {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const weekStart = getWeekStart(now).toISOString();
  const automatonType = "TelescopeSolar";

  const pb = await createPocketbaseAdminClient();

  const [anomalies, existing] = await Promise.all([
    pb.collection("anomalies").getFullList({
      filter: pb.filter("anomalySet = {:s}", { s: "sunspot" }),
      fields: "legacyId",
    }),
    pb.collection("linked_anomalies").getList(1, 1, {
      filter: pb.filter("author = {:author} && automaton = {:a} && date >= {:d}", {
        author: user.id,
        a: automatonType,
        d: weekStart,
      }),
    }),
  ]);

  if (existing.items.length > 0) {
    return NextResponse.json(recursiveSerialize({ success: true, inserted: 0 }));
  }

  if (anomalies.length === 0) {
    return NextResponse.json({ error: "No sunspot anomalies available" }, { status: 400 });
  }

  const latest = await pb.collection("linked_anomalies").getList(1, 1, { sort: "-legacyId", fields: "legacyId" });
  let nextLegacyId = (latest.items[0]?.legacyId ?? 0) + 1;

  await Promise.all(
    anomalies.map((anomaly) =>
      pb.collection("linked_anomalies").create({
        legacyId: nextLegacyId++,
        author: user.id,
        anomalyId: anomaly.legacyId,
        automaton: automatonType,
        unlocked: false,
        date: now.toISOString(),
      })
    )
  );

  revalidatePath("/viewports/solar");
  revalidatePath("/game");

  return NextResponse.json(recursiveSerialize({ success: true, inserted: anomalies.length }));
}
