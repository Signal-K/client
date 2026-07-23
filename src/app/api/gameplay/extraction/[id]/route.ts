import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { getRouteUser } from "@/lib/server/routeAuth";
import { createPocketbaseAdminClient } from "@/lib/pocketbase/adminClient";
import { mapMineralDepositToRow } from "@/lib/pocketbase/legacyShapes";
import { recursiveSerialize } from "@/utils/serialization";

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const depositId = Number(params.id);
  if (!Number.isFinite(depositId)) {
    return NextResponse.json({ error: "Invalid deposit ID" }, { status: 400 });
  }

  const pb = await createPocketbaseAdminClient();
  const record = await pb
    .collection("mineral_deposits")
    .getFirstListItem(pb.filter("legacyId = {:id}", { id: depositId }))
    .catch(() => null);

  if (!record) {
    return NextResponse.json({ error: "Mineral deposit not found" }, { status: 404 });
  }
  if (record.owner !== user.id) {
    return NextResponse.json({ error: "You don't have permission to extract this deposit" }, { status: 403 });
  }

  return NextResponse.json(recursiveSerialize({ deposit: mapMineralDepositToRow(record) }));
}

export async function POST(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { user, authError } = await getRouteUser();
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

  const pb = await createPocketbaseAdminClient();
  const deposit = await pb
    .collection("mineral_deposits")
    .getFirstListItem(pb.filter("legacyId = {:id}", { id: depositId }))
    .catch(() => null);
  if (!deposit) return NextResponse.json({ error: "Mineral deposit not found" }, { status: 404 });

  if (deposit.owner !== user.id) {
    return NextResponse.json({ error: "You don't have permission to extract this deposit" }, { status: 403 });
  }

  const mineralType = deposit.mineralConfiguration?.type;
  if (!mineralType) {
    return NextResponse.json({ error: "Deposit has no mineral type" }, { status: 400 });
  }

  const latest = await pb
    .collection("user_mineral_inventory")
    .getList(1, 1, { sort: "-legacyId", fields: "legacyId" });
  const nextLegacyId = (latest.items[0]?.legacyId ?? 0) + 1;

  await pb.collection("user_mineral_inventory").create({
    legacyId: nextLegacyId,
    userId: user.id,
    mineralDepositId: deposit.legacyId,
    mineralType: String(mineralType),
    quantity: extractedQuantity,
    purity,
    extractedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  });

  const updatedConfig = {
    ...deposit.mineralConfiguration,
    amount: 0,
    quantity: 0,
  };

  await pb.collection("mineral_deposits").update(deposit.id, { mineralConfiguration: updatedConfig });

  revalidatePath("/inventory");
  revalidatePath(`/extraction/${deposit.legacyId}`);

  return NextResponse.json({ success: true });
}
