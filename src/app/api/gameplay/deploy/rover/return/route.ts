import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { createPocketbaseAdminClient } from "@/lib/pocketbase/adminClient";
import { getRouteUser } from "@/lib/server/routeAuth";

export const dynamic = "force-dynamic";

export async function POST() {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pb = await createPocketbaseAdminClient();
  const linkedRows = await pb.collection("linked_anomalies").getFullList({
    filter: pb.filter("author = {:author} && automaton = {:automaton}", {
      author: user.id,
      automaton: "Rover",
    }),
    fields: "id",
  });
  await Promise.all(linkedRows.map((row) => pb.collection("linked_anomalies").delete(row.id)));

  const now = new Date();
  const utcDay = now.getUTCDay();
  const daysToLastSaturday = utcDay === 6 ? 0 : (utcDay + 1) % 7;
  const cutoff = new Date(now);
  cutoff.setUTCDate(now.getUTCDate() - daysToLastSaturday);
  cutoff.setUTCHours(14, 1, 0, 0);

  const routes = await pb.collection("routes").getFullList({
    filter: pb.filter("author = {:author} && timestamp >= {:cutoff}", {
      author: user.id,
      cutoff: cutoff.toISOString(),
    }),
    fields: "id",
  });
  await Promise.all(routes.map((route) => pb.collection("routes").delete(route.id)));

  revalidatePath("/activity/deploy/rover");
  revalidatePath("/viewports/rover");
  revalidatePath("/game");

  return NextResponse.json({ success: true });
}
