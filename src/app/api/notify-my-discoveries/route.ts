import { NextRequest, NextResponse } from "next/server";

import { getRouteUser } from "@/lib/server/routeAuth";
import { enqueueJobs } from "@/src/server/jobs/queue";
import type { Notification } from "@/src/server/jobs/types";

export const dynamic = "force-dynamic";

type DiscoveryInput = { anomalyId?: unknown; name?: unknown };

const clip = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");

function notificationFor(body: { customMessage?: Record<string, unknown>; unclassifiedDiscoveries?: DiscoveryInput[] }): Notification | null {
  if (body.customMessage) {
    const title = clip(body.customMessage.title, 120);
    const url = clip(body.customMessage.url, 200);
    if (!title) return null;
    return { title, body: clip(body.customMessage.body, 300), url: url.startsWith("/") ? url : "/structures/telescope" };
  }
  const discoveries = Array.isArray(body.unclassifiedDiscoveries) ? body.unclassifiedDiscoveries : [];
  if (!discoveries.length) return null;
  const first = discoveries[0];
  const name = clip(first?.name, 120) || `Discovery #${String(first?.anomalyId ?? "")}`;
  return discoveries.length === 1
    ? { title: "New Discovery Awaits Classification!", body: `Classify your discovery: ${name}`, url: "/structures/telescope" }
    : {
        title: `${discoveries.length} New Discoveries Await Classification!`,
        body: `You have ${discoveries.length} unclassified discoveries waiting for analysis`,
        url: "/structures/telescope",
      };
}

// SSC-39: queues a push to the signed-in user's own devices and returns at
// once; the queue consumer talks to the push services. (Previously this took
// any `userId` from the body without authentication and sent inline.)
export async function POST(request: NextRequest) {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const notification = notificationFor(body ?? {});
  if (!notification) {
    return NextResponse.json({ status: "skipped", message: "Nothing to notify about" });
  }

  const { mode, ids } = await enqueueJobs({ type: "push.user", userId: user.id, notification });
  return NextResponse.json({ status: "queued", mode, jobId: ids[0] }, { status: 202 });
}
