// Job handlers (SSC-39). Each one is safe to run more than once for the same
// job id: analytics events carry the job id as PostHog's dedupe uuid, pushes
// write a receipt (queue.ts) and retry only the endpoints that failed, and
// fan-out jobs derive their children's ids from the run so a repeated page
// produces the same children (already-receipted ones are skipped).
import type PocketBase from "pocketbase";

import { createPocketbaseAdminClient } from "@/lib/pocketbase/adminClient";

import { enqueueJobs } from "./queue";
import type { Job, Notification } from "./types";
import { pushTopic, sendWebPush, type PushResult, type VapidConfig } from "./webpush";

/** Retrying will not help (bad config, invalid data): park immediately. */
export class PermanentJobError extends Error {}

export type HandlerDeps = { pb?: () => Promise<PocketBase>; fetchImpl?: typeof fetch };
export type HandlerResult = Record<string, unknown>;

/** Devices per user per job. Keeps a consumer batch under the 50-subrequest Free cap. */
export const MAX_ENDPOINTS_PER_USER = 5;
/** Follow-up attempts for endpoints that failed with a retryable status. */
export const MAX_PUSH_RETRIES = 4;
const FAN_OUT_PAGE = 200;
const MAX_FAN_OUT_PAGES = 10;
const ICON = "https://github.com/Signal-K/client/blob/main/public/assets/Captn.jpg?raw=true";

function vapidConfig(): VapidConfig | null {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) return null;
  return { publicKey, privateKey, subject: process.env.VAPID_SUBJECT || "mailto:admin@starsailors.app" };
}

function posthogIngestHost(): string {
  const region = (process.env.posthog_region || "US Cloud").toLowerCase();
  return region.includes("eu") ? "https://eu.i.posthog.com" : "https://us.i.posthog.com";
}

async function captureAnalytics(job: Extract<Job, { type: "analytics.capture" }>, deps: HandlerDeps): Promise<HandlerResult> {
  const apiKey = process.env.posthog_api_key ?? process.env.POSTHOG_API_KEY ?? process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!apiKey) return { skipped: "no PostHog key" };

  const response = await (deps.fetchImpl ?? fetch)(`${posthogIngestHost()}/batch/`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      api_key: apiKey,
      batch: [
        {
          event: job.event,
          distinct_id: job.distinctId,
          properties: { ...job.properties, $lib: "starsailors-worker" },
          timestamp: job.timestamp,
          // PostHog drops a second event with the same uuid: redelivery-safe.
          uuid: job.id,
        },
      ],
    }),
  });
  if (response.ok) return { captured: 1 };
  const message = `PostHog ${response.status}: ${(await response.text().catch(() => "")).slice(0, 200)}`;
  if (response.status === 429 || response.status >= 500) throw new Error(message);
  throw new PermanentJobError(message);
}

type SubscriptionRow = { id: string; endpoint: string; auth: string; p256dh: string };

/** Push to a user's devices; schedules a narrowed retry for retryable failures. */
async function deliverToUser(
  pb: PocketBase,
  job: Job,
  userId: string,
  notification: Notification,
  options: { topic?: string; endpoints?: string[]; fetchImpl?: typeof fetch },
): Promise<HandlerResult> {
  const vapid = vapidConfig();
  if (!vapid) throw new PermanentJobError("NEXT_PUBLIC_VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY are not configured");

  const rows = await pb.collection("push_subscriptions").getList<SubscriptionRow>(1, 50, {
    filter: pb.filter("profileId = {:id}", { id: userId }),
    sort: "-createdAt",
    fields: "id,endpoint,auth,p256dh",
  });
  const byEndpoint = new Map<string, SubscriptionRow[]>();
  for (const row of rows.items) {
    if (!row.endpoint) continue;
    byEndpoint.set(row.endpoint, [...(byEndpoint.get(row.endpoint) ?? []), row]);
  }
  const only = options.endpoints ? new Set(options.endpoints) : null;
  const targets = [...byEndpoint.entries()].filter(([endpoint]) => !only || only.has(endpoint)).slice(0, MAX_ENDPOINTS_PER_USER);
  if (!targets.length) return { sent: 0, reason: "no subscriptions" };

  const payload = JSON.stringify({ title: notification.title, body: notification.body, url: notification.url, icon: ICON });
  const results: PushResult[] = [];
  for (const [endpoint, [row]] of targets) {
    results.push(await sendWebPush({ endpoint, auth: row.auth, p256dh: row.p256dh }, payload, vapid, { topic: options.topic, fetchImpl: options.fetchImpl }));
  }

  // Maintenance: the browser unsubscribed, so drop every row for that endpoint.
  const gone = results.filter((r) => r.outcome === "gone").flatMap((r) => byEndpoint.get(r.endpoint) ?? []);
  await Promise.all(gone.map((row) => pb.collection("push_subscriptions").delete(row.id).catch(() => undefined)));

  const retry = results.filter((r) => r.outcome === "retry").map((r) => r.endpoint);
  const rejected = results.filter((r): r is Extract<PushResult, { outcome: "rejected" }> => r.outcome === "rejected");
  for (const r of rejected) console.warn(`[jobs] push rejected (${r.status}) for ${new URL(r.endpoint).host}: ${r.error}`);

  if (retry.length) {
    const [rootId, attempt] = splitRetryId(job.id);
    if (attempt >= MAX_PUSH_RETRIES) {
      // Parked as is: this job already lists only the failing endpoints, so a
      // replay retries just those.
      throw new PermanentJobError(`push failed for ${retry.length} endpoint(s) after ${attempt + 1} attempts`);
    }
    await enqueueJobs({
      type: "push.user",
      id: `${rootId}~r${attempt + 1}`,
      userId,
      notification,
      topic: options.topic,
      endpoints: retry,
      delaySeconds: 60 * 2 ** attempt,
    });
  }

  return { sent: results.filter((r) => r.outcome === "sent").length, gone: gone.length, retrying: retry.length, rejected: rejected.length };
}

/** `abc~r2` → ["abc", 2]; follow-up ids are deterministic, so receipts dedupe them too. */
export function splitRetryId(id: string): [string, number] {
  const match = id.match(/^(.*)~r(\d+)$/);
  return match ? [match[1], Number(match[2])] : [id, 0];
}

async function subscribedUsersPage(pb: PocketBase, page: number) {
  const result = await pb.collection("push_subscriptions").getList(page, FAN_OUT_PAGE, { sort: "profileId", fields: "profileId" });
  const users = [...new Set(result.items.map((row) => row.profileId).filter((id): id is string => typeof id === "string" && id.length > 0))];
  const hasMore = page < Math.min(result.totalPages, MAX_FAN_OUT_PAGES);
  return { users, hasMore };
}

async function discoveryReminder(pb: PocketBase, job: Extract<Job, { type: "reminders.discovery-user" }>, deps: HandlerDeps) {
  const linked = await pb.collection("linked_anomalies").getList(1, 100, {
    filter: pb.filter("author = {:author}", { author: job.userId }),
    sort: "-date",
    fields: "anomalyId",
  });
  const anomalyIds = [...new Set(linked.items.map((row) => Number(row.anomalyId)).filter((id) => Number.isFinite(id) && id > 0))];
  if (!anomalyIds.length) return { sent: 0, reason: "no discoveries" };

  const classified = await pb.collection("ss_classifications").getList(1, 200, {
    filter: `${pb.filter("author = {:author}", { author: job.userId })} && (${anomalyIds.map((id) => `anomaly = ${id}`).join(" || ")})`,
    fields: "anomaly",
  });
  const done = new Set(classified.items.map((row) => Number(row.anomaly)));
  const pending = anomalyIds.filter((id) => !done.has(id));
  if (!pending.length) return { sent: 0, reason: "all classified" };

  const first = await pb
    .collection("anomalies")
    .getFirstListItem(pb.filter("legacyId = {:id}", { id: pending[0] }), { fields: "content" })
    .catch(() => null);
  const name = (first?.content as string | undefined) || `Discovery #${pending[0]}`;
  const notification: Notification =
    pending.length === 1
      ? { title: "Discovery Reminder: Classification Needed!", body: `Don't forget to classify: ${name}`, url: "/structures/telescope" }
      : { title: `${pending.length} Discoveries Need Classification!`, body: `You have ${pending.length} unclassified discoveries waiting`, url: "/structures/telescope" };

  return deliverToUser(pb, job, job.userId, notification, { topic: pushTopic(`reminder-${job.day}`), fetchImpl: deps.fetchImpl });
}

export async function runJob(job: Job, deps: HandlerDeps = {}): Promise<HandlerResult> {
  const pb = () => (deps.pb ?? createPocketbaseAdminClient)();
  switch (job.type) {
    case "analytics.capture":
      return captureAnalytics(job, deps);
    case "push.user":
      return deliverToUser(await pb(), job, job.userId, job.notification, {
        topic: job.topic,
        endpoints: job.endpoints,
        fetchImpl: deps.fetchImpl,
      });
    case "push.broadcast": {
      const { users, hasMore } = await subscribedUsersPage(await pb(), job.page);
      await enqueueJobs([
        ...users.map((userId) => ({
          type: "push.user" as const,
          id: `${job.runId}:${userId}`,
          userId,
          notification: job.notification,
          topic: pushTopic(job.runId),
        })),
        ...(hasMore ? [{ type: "push.broadcast" as const, id: `${job.runId}:p${job.page + 1}`, notification: job.notification, runId: job.runId, page: job.page + 1 }] : []),
      ]);
      return { users: users.length, nextPage: hasMore };
    }
    case "reminders.discoveries": {
      const { users, hasMore } = await subscribedUsersPage(await pb(), job.page);
      await enqueueJobs([
        ...users.map((userId) => ({ type: "reminders.discovery-user" as const, id: `reminder:${job.day}:${userId}`, userId, day: job.day })),
        ...(hasMore ? [{ type: "reminders.discoveries" as const, id: `reminders:${job.day}:p${job.page + 1}`, day: job.day, page: job.page + 1 }] : []),
      ]);
      return { users: users.length, nextPage: hasMore };
    }
    case "reminders.discovery-user":
      return discoveryReminder(await pb(), job, deps);
  }
}
