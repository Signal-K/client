// Cron and queue entry points of the app Worker (SSC-37, SSC-39).
//
//   SNAPSHOT_CRON          recompute the public snapshots into Workers KV
//   DISCOVERY_REMINDER_CRON start the daily reminder fan-out (production only)
//   queue JOBS / JOBS_DLQ  run background jobs / park dead-lettered ones
//
// Both run with the same 10 ms CPU cap as requests on Workers Free, so each
// step is bounded: snapshot producers read a few PocketBase pages, and a queue
// batch is at most `max_batch_size` (4) jobs of a few subrequests each.
import { consumeJobBatch, type QueueMessageLike } from "@/src/server/jobs/consumer";
import { enqueueJobs } from "@/src/server/jobs/queue";
import { refreshSnapshots } from "@/src/server/snapshots/store";

export const SNAPSHOT_CRON = "*/10 * * * *";
export const DISCOVERY_REMINDER_CRON = "0 17 * * *";

export async function runScheduled(cron: string, scheduledTime: number): Promise<Record<string, unknown>> {
  if (cron === DISCOVERY_REMINDER_CRON) {
    const day = new Date(scheduledTime).toISOString().slice(0, 10);
    const queued = await enqueueJobs({ type: "reminders.discoveries", id: `reminders:${day}:p1`, day, page: 1 });
    return { task: "discovery-reminders", day, ...queued };
  }
  // SNAPSHOT_CRON, and any cron added later without a handler of its own.
  const report = await refreshSnapshots({ now: scheduledTime });
  return { task: "snapshots", ...report };
}

export type QueueBatchLike = { queue: string; messages: readonly QueueMessageLike[] };

export async function runQueueBatch(batch: QueueBatchLike) {
  const outcomes = await consumeJobBatch(batch.messages, { deadLetterQueue: batch.queue.endsWith("-dlq") });
  const counts: Record<string, number> = {};
  for (const { outcome } of outcomes) counts[outcome] = (counts[outcome] ?? 0) + 1;
  return { queue: batch.queue, messages: batch.messages.length, ...counts };
}
