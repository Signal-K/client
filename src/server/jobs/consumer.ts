// Queue consumer (SSC-39). Called by the Worker's `queue()` handler for the
// jobs queue and its dead-letter queue, and by enqueueJobs() when it has to
// run jobs in the background instead.
//
//   success            ack; push jobs also write a receipt
//   already receipted  ack without repeating the side effect (redelivery)
//   retryable failure  retry with exponential backoff, up to MAX_ATTEMPTS
//   permanent failure, invalid body or last attempt
//                      park in KV (`jobs:dead:<id>`) and ack; see
//                      /api/internal/jobs for listing and replay
import { runJob, PermanentJobError, type HandlerDeps } from "./handlers";
import { hasReceipt, parkDeadLetter, writeReceipt } from "./queue";
import { parseJob, RECEIPT_TYPES, type Job } from "./types";

/** Must stay below wrangler.jsonc `max_retries` + 1 so we park before the platform dead-letters. */
export const MAX_ATTEMPTS = 5;

export type QueueMessageLike = {
  id: string;
  body: unknown;
  attempts: number;
  ack(): void;
  retry(options?: { delaySeconds?: number }): void;
};

export const backoffSeconds = (attempts: number) => Math.min(15 * 60, 30 * 2 ** Math.max(0, attempts - 1));

export type JobOutcome = { id: string; type: string | null; outcome: "done" | "duplicate" | "retry" | "parked"; detail?: unknown };

async function execute(job: Job, deps: HandlerDeps) {
  const idempotent = RECEIPT_TYPES.has(job.type);
  if (idempotent && (await hasReceipt(job.id))) return { duplicate: true as const };
  const result = await runJob(job, deps);
  if (idempotent) await writeReceipt(job.id, { type: job.type, ...result });
  return { duplicate: false as const, result };
}

const errorText = (error: unknown) => (error instanceof Error ? error.message : String(error));

export async function consumeJobBatch(
  messages: readonly QueueMessageLike[],
  options: { deadLetterQueue?: boolean; deps?: HandlerDeps } = {},
): Promise<JobOutcome[]> {
  const outcomes: JobOutcome[] = [];
  // Sequential: keeps the batch's subrequests and CPU predictable.
  for (const message of messages) {
    const job = parseJob(message.body);

    if (options.deadLetterQueue || !job) {
      await parkDeadLetter({
        id: job?.id ?? `invalid:${message.id}`,
        job,
        body: job ? undefined : message.body,
        error: job ? "Delivered to the dead-letter queue after exhausting retries" : "Invalid or unsupported job message",
        attempts: message.attempts,
        source: options.deadLetterQueue ? "dead-letter-queue" : "consumer",
      });
      message.ack();
      outcomes.push({ id: job?.id ?? message.id, type: job?.type ?? null, outcome: "parked" });
      continue;
    }

    try {
      const { duplicate, result } = await execute(job, options.deps ?? {});
      message.ack();
      outcomes.push({ id: job.id, type: job.type, outcome: duplicate ? "duplicate" : "done", detail: result });
    } catch (error) {
      const permanent = error instanceof PermanentJobError;
      if (!permanent && message.attempts < MAX_ATTEMPTS) {
        console.warn(`[jobs] ${job.type} ${job.id} attempt ${message.attempts} failed, retrying: ${errorText(error)}`);
        message.retry({ delaySeconds: backoffSeconds(message.attempts) });
        outcomes.push({ id: job.id, type: job.type, outcome: "retry", detail: errorText(error) });
        continue;
      }
      await parkDeadLetter({ id: job.id, job, error: errorText(error), attempts: message.attempts, source: "consumer" });
      message.ack();
      outcomes.push({ id: job.id, type: job.type, outcome: "parked", detail: errorText(error) });
    }
  }
  return outcomes;
}

/** Fallback when no queue is bound: one attempt each, failures parked for replay. */
export async function runJobsInBackground(jobs: Job[], deps: HandlerDeps = {}): Promise<JobOutcome[]> {
  const outcomes: JobOutcome[] = [];
  for (const job of jobs) {
    try {
      const { duplicate, result } = await execute(job, deps);
      outcomes.push({ id: job.id, type: job.type, outcome: duplicate ? "duplicate" : "done", detail: result });
    } catch (error) {
      await parkDeadLetter({ id: job.id, job, error: errorText(error), attempts: 1, source: "background" }).catch(() => undefined);
      outcomes.push({ id: job.id, type: job.type, outcome: "parked", detail: errorText(error) });
    }
  }
  return outcomes;
}
