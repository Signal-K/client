import { NextResponse } from "next/server";

import { communityMilestones, milestones } from "@/src/lib/gameplay/milestones-data";

export async function GET() {
  const today = new Date();

  const mostRecentMilestone = milestones
    .map((milestone) => ({ ...milestone, weekStartDate: new Date(milestone.weekStart) }))
    .filter((milestone) => milestone.weekStartDate <= today)
    .sort((a, b) => b.weekStartDate.getTime() - a.weekStartDate.getTime())[0];

  return NextResponse.json({
    playerMilestones: mostRecentMilestone ? [mostRecentMilestone] : [],
    communityMilestones,
  });
}
