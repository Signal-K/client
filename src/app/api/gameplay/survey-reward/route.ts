import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/server/prisma";
import { getRouteUser } from "@/lib/server/supabaseRoute";

export const dynamic = "force-dynamic";

const SURVEY_STARDUST_REWARD = 5;

export async function POST(req: NextRequest) {
  const { user, authError } = await getRouteUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { surveyId?: string; surveyName?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { surveyId, surveyName } = body;

  if (!surveyId || typeof surveyId !== "string") {
    return NextResponse.json({ error: "surveyId is required" }, { status: 400 });
  }

  const userId = user.id;

  // Attempt INSERT — silently ignores duplicates via ON CONFLICT DO NOTHING.
  // RETURNING id will be null if the row already existed.
  const rows = await prisma.$queryRaw<Array<{ id: string }>>`
    INSERT INTO survey_rewards (user_id, survey_id, survey_name, stardust_granted)
    VALUES (
      ${userId}::uuid,
      ${surveyId},
      ${surveyName ?? null},
      ${SURVEY_STARDUST_REWARD}
    )
    ON CONFLICT (user_id, survey_id) DO NOTHING
    RETURNING id
  `;

  if (rows.length === 0) {
    // Row already existed — reward was already granted
    return NextResponse.json({ granted: false, alreadyGranted: true });
  }

  return NextResponse.json({
    granted: true,
    alreadyGranted: false,
    stardust: SURVEY_STARDUST_REWARD,
  });
}
