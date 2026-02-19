import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { getRouteSupabaseWithUser } from "@/lib/server/supabaseRoute";

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const { supabase, user, authError } = await getRouteSupabaseWithUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const depositId = Number(params.id);
  if (!Number.isFinite(depositId)) {
    return NextResponse.json({ error: "Invalid deposit ID" }, { status: 400 });
  }

  const { data, error } = await supabase.from("mineralDeposits").select("*").eq("id", depositId).single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Mineral deposit not found" }, { status: 404 });
  }
  if (data.owner !== user.id) {
    return NextResponse.json({ error: "You don't have permission to extract this deposit" }, { status: 403 });
  }

  return NextResponse.json({ deposit: data });
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const { supabase, user, authError } = await getRouteSupabaseWithUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const depositId = Number(params.id);
  if (!Number.isFinite(depositId)) {
    return NextResponse.json({ error: "Invalid deposit ID" }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const extractedQuantity = Number(body?.extractedQuantity);
  const purity = Number(body?.purity);

  if (!Number.isFinite(extractedQuantity) || extractedQuantity <= 0 || !Number.isFinite(purity)) {
    return NextResponse.json({ error: "Invalid extraction payload" }, { status: 400 });
  }

  const { data: deposit, error: depositError } = await supabase
    .from("mineralDeposits")
    .select("id, owner, mineralconfiguration")
    .eq("id", depositId)
    .single();

  if (depositError || !deposit) {
    return NextResponse.json({ error: depositError?.message || "Mineral deposit not found" }, { status: 404 });
  }

  if (deposit.owner !== user.id) {
    return NextResponse.json({ error: "You don't have permission to extract this deposit" }, { status: 403 });
  }

  const mineralType = deposit.mineralconfiguration?.type;
  if (!mineralType) {
    return NextResponse.json({ error: "Deposit has no mineral type" }, { status: 400 });
  }

  const { error: inventoryError } = await supabase.from("user_mineral_inventory").insert({
    user_id: user.id,
    mineral_deposit_id: deposit.id,
    mineral_type: mineralType,
    quantity: extractedQuantity,
    purity,
    extracted_at: new Date().toISOString(),
  });

  if (inventoryError) {
    return NextResponse.json({ error: inventoryError.message }, { status: 500 });
  }

  const updatedConfig = {
    ...deposit.mineralconfiguration,
    amount: 0,
    quantity: 0,
  };

  const { error: updateError } = await supabase
    .from("mineralDeposits")
    .update({ mineralconfiguration: updatedConfig })
    .eq("id", deposit.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  revalidatePath("/inventory");
  revalidatePath(`/extraction/${deposit.id}`);

  return NextResponse.json({ success: true });
}
