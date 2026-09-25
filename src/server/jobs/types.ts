// Background job messages (SSC-39). Everything a queue consumer can receive,
// versioned so an old message left in the queue after a deploy is rejected
// cleanly (and parked for replay) instead of being misread.

export const JOB_SCHEMA_VERSION = 1;

export type Notification = { title: string; body: string; url: string };

export type JobPayload =
  /** Server-side PostHog event. PostHog deduplicates on the job id (uuid). */
  | { type: "analytics.capture"; distinctId: string; event: string; properties: Record<string, unknown>; timestamp: string }
  /** Push to one user's devices; `endpoints` narrows a retry to the ones that failed. */
  | { type: "push.user"; userId: string; notification: Notification; topic?: string; endpoints?: string[] }
  /** Fan-out: one push.user per subscribed user, a page at a time (admin broadcast). */
  | { type: "push.broadcast"; notification: Notification; runId: string; page: number }
  /** Fan-out: one reminders.discovery-user per subscribed user, a page at a time (daily cron). */
  | { type: "reminders.discoveries"; day: string; page: number }
  /** Remind one user about linked anomalies they have not classified yet. */
  | { type: "reminders.discovery-user"; userId: string; day: string };

export type JobType = JobPayload["type"];

export type Job = JobPayload & {
  v: typeof JOB_SCHEMA_VERSION;
  /** Stable across retries and redeliveries; the idempotency key. */
  id: string;
  createdAt: string;
};

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);
const isString = (value: unknown): value is string => typeof value === "string" && value.length > 0;
const isNotification = (value: unknown): value is Notification =>
  isRecord(value) && isString(value.title) && typeof value.body === "string" && isString(value.url);

/** Validates a message body; null means it cannot be processed by this version. */
export function parseJob(body: unknown): Job | null {
  if (!isRecord(body) || body.v !== JOB_SCHEMA_VERSION || !isString(body.id) || !isString(body.createdAt)) return null;
  switch (body.type) {
    case "analytics.capture":
      return isString(body.distinctId) && isString(body.event) && isRecord(body.properties) && isString(body.timestamp) ? (body as Job) : null;
    case "push.user":
      return isString(body.userId) &&
        isNotification(body.notification) &&
        (body.endpoints === undefined || (Array.isArray(body.endpoints) && body.endpoints.every(isString)))
        ? (body as Job)
        : null;
    case "push.broadcast":
      return isNotification(body.notification) && isString(body.runId) && Number.isInteger(body.page) ? (body as Job) : null;
    case "reminders.discoveries":
      return isString(body.day) && Number.isInteger(body.page) ? (body as Job) : null;
    case "reminders.discovery-user":
      return isString(body.userId) && isString(body.day) ? (body as Job) : null;
    default:
      return null;
  }
}

/** Side effects that must not repeat when a message is delivered twice. */
export const RECEIPT_TYPES: ReadonlySet<JobType> = new Set(["push.user", "reminders.discovery-user"]);
