import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { getRouteSupabaseWithUser } from "@/lib/server/supabaseRoute";

export const dynamic = "force-dynamic";

type UseInventoryBody = {
  inventoryId?: number | string;
  decrementBy?: number;
};

export async function POST(request: NextRequest) {
  const { supabase, user, authError } = await getRouteSupabaseWithUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as UseInventoryBody;
  const inventoryId = Number(body?.inventoryId);
  const decrementBy = Number(body?.decrementBy ?? 1);

  if (!Number.isFinite(inventoryId) || !Number.isFinite(decrementBy) || decrementBy <= 0) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { data: row, error: rowError } = await supabase
    .from("inventory")
    .select("id, owner, configuration")
    .eq("id", inventoryId)
    .single();

  if (rowError || !row) {
    return NextResponse.json({ error: rowError?.message || "Inventory item not found" }, { status: 404 });
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

  const { error: updateError } = await supabase
    .from("inventory")
    .update({ configuration: nextConfig })
    .eq("id", inventoryId)
    .eq("owner", user.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  revalidatePath("/inventory");
  revalidatePath("/game");

  return NextResponse.json({ success: true, uses: nextUses });
}
