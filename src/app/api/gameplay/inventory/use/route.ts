import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { createPocketbaseAdminClient } from "@/lib/pocketbase/adminClient";
import { getRouteUser } from "@/lib/server/routeAuth";

export const dynamic = "force-dynamic";

type UseInventoryBody = {
  inventoryId?: number | string;
  decrementBy?: number;
};

export async function POST(request: NextRequest) {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as UseInventoryBody;
  const inventoryId = Number(body?.inventoryId);
  const decrementBy = Number(body?.decrementBy ?? 1);

  if (!Number.isFinite(inventoryId) || !Number.isFinite(decrementBy) || decrementBy <= 0) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const pb = await createPocketbaseAdminClient();
  const row = await pb
    .collection("inventory")
    .getFirstListItem(pb.filter("legacyId = {:id}", { id: inventoryId }), {
      fields: "id,legacyId,owner,configuration",
    })
    .catch(() => null);

  if (!row) {
    return NextResponse.json({ error: "Inventory item not found" }, { status: 404 });
  }

  if (row.owner !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const currentConfig = (row.configuration as Record<string, unknown>) || {};
  const currentUses = typeof currentConfig.Uses === "number" ? currentConfig.Uses : 0;
  const nextUses = Math.max(0, currentUses - decrementBy);
  const nextConfig = {
    ...currentConfig,
    Uses: nextUses,
  };

  await pb.collection("inventory").update(row.id, { configuration: nextConfig });

  revalidatePath("/inventory");
  revalidatePath("/game");

  return NextResponse.json({ success: true, uses: nextUses });
}
