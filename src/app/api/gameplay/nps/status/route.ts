import { NextResponse } from "next/server";

import { prisma } from "@/lib/server/prisma";
import { getRouteUser } from "@/lib/server/supabaseRoute";

export const dynamic = "force-dynamic";

export async function GET() {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [classificationRows, surveyRows] = await Promise.all([
    prisma.$queryRaw<Array<{ id: number }>>`
      SELECT id
      FROM classifications
      WHERE author = ${user.id}
      LIMIT 1
    `,
    prisma.$queryRaw<Array<{ id: number }>>`
      SELECT id
      FROM nps_surveys
      WHERE user_id = ${user.id}
      LIMIT 1
    `,
  ]);

  const hasClassification = classificationRows.length > 0;
  const hasCompletedNps = surveyRows.length > 0;

  return NextResponse.json({
    hasClassification,
    hasCompletedNps,
    shouldShowNps: hasClassification && !hasCompletedNps,
  });
}
