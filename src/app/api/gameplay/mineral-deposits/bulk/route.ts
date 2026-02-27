import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/server/prisma";
import { getRouteUser } from "@/lib/server/supabaseRoute";

export const dynamic = "force-dynamic";

type BulkBody = {
  deposits?: Array<Record<string, unknown>>;
};

export async function POST(request: NextRequest) {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as BulkBody;
  const deposits = Array.isArray(body?.deposits) ? body.deposits : [];
  if (deposits.length === 0) {
    return NextResponse.json({ error: "No deposits provided" }, { status: 400 });
  }

  // Normalise camelCase keys from legacy clients to snake_case column names
  const normalized = deposits.map((row) => {
    const { mineralconfiguration, mineralConfiguration, roverName, ...rest } =
      row as Record<string, unknown>;
    return {
      ...rest,
      owner: user.id,
      mineral_configuration:
        mineralconfiguration ?? mineralConfiguration ?? null,
      rover_name: roverName ?? null,
    };
  });

  const data = await prisma.$queryRaw<Array<{ id: number }>>`
    INSERT INTO mineral_deposits
    SELECT *
    FROM jsonb_populate_recordset(NULL::mineral_deposits, ${JSON.stringify(normalized)}::jsonb)
    RETURNING id
  `;

  revalidatePath("/inventory");
  revalidatePath("/viewports/roover");

  return NextResponse.json({ success: true, count: data.length });
}
