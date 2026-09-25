import { beforeEach, describe, expect, it, vi } from "vitest";

import { configurePlatform, createMemoryKV, type KVLike } from "@/src/server/platform";
import { fakePocketBase } from "@/src/server/testing/fakePocketBase";

import { backoffSeconds, consumeJobBatch, MAX_ATTEMPTS, type QueueMessageLike } from "./consumer";
import { MAX_PUSH_RETRIES, runJob, splitRetryId } from "./handlers";
import { enqueueJobs, listDeadLetters, replayDeadLetters, toJob, type EnqueueInput } from "./queue";
import { parseJob, type Job } from "./types";
import { b64urlEncode } from "./webpush";

let kv: KVLike;
let sent: Array<{ body: Job; delaySeconds?: number }>;
let background: Promise<unknown>[];

function install(options: { queue?: boolean; failSend?: boolean } = {}) {
  configurePlatform(() => ({
    kv,
    sendJobs:
      options.queue === false
        ? null
        : async (messages) => {
            if (options.failSend) throw new Error("Queue operations limit exceeded");
            sent.push(...(messages as typeof sent));
          },
    waitUntil: (promise) => background.push(promise),
    localFallback: false,
  }));
}

function message(body: unknown, attempts = 1) {
  const calls = { ack: 0, retry: [] as Array<{ delaySeconds?: number } | undefined> };
  const msg: QueueMessageLike = {
    id: "msg-1",
    body,
    attempts,
    ack: () => void calls.ack++,
    retry: (options) => void calls.retry.push(options),
  };
  return { msg, calls };
}

async function vapidEnv() {
  const pair = (await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign"])) as CryptoKeyPair;
  vi.stubEnv("NEXT_PUBLIC_VAPID_PUBLIC_KEY", b64urlEncode(await crypto.subtle.exportKey("raw", pair.publicKey)));
  vi.stubEnv("VAPID_PRIVATE_KEY", (await crypto.subtle.exportKey("jwk", pair.privateKey)).d!);
}

// A real browser subscription key pair so the payload encrypts.
async function subscription(id: string, endpoint: string, profileId = "user_1") {
  const ua = (await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"])) as CryptoKeyPair;
  return {
    id,
    profileId,
    endpoint,
    p256dh: b64urlEncode(await crypto.subtle.exportKey("raw", ua.publicKey)),
    auth: b64urlEncode(crypto.getRandomValues(new Uint8Array(16))),
    createdAt: id,
  };
}

const pushJob = (overrides: Partial<EnqueueInput> = {}) =>
  toJob({ type: "push.user", id: "job-1", userId: "user_1", notification: { title: "Hi", body: "There", url: "/game" }, ...overrides } as EnqueueInput);

beforeEach(() => {
  kv = createMemoryKV();
  sent = [];
  background = [];
  vi.unstubAllEnvs();
  install();
});

describe("parseJob", () => {
  it("accepts current messages and rejects old or malformed ones", () => {
    expect(parseJob(pushJob())).not.toBeNull();
    expect(parseJob({ ...pushJob(), v: 0 })).toBeNull();
    expect(parseJob({ ...pushJob(), type: "unknown" })).toBeNull();
    expect(parseJob({ ...pushJob(), notification: { title: "" } })).toBeNull();
    expect(parseJob("nope")).toBeNull();
  });
});

describe("enqueueJobs", () => {
  it("sends to the queue and returns without running anything", async () => {
    const result = await enqueueJobs({ type: "analytics.capture", distinctId: "u", event: "e", properties: {}, timestamp: "t" });
    expect(result.mode).toBe("queued");
    expect(sent).toHaveLength(1);
    expect(sent[0].body).toMatchObject({ v: 1, type: "analytics.capture", id: result.ids[0] });
    expect(background).toHaveLength(0);
  });

  it("runs jobs after the response via waitUntil when the queue rejects the send", async () => {
    install({ failSend: true });
    vi.spyOn(console, "error").mockImplementation(() => {});
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("{}"));
    vi.stubEnv("posthog_api_key", "phc_test");
    const result = await enqueueJobs({ type: "analytics.capture", distinctId: "u", event: "e", properties: {}, timestamp: "t" });
    expect(result.mode).toBe("background");
    expect(background).toHaveLength(1);
    await Promise.all(background);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    fetchSpy.mockRestore();
  });
});

describe("consumeJobBatch", () => {
  it("parks an invalid message instead of retrying it forever", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { msg, calls } = message({ v: 99, type: "push.user" });
    expect((await consumeJobBatch([msg]))[0].outcome).toBe("parked");
    expect(calls.ack).toBe(1);
    const [parked] = await listDeadLetters();
    expect(parked).toMatchObject({ id: "invalid:msg-1", job: null, body: { v: 99, type: "push.user" } });
  });

  it("retries a transient failure with backoff, then parks it on the last attempt", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    const failingPb = async () => {
      throw new Error("PocketBase 502");
    };
    await vapidEnv();
    const first = message(pushJob(), 1);
    await consumeJobBatch([first.msg], { deps: { pb: failingPb } });
    expect(first.calls).toEqual({ ack: 0, retry: [{ delaySeconds: backoffSeconds(1) }] });

    const last = message(pushJob(), MAX_ATTEMPTS);
    await consumeJobBatch([last.msg], { deps: { pb: failingPb } });
    expect(last.calls.ack).toBe(1);
    expect(last.calls.retry).toHaveLength(0);
    expect((await listDeadLetters())[0]).toMatchObject({ id: "job-1", error: "PocketBase 502", attempts: MAX_ATTEMPTS, source: "consumer" });
  });

  it("parks a permanent failure immediately", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { msg, calls } = message(pushJob(), 1); // no VAPID keys configured
    await consumeJobBatch([msg], { deps: { pb: async () => fakePocketBase({}).pb } });
    expect(calls).toEqual({ ack: 1, retry: [] });
    expect((await listDeadLetters())[0].error).toMatch(/VAPID/);
  });

  it("does not repeat a push when the message is delivered twice", async () => {
    await vapidEnv();
    const data = { push_subscriptions: [await subscription("s1", "https://push.example.net/a")] };
    const fetchImpl = vi.fn(async () => new Response(null, { status: 201 }));
    const deps = { pb: async () => fakePocketBase(data).pb, fetchImpl: fetchImpl as unknown as typeof fetch };

    const first = await consumeJobBatch([message(pushJob()).msg], { deps });
    const second = await consumeJobBatch([message(pushJob()).msg], { deps });
    expect(first[0]).toMatchObject({ outcome: "done", detail: { sent: 1 } });
    expect(second[0].outcome).toBe("duplicate");
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("parks messages that reach the dead-letter queue", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { msg, calls } = message(pushJob(), 6);
    await consumeJobBatch([msg], { deadLetterQueue: true });
    expect(calls.ack).toBe(1);
    expect((await listDeadLetters())[0]).toMatchObject({ id: "job-1", source: "dead-letter-queue" });
  });
});

describe("push.user", () => {
  it("retries only the failed endpoints and drops subscriptions the browser removed", async () => {
    await vapidEnv();
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const data = {
      push_subscriptions: [
        await subscription("s1", "https://push.example.net/ok"),
        await subscription("s2", "https://push.example.net/busy"),
        await subscription("s3", "https://push.example.net/gone"),
        await subscription("s4", "https://push.example.net/ok"), // duplicate endpoint
      ],
    };
    const fake = fakePocketBase(data);
    const status: Record<string, number> = { ok: 201, busy: 503, gone: 410 };
    const fetchImpl = vi.fn(async (url: string) => new Response(null, { status: status[url.split("/").pop()!] }));

    const result = await runJob(pushJob(), { pb: async () => fake.pb, fetchImpl: fetchImpl as unknown as typeof fetch });
    expect(result).toEqual({ sent: 1, gone: 1, retrying: 1, rejected: 0 });
    expect(fetchImpl).toHaveBeenCalledTimes(3);
    expect(fake.deleted).toEqual([["push_subscriptions", "s3"]]);
    expect(sent).toHaveLength(1);
    expect(sent[0]).toMatchObject({
      delaySeconds: 60,
      body: { type: "push.user", id: "job-1~r1", endpoints: ["https://push.example.net/busy"] },
    });
  });

  it("gives up after MAX_PUSH_RETRIES follow-ups", async () => {
    await vapidEnv();
    const data = { push_subscriptions: [await subscription("s1", "https://push.example.net/busy")] };
    const fetchImpl = vi.fn(async () => new Response(null, { status: 503 }));
    await expect(
      runJob(pushJob({ id: `job-1~r${MAX_PUSH_RETRIES}` }), { pb: async () => fakePocketBase(data).pb, fetchImpl: fetchImpl as unknown as typeof fetch }),
    ).rejects.toThrow(/after 5 attempts/);
    expect(sent).toHaveLength(0);
  });

  it("splits retry ids", () => {
    expect(splitRetryId("reminder:2026-09-25:u1")).toEqual(["reminder:2026-09-25:u1", 0]);
    expect(splitRetryId("abc~r3")).toEqual(["abc", 3]);
  });
});

describe("fan-out and reminders", () => {
  it("queues one reminder per subscribed user with per-day ids", async () => {
    const data = {
      push_subscriptions: [
        await subscription("s1", "https://p/1", "user_a"),
        await subscription("s2", "https://p/2", "user_a"),
        await subscription("s3", "https://p/3", "user_b"),
      ],
    };
    const job = toJob({ type: "reminders.discoveries", id: "reminders:2026-09-25:p1", day: "2026-09-25", page: 1 });
    expect(await runJob(job, { pb: async () => fakePocketBase(data).pb })).toEqual({ users: 2, nextPage: false });
    expect(sent.map((m) => m.body.id)).toEqual(["reminder:2026-09-25:user_a", "reminder:2026-09-25:user_b"]);
  });

  it("reminds a user only about discoveries they have not classified", async () => {
    await vapidEnv();
    const data = {
      linked_anomalies: [
        { author: "user_a", anomalyId: 7, date: "2" },
        { author: "user_a", anomalyId: 8, date: "1" },
      ],
      ss_classifications: [{ author: "user_a", anomaly: 7 }],
      anomalies: [{ legacyId: 8, content: "TIC 1234" }],
      push_subscriptions: [await subscription("s1", "https://push.example.net/a", "user_a")],
    };
    const bodies: string[] = [];
    const fetchImpl = vi.fn(async (_url: string, init: RequestInit) => {
      bodies.push((init.headers as Record<string, string>).topic);
      return new Response(null, { status: 201 });
    });
    const job = toJob({ type: "reminders.discovery-user", id: "reminder:2026-09-25:user_a", userId: "user_a", day: "2026-09-25" });
    expect(await runJob(job, { pb: async () => fakePocketBase(data).pb, fetchImpl: fetchImpl as unknown as typeof fetch })).toMatchObject({ sent: 1 });
    expect(bodies).toEqual(["reminder-2026-09-25"]);

    const allDone = { ...data, ss_classifications: [{ author: "user_a", anomaly: 7 }, { author: "user_a", anomaly: 8 }] };
    expect(await runJob(job, { pb: async () => fakePocketBase(allDone).pb })).toEqual({ sent: 0, reason: "all classified" });
  });
});

describe("analytics.capture", () => {
  it("uses the job id as PostHog's dedupe uuid", async () => {
    vi.stubEnv("posthog_api_key", "phc_test");
    const fetchImpl = vi.fn(async () => new Response("{}"));
    const job = toJob({ type: "analytics.capture", distinctId: "user_1", event: "classification_submitted", properties: { a: 1 }, timestamp: "2026-09-25T00:00:00Z" });
    await runJob(job, { fetchImpl: fetchImpl as unknown as typeof fetch });
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://us.i.posthog.com/batch/");
    expect(JSON.parse(String(init.body)).batch[0]).toMatchObject({ uuid: job.id, event: "classification_submitted", distinct_id: "user_1" });
  });

  it("retries PostHog outages but not rejected events", async () => {
    vi.stubEnv("posthog_api_key", "phc_test");
    const job = toJob({ type: "analytics.capture", distinctId: "u", event: "e", properties: {}, timestamp: "t" });
    const outage = vi.fn(async () => new Response("down", { status: 503 }));
    const bad = vi.fn(async () => new Response("bad", { status: 400 }));
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    const a = message(job);
    await consumeJobBatch([a.msg], { deps: { fetchImpl: outage as unknown as typeof fetch } });
    expect(a.calls.retry).toHaveLength(1);
    const b = message(job);
    await consumeJobBatch([b.msg], { deps: { fetchImpl: bad as unknown as typeof fetch } });
    expect(b.calls).toEqual({ ack: 1, retry: [] });
  });
});

describe("replayDeadLetters", () => {
  it("re-enqueues parked jobs under their original ids", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    await consumeJobBatch([message(pushJob(), 1).msg], { deps: { pb: async () => fakePocketBase({}).pb } }); // parks (no VAPID)
    await consumeJobBatch([message({ junk: true }).msg]);
    expect(await listDeadLetters()).toHaveLength(2);

    const result = await replayDeadLetters();
    expect(result).toEqual({ replayed: ["job-1"], skipped: ["invalid:msg-1"] });
    expect(sent.map((m) => m.body.id)).toEqual(["job-1"]);
    expect((await listDeadLetters()).map((d) => d.id)).toEqual(["invalid:msg-1"]);
  });
});
