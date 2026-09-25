import { NextResponse } from "next/server";

import { requireInternalToken } from "@/lib/server/internalAuth";
import { enqueueJobs, listDeadLetters, replayDeadLetters } from "@/src/server/jobs/queue";

export const dynamic = "force-dynamic";

// SSC-39 operator endpoint.
//   GET                                   parked (dead-lettered) jobs
//   POST {"action":"replay","ids"?:[..]}   re-enqueue parked jobs (all when ids is omitted)
//   POST {"action":"discovery-reminders"}  start the daily reminder fan-out now
export async function GET(request: Request) {
  const denied = requireInternalToken(request);
  if (denied) return denied;
  const parked = await listDeadLetters();
  return NextResponse.json({ count: parked.length, parked });
}

export async function POST(request: Request) {
  const denied = requireInternalToken(request);
  if (denied) return denied;

  const body = (await request.json().catch(() => ({}))) as { action?: string; ids?: unknown };
  if (body.action === "replay") {
    const ids = Array.isArray(body.ids) ? body.ids.filter((id): id is string => typeof id === "string") : undefined;
    return NextResponse.json(await replayDeadLetters(ids), { status: 202 });
  }
  if (body.action === "discovery-reminders") {
    const day = new Date().toISOString().slice(0, 10);
    const queued = await enqueueJobs({ type: "reminders.discoveries", id: `reminders:${day}:p1`, day, page: 1 });
    return NextResponse.json(queued, { status: 202 });
  }
  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
