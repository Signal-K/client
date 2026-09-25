import { enqueueJobs } from "@/src/server/jobs/queue";

/**
 * Server-side PostHog event (SSC-39). Queued rather than sent inline, so the
 * caller's response never waits on PostHog; the consumer delivers it with the
 * job id as PostHog's dedupe uuid.
 */
export async function captureServerEvent(
  distinctId: string,
  event: string,
  properties: Record<string, unknown> = {},
): Promise<void> {
  if (process.env.NODE_ENV === "development") return;
  try {
    await enqueueJobs({ type: "analytics.capture", distinctId, event, properties, timestamp: new Date().toISOString() });
  } catch (error) {
    // Analytics must never fail the user's action.
    console.warn(`[analytics] could not queue ${event}: ${String(error)}`);
  }
}
