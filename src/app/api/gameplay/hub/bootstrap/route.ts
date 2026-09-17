import { NextResponse } from "next/server";

import { getRouteUser } from "@/lib/server/routeAuth";
import { createPocketbaseAdminClient } from "@/lib/pocketbase/adminClient";
import { loadHubState } from "@/lib/server/hubState";
import { emptyHubState, hasAccountOnboarding } from "@/src/features/onboarding/hubState";

export const dynamic = "force-dynamic";

async function safe<T>(query: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await query();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`[hub-bootstrap] ${message}`);
    return fallback;
  }
}

export async function GET() {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pb = await createPocketbaseAdminClient();

  const [profile, inventory, linked, classifications, hubState] = await Promise.all([
    safe(
      () =>
        pb
          .collection("profiles")
          .getFirstListItem(pb.filter("userId = {:id}", { id: user.id }))
          .catch(() => null),
      null
    ),
    safe(
      async () => {
        const result = await pb.collection("inventory").getList(1, 200, {
          filter: pb.filter("owner = {:owner}", { owner: user.id }),
          fields: "item",
        });
        return { items: result.items as Array<{ item?: number }> };
      },
      { items: [] as Array<{ item?: number }> }
    ),
    safe(
      async () => {
        const result = await pb.collection("linked_anomalies").getList(1, 200, {
          filter: pb.filter("author = {:author}", { author: user.id }),
          fields: "automaton",
        });
        return { items: result.items as Array<{ automaton?: string }> };
      },
      { items: [] as Array<{ automaton?: string }> }
    ),
    safe(
      async () => {
        const result = await pb.collection("ss_classifications").getList(1, 1, {
          filter: pb.filter("author = {:author}", { author: user.id }),
          fields: "id",
        });
        return { totalItems: result.totalItems };
      },
      { totalItems: 0 }
    ),
    safe(() => loadHubState(user.id), emptyHubState()),
  ]);

  const inventoryItemIds = [
    ...new Set(
      inventory.items
        .map((row) => Number(row.item))
        .filter((id) => Number.isFinite(id) && id > 0)
    ),
  ];
  const automatons = [
    ...new Set(
      linked.items
        .map((row) => (typeof row.automaton === "string" ? row.automaton : ""))
        .filter(Boolean)
    ),
  ];
  const username = (profile?.username as string | undefined) ?? null;
  const classificationCount = classifications.totalItems ?? 0;
  const returning = Boolean(
    username ||
      inventoryItemIds.length ||
      automatons.length ||
      classificationCount > 0 ||
      hasAccountOnboarding(hubState.onboarding)
  );

  return NextResponse.json({
    username,
    classificationPoints: (profile?.classificationPoints as number | undefined) ?? 0,
    inventoryItemIds,
    automatons,
    classificationCount,
    returning,
    hubState,
  });
}
