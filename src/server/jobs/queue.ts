// Producer side of the background jobs (SSC-39), plus the KV records that make
// them idempotent (receipts) and recoverable (parked dead letters).
//
// In the Worker, enqueueJobs() sends to Cloudflare Queues (`JOBS` binding) and
// returns once the queue has accepted the messages, so interactive responses
// never wait on push services, PostHog or fan-out work. When the queue is not
// bound or rejects the send (for example the Free plan's daily operation
// limit), the jobs run after the response via ctx.waitUntil instead, and
// failures are parked the same way.
import { platform } from "@/src/server/platform";

import { JOB_SCHEMA_VERSION, type Job, type JobPayload } from "./types";

export type EnqueueInput = JobPayload & { id?: string; delaySeconds?: number };
export type EnqueueResult = { mode: "queued" | "background"; ids: string[] };

const QUEUE_SEND_BATCH = 100; // Queues sendBatch limit

export function toJob(input: EnqueueInput, now = Date.now()): Job {
  const { id, delaySeconds: _delay, ...payload } = input;
  return { ...(payload as JobPayload), v: JOB_SCHEMA_VERSION, id: id ?? crypto.randomUUID(), createdAt: new Date(now).toISOString() } as Job;
}

export async function enqueueJobs(inputs: EnqueueInput | EnqueueInput[]): Promise<EnqueueResult> {
  const list = Array.isArray(inputs) ? inputs : [inputs];
  const jobs = list.map((input) => ({ job: toJob(input), delaySeconds: input.delaySeconds }));
  const ids = jobs.map(({ job }) => job.id);
  if (!jobs.length) return { mode: "queued", ids };

  const { sendJobs, waitUntil } = platform();
  if (sendJobs) {
    try {
      for (let i = 0; i < jobs.length; i += QUEUE_SEND_BATCH) {
        await sendJobs(jobs.slice(i, i + QUEUE_SEND_BATCH).map(({ job, delaySeconds }) => ({ body: job, delaySeconds })));
      }
      return { mode: "queued", ids };
    } catch (error) {
      console.error(`[jobs] queue send failed, running ${jobs.length} job(s) in the background: ${String(error)}`);
    }
  }

  const background = import("./consumer").then(({ runJobsInBackground }) => runJobsInBackground(jobs.map(({ job }) => job)));
  if (waitUntil) waitUntil(background);
  else void background.catch((error) => console.error("[jobs] background run failed", error));
  return { mode: "background", ids };
}

// ── Receipts: "this job's side effect already happened" ──────────────────────

const RECEIPT_PREFIX = "jobs:done:";
const RECEIPT_TTL_SECONDS = 3 * 24 * 60 * 60;

export async function hasReceipt(id: string): Promise<boolean> {
  return (await platform().kv.get(RECEIPT_PREFIX + id, "json")) !== null;
}

export async function writeReceipt(id: string, summary: Record<string, unknown>): Promise<void> {
  await platform().kv.put(RECEIPT_PREFIX + id, JSON.stringify({ at: new Date().toISOString(), ...summary }), {
    expirationTtl: RECEIPT_TTL_SECONDS,
  });
}

// ── Dead letters: jobs that exhausted their retries, kept for replay ─────────

export const DEAD_PREFIX = "jobs:dead:";
const DEAD_TTL_SECONDS = 14 * 24 * 60 * 60;

export type DeadLetter = {
  id: string;
  /** The job, or the raw body when it failed validation. */
  job: Job | null;
  body?: unknown;
  error: string;
  attempts: number;
  failedAt: string;
  source: "consumer" | "dead-letter-queue" | "background";
};

export async function parkDeadLetter(entry: Omit<DeadLetter, "failedAt">): Promise<void> {
  const record: DeadLetter = { ...entry, error: entry.error.slice(0, 1000), failedAt: new Date().toISOString() };
  console.error(`[jobs] parked ${entry.job?.type ?? "invalid"} job ${entry.id} after ${entry.attempts} attempt(s): ${record.error}`);
  await platform().kv.put(DEAD_PREFIX + entry.id, JSON.stringify(record), { expirationTtl: DEAD_TTL_SECONDS });
}

export async function listDeadLetters(limit = 50): Promise<DeadLetter[]> {
  const kv = platform().kv;
  const { keys } = await kv.list({ prefix: DEAD_PREFIX, limit });
  const records = await Promise.all(keys.map(({ name }) => kv.get(name, "json") as Promise<DeadLetter | null>));
  return records.filter((r): r is DeadLetter => r !== null);
}

/**
 * Re-enqueue parked jobs (all listed, or only `ids`) under their original ids,
 * so receipts still stop a job whose side effect did happen from repeating.
 * Invalid bodies cannot be replayed and stay parked.
 */
export async function replayDeadLetters(ids?: string[]): Promise<{ replayed: string[]; skipped: string[] }> {
  const kv = platform().kv;
  const wanted = ids ? new Set(ids) : null;
  const parked = (await listDeadLetters(100)).filter((entry) => !wanted || wanted.has(entry.id));
  const replayable = parked.filter((entry) => entry.job);
  if (replayable.length) {
    await enqueueJobs(replayable.map(({ job }) => ({ ...job! })));
    await Promise.all(replayable.map((entry) => kv.delete(DEAD_PREFIX + entry.id)));
  }
  return { replayed: replayable.map((e) => e.id), skipped: parked.filter((e) => !e.job).map((e) => e.id) };
}
