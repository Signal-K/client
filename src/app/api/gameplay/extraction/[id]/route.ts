import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/server/prisma";
import { getRouteUser } from "@/lib/server/supabaseRoute";

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const depositId = Number(params.id);
  if (!Number.isFinite(depositId)) {
    return NextResponse.json({ error: "Invalid deposit ID" }, { status: 400 });
  }

  const rows = await prisma.$queryRaw<Array<Record<string, unknown>>>`
    SELECT * FROM mineral_deposits WHERE id = ${depositId} LIMIT 1
  `;
  const data = rows[0] as Record<string, unknown> | undefined;
  if (!data) {
    return NextResponse.json({ error: "Mineral deposit not found" }, { status: 404 });
  }
  if (data.owner !== user.id) {
    return NextResponse.json({ error: "You don't have permission to extract this deposit" }, { status: 403 });
  }

  return NextResponse.json({ deposit: data });
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
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

  const depositRows = await prisma.$queryRaw<
    Array<{ id: number; owner: string; mineral_configuration: Record<string, unknown> | null }>
  >`
    SELECT id, owner, mineral_configuration
    FROM mineral_deposits
    WHERE id = ${depositId}
    LIMIT 1
  `;
  const deposit = depositRows[0];
  if (!deposit) return NextResponse.json({ error: "Mineral deposit not found" }, { status: 404 });

  if (deposit.owner !== user.id) {
    return NextResponse.json({ error: "You don't have permission to extract this deposit" }, { status: 403 });
  }

  const mineralType = deposit.mineral_configuration?.type;
  if (!mineralType) {
    return NextResponse.json({ error: "Deposit has no mineral type" }, { status: 400 });
  }

  await prisma.$executeRaw`
    INSERT INTO user_mineral_inventory (user_id, mineral_deposit_id, mineral_type, quantity, purity, extracted_at)
    VALUES (${user.id}, ${deposit.id}, ${String(mineralType)}, ${extractedQuantity}, ${purity}, ${new Date().toISOString()})
  `;

  const updatedConfig = {
    ...deposit.mineral_configuration,
    amount: 0,
    quantity: 0,
  };

  await prisma.$executeRaw`
    UPDATE mineral_deposits
    SET mineral_configuration = ${JSON.stringify(updatedConfig)}::jsonb
    WHERE id = ${deposit.id}
  `;

  revalidatePath("/inventory");
  revalidatePath(`/extraction/${deposit.id}`);

  return NextResponse.json({ success: true });
}
