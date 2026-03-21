import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/server/prisma";
import { isPrismaUniqueConstraintError } from "@/lib/server/researched";
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

  try {
    await prisma.surveyReward.create({
      data: {
        userId,
        surveyId,
        surveyName: surveyName ?? null,
        stardustGranted: SURVEY_STARDUST_REWARD,
      },
    });
  } catch (error) {
    if (isPrismaUniqueConstraintError(error)) {
      return NextResponse.json({ granted: false, alreadyGranted: true });
    }

    throw error;
  }

  return NextResponse.json({
    granted: true,
    alreadyGranted: false,
    stardust: SURVEY_STARDUST_REWARD,
  });
}
