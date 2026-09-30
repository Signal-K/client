import { NextRequest, NextResponse } from "next/server";

import { requireInternalToken } from "@/lib/server/internalAuth";
import { enqueueJobs } from "@/src/server/jobs/queue";

export const dynamic = "force-dynamic";

// SSC-39: the daily unclassified-discovery reminder now runs from the
// Worker's cron trigger as a queued fan-out. This endpoint starts the same
// fan-out on demand; it needs INTERNAL_JOBS_TOKEN (it was previously open).
// Job ids are per day, so a second call on the same day sends nothing new.
export async function POST(request: NextRequest) {
  const denied = requireInternalToken(request);
  if (denied) return denied;

  const day = new Date().toISOString().slice(0, 10);
  const queued = await enqueueJobs({ type: "reminders.discoveries", id: `reminders:${day}:p1`, day, page: 1 });
  return NextResponse.json({ status: "queued", day, ...queued }, { status: 202 });
}
