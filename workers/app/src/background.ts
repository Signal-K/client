// Cron and queue entry points of the app Worker (SSC-37, SSC-39).
//
//   SNAPSHOT_CRON          recompute one public snapshot into Workers KV per tick, and on the
//                          17:00 UTC tick start the daily reminder fan-out instead
//   queue JOBS / JOBS_DLQ  run background jobs / park dead-lettered ones
//
// Both run with the same 10 ms CPU cap as requests on Workers Free, so each
// step is bounded: snapshot producers read a few PocketBase pages, and a queue
// batch is at most `max_batch_size` (4) jobs of a few subrequests each.
import { consumeJobBatch, type QueueMessageLike } from "@/src/server/jobs/consumer";
import { enqueueJobs } from "@/src/server/jobs/queue";
import { refreshSnapshots, snapshotForTick } from "@/src/server/snapshots/store";

// One snapshot per tick: refreshing all four in a single invocation measured
// 16-17 ms CPU on staging, over the 10 ms Free cap. 4 snapshots x 5 min = each
// refreshed every 20 min, inside the 30 min freshness window.
export const SNAPSHOT_CRON = "*/5 * * * *";
export const SNAPSHOT_TICK_MS = 5 * 60 * 1000;
// Workers Free allows 5 cron triggers per account, so the reminder shares the snapshot cron.
export const DISCOVERY_REMINDER_HOUR_UTC = 17;

// `remind` is false on staging: it shares production's PocketBase and users, so only snapshots run there.
export async function runScheduled(_cron: string, scheduledTime: number, remind = true): Promise<Record<string, unknown>> {
  const at = new Date(scheduledTime);
  if (remind && at.getUTCHours() === DISCOVERY_REMINDER_HOUR_UTC && at.getUTCMinutes() < SNAPSHOT_TICK_MS / 60000) {
    const day = new Date(scheduledTime).toISOString().slice(0, 10);
    const queued = await enqueueJobs({ type: "reminders.discoveries", id: `reminders:${day}:p1`, day, page: 1 });
    return { task: "discovery-reminders", day, ...queued };
  }
  const only = [snapshotForTick(scheduledTime, SNAPSHOT_TICK_MS)];
  const report = await refreshSnapshots({ now: scheduledTime, only });
  return { task: "snapshots", ...report };
}

export type QueueBatchLike = { queue: string; messages: readonly QueueMessageLike[] };

export async function runQueueBatch(batch: QueueBatchLike) {
  const outcomes = await consumeJobBatch(batch.messages, { deadLetterQueue: batch.queue.endsWith("-dlq") });
  const counts: Record<string, number> = {};
  for (const { outcome } of outcomes) counts[outcome] = (counts[outcome] ?? 0) + 1;
  return { queue: batch.queue, messages: batch.messages.length, ...counts };
}
