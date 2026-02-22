import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/server/prisma";
import { getRouteUser } from "@/lib/server/supabaseRoute";

export const dynamic = "force-dynamic";

type Counts = { 1: number; 2: number; 3: number; 4: number };

function parseConfig(raw: unknown): Record<string, unknown> | null {
  if (!raw) return null;
  if (typeof raw === "object") return raw as Record<string, unknown>;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
  return null;
}

function addOptionCount(options: unknown, counts: Counts) {
  if (!options || typeof options !== "object") return;
  const map = options as Record<string, unknown>;
  for (const [key, value] of Object.entries(map)) {
    const option = Number(key);
    if (!Number.isFinite(option) || option < 1 || option > 4) continue;
    if (value === true) {
      counts[option as keyof Counts] += 1;
    }
  }
}

export async function GET(request: NextRequest) {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const classificationType =
    request.nextUrl.searchParams.get("classificationType") || "lidar-jovianVortexHunter";

  const rows = await prisma.$queryRaw<Array<{ classificationConfiguration: unknown }>>`
    SELECT "classificationConfiguration"
    FROM classifications
    WHERE author = ${user.id}
      AND classificationtype = ${classificationType}
  `;

  const counts: Counts = { 1: 0, 2: 0, 3: 0, 4: 0 };
  for (const row of rows) {
    const config = parseConfig(row.classificationConfiguration);
    if (!config?.classificationOptions || typeof config.classificationOptions !== "object") continue;
    const optionsRoot = config.classificationOptions as Record<string, unknown>;
    for (const value of Object.values(optionsRoot)) {
      addOptionCount(value, counts);
    }
  }

  return NextResponse.json({
    totalClassifications: rows.length,
    counts,
  });
}
