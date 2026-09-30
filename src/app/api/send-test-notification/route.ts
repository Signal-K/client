import { NextRequest, NextResponse } from "next/server";

import { requireInternalToken } from "@/lib/server/internalAuth";
import { enqueueJobs } from "@/src/server/jobs/queue";

export const dynamic = "force-dynamic";

// SSC-39: operator broadcast to every subscribed device. Queues a paged
// fan-out (one push.user job per user) instead of sending inline, and needs
// INTERNAL_JOBS_TOKEN (it was previously open to anyone).
export async function POST(request: NextRequest) {
  const denied = requireInternalToken(request);
  if (denied) return denied;

  const body = await request.json().catch(() => ({}));
  const notification = {
    title: typeof body?.title === "string" && body.title ? body.title.slice(0, 120) : "Test Notification",
    body: typeof body?.message === "string" && body.message ? body.message.slice(0, 300) : "This is a test push notification!",
    url: typeof body?.url === "string" && body.url.startsWith("/") ? body.url : "/",
  };
  const runId = `broadcast-${crypto.randomUUID().slice(0, 8)}`;
  const queued = await enqueueJobs({ type: "push.broadcast", id: `${runId}:p1`, notification, runId, page: 1 });
  return NextResponse.json({ status: "queued", runId, ...queued }, { status: 202 });
}
