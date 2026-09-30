#!/usr/bin/env node
// SSC-38 Free-plan budget evidence for a deployed Star Sailors Worker.
//
//   node scripts/cloudflare/measure-budget.mjs --base https://staging.starsailors.space \
//     [--env staging] [--tail] [--samples 5] [--out budget.json]
//
// Sends the representative anonymous, authenticated read, mutation and refresh
// requests and records per route: status, response size, latency (first
// request vs warm), `x-ssc-subrequests`, Error 1102s and the error rate. With
// --tail (needs CLOUDFLARE_API_TOKEN) it also runs `wrangler tail` and reads
// each request's CPU/wall time and outcome, matched by a unique query marker.
// Requests with no tail event were served by Workers Static Assets and never
// invoked the Worker.
//
// Authenticated flows need a Clerk session: BUDGET_SESSION_TOKEN (a session
// JWT, valid ~60s), or CLERK_SECRET_KEY + BUDGET_SESSION_ID to mint a fresh
// token before each authenticated request. Without either they are skipped.
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { writeFileSync } from "node:fs";

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  if (i === -1) return fallback;
  const next = args[i + 1];
  return next && !next.startsWith("--") ? next : true;
};

const base = String(flag("base", "")).replace(/\/$/, "");
if (!base) {
  console.error("usage: measure-budget.mjs --base <url> [--env staging] [--tail] [--samples N] [--out file.json]");
  process.exit(2);
}
const samples = Number(flag("samples", 5));
const wranglerEnv = flag("env", "");
const useTail = flag("tail", false) === true;
const outFile = flag("out", "");

const CPU_BUDGET_MS = 10; // Workers Free
const SUBREQUEST_BUDGET = 50; // Workers Free

// `expect` is the status that counts as success for that flow.
const routes = [
  { flow: "anonymous", name: "Landing", method: "GET", path: "/", expect: 200 },
  { flow: "anonymous", name: "Sign-in page", method: "GET", path: "/auth", expect: 200 },
  { flow: "anonymous", name: "Garden hub shell", method: "GET", path: "/game", expect: 200 },
  { flow: "anonymous", name: "Dynamic page (placeholder)", method: "GET", path: "/posts/1", expect: 200 },
  { flow: "anonymous", name: "Signed-out API read", method: "GET", path: "/api/auth/session", expect: 401 },
  { flow: "anonymous", name: "Unknown path (404 page)", method: "GET", path: "/budget-missing-page", expect: 404 },
  // SSC-37: precomputed public data, read from KV only.
  { flow: "anonymous", name: "Landing stats snapshot", method: "GET", path: "/api/public/snapshots/landing-stats", expect: 200 },
  { flow: "anonymous", name: "Sunspot leaderboard snapshot", method: "GET", path: "/api/gameplay/leaderboards/sunspots", expect: 200 },
  { flow: "anonymous", name: "Community activity snapshot", method: "GET", path: "/api/community-activity", expect: 200 },
  { flow: "anonymous", name: "Snapshot health", method: "GET", path: "/api/public/status", expect: 200 },
  { flow: "authenticated read", name: "Session check", method: "GET", path: "/api/auth/session", expect: 200, auth: true },
  { flow: "authenticated read", name: "SSC-35 /api/v1/me", method: "GET", path: "/api/v1/me", expect: 200, auth: true },
  { flow: "authenticated read", name: "Hub bootstrap", method: "GET", path: "/api/gameplay/hub/bootstrap", expect: 200, auth: true },
  { flow: "authenticated read", name: "Profile", method: "GET", path: "/api/gameplay/profile/me", expect: 200, auth: true },
  { flow: "mutation", name: "Ensure profile (idempotent)", method: "POST", path: "/api/gameplay/profile/ensure", expect: 200, auth: true },
  { flow: "mutation", name: "Former server action", method: "POST", path: "/api/actions/getCurrentProfileAction", body: { args: [] }, expect: 200, auth: true },
  // SSC-39: answers 202 once the push is queued; the consumer shows up under "Background invocations".
  { flow: "mutation", name: "Queue a push to self", method: "POST", path: "/api/notify-my-discoveries", body: { customMessage: { title: "Budget check", body: "Star Sailors budget measurement", url: "/game" } }, expect: 202, auth: true },
  { flow: "refresh", name: "Hub reload: shell", method: "GET", path: "/game", expect: 200, auth: true },
  { flow: "refresh", name: "Hub reload: bootstrap", method: "GET", path: "/api/gameplay/hub/bootstrap", expect: 200, auth: true },
];

async function sessionToken() {
  const { CLERK_SECRET_KEY, BUDGET_SESSION_ID, BUDGET_SESSION_TOKEN } = process.env;
  if (CLERK_SECRET_KEY && BUDGET_SESSION_ID) {
    const res = await fetch(`https://api.clerk.com/v1/sessions/${encodeURIComponent(BUDGET_SESSION_ID)}/tokens`, {
      method: "POST",
      headers: { authorization: `Bearer ${CLERK_SECRET_KEY}` },
    });
    if (!res.ok) throw new Error(`Clerk token mint failed: ${res.status} ${await res.text()}`);
    return (await res.json()).jwt;
  }
  return BUDGET_SESSION_TOKEN || null;
}

function startTail() {
  const events = [];
  const tailArgs = ["wrangler", "tail", "--format", "json", ...(wranglerEnv ? ["--env", String(wranglerEnv)] : [])];
  const child = spawn("npx", tailArgs, { stdio: ["ignore", "pipe", "inherit"] });
  let buffer = "";
  child.stdout.on("data", (chunk) => {
    buffer += chunk;
    // wrangler prints one (pretty-printed) JSON object per event; split on
    // balanced top-level braces, ignoring braces inside strings.
    let depth = 0;
    let start = -1;
    let inString = false;
    let consumed = 0;
    for (let i = 0; i < buffer.length; i++) {
      const c = buffer[i];
      if (inString) {
        if (c === "\\") i++;
        else if (c === '"') inString = false;
      } else if (c === '"') {
        inString = true;
      } else if (c === "{") {
        if (depth++ === 0) start = i;
      } else if (c === "}" && depth > 0 && --depth === 0) {
        try {
          events.push(JSON.parse(buffer.slice(start, i + 1)));
        } catch {}
        consumed = i + 1;
      }
    }
    buffer = buffer.slice(consumed);
  });
  return { events, stop: () => child.kill("SIGINT") };
}

async function measure(route, marker, token) {
  const url = new URL(route.path, base);
  url.searchParams.set("__budget", marker);
  const headers = {};
  if (token) headers.authorization = `Bearer ${token}`;
  if (route.body) headers["content-type"] = "application/json";
  const started = performance.now();
  const res = await fetch(url, {
    method: route.method,
    headers,
    body: route.body ? JSON.stringify(route.body) : undefined,
    redirect: "manual",
  });
  const ttfb = performance.now() - started;
  const body = new Uint8Array(await res.arrayBuffer());
  const total = performance.now() - started;
  const text = res.status >= 500 ? new TextDecoder().decode(body.slice(0, 4096)) : "";
  return {
    marker,
    status: res.status,
    ok: res.status === route.expect,
    error1102: /1102|exceeded resource limits/i.test(text),
    bytes: body.byteLength,
    ttfbMs: Math.round(ttfb),
    totalMs: Math.round(total),
    subrequests: res.headers.has("x-ssc-subrequests") ? Number(res.headers.get("x-ssc-subrequests")) : null,
    ray: res.headers.get("cf-ray"),
  };
}

const median = (xs) => {
  const s = xs.filter((x) => x != null).sort((a, b) => a - b);
  return s.length ? s[Math.floor(s.length / 2)] : null;
};
const max = (xs) => {
  const s = xs.filter((x) => x != null);
  return s.length ? Math.max(...s) : null;
};

const tail = useTail ? startTail() : null;
if (tail) await new Promise((r) => setTimeout(r, 8000)); // let the tail session attach

const results = [];
for (const route of routes) {
  const runs = [];
  for (let i = 0; i < samples; i++) {
    let token = null;
    if (route.auth) {
      token = await sessionToken();
      if (!token) break;
    }
    try {
      runs.push(await measure(route, randomUUID(), token));
    } catch (error) {
      runs.push({ marker: null, status: 0, ok: false, error1102: false, bytes: 0, ttfbMs: null, totalMs: null, subrequests: null, error: String(error) });
    }
  }
  results.push({ ...route, runs, skipped: runs.length === 0 });
}

if (tail) {
  await new Promise((r) => setTimeout(r, 10000)); // tail delivery lag
  tail.stop();
  for (const result of results) {
    for (const run of result.runs) {
      const event = tail.events.find((e) => e?.event?.request?.url?.includes(`__budget=${run.marker}`));
      if (!event) {
        run.worker = false;
        continue;
      }
      run.worker = true;
      run.outcome = event.outcome;
      run.cpuMs = event.cpuTime ?? null;
      run.wallMs = event.wallTime ?? null;
    }
  }
}

// Cron and queue invocations seen by the tail during the run (SSC-37/39).
// A cron fires every 10 minutes, so a short run may not see one.
const backgroundRows = [];
if (tail) {
  const groups = new Map();
  for (const e of tail.events) {
    const label = e?.event?.cron ? `cron ${e.event.cron}` : e?.event?.queue ? `queue ${e.event.queue}` : null;
    if (!label) continue;
    groups.set(label, [...(groups.get(label) ?? []), e]);
  }
  for (const [label, events] of groups) {
    const cpu = events.map((e) => e.cpuTime ?? null);
    const exceeded = events.some((e) => e.outcome === "exceededCpu" || e.outcome === "exceededResources");
    backgroundRows.push({
      invocation: label,
      count: events.length,
      outcomes: [...new Set(events.map((e) => e.outcome))].join("/"),
      cpuMsMax: max(cpu),
      cpuMsMedian: median(cpu),
      withinBudget: !exceeded && (max(cpu) == null || max(cpu) <= CPU_BUDGET_MS),
    });
  }
}

const rows = results.map((r) => {
  const runs = r.runs;
  const failures = runs.filter((x) => !x.ok).length;
  const cpu = runs.map((x) => x.cpuMs);
  const sub = runs.map((x) => x.subrequests);
  const exceeded = runs.some((x) => x.error1102 || x.outcome === "exceededCpu" || x.outcome === "exceededResources");
  const invoked = !useTail ? "?" : runs.some((x) => x.worker) ? "Worker" : "asset";
  return {
    flow: r.flow,
    name: r.name,
    request: `${r.method} ${r.path}`,
    skipped: r.skipped,
    served: invoked,
    statuses: [...new Set(runs.map((x) => x.status))].join("/"),
    errorRate: runs.length ? failures / runs.length : null,
    error1102: exceeded,
    bytes: median(runs.map((x) => x.bytes)),
    coldMs: runs[0]?.totalMs ?? null,
    warmMs: median(runs.slice(1).map((x) => x.totalMs)),
    cpuMsMax: max(cpu),
    cpuMsMedian: median(cpu),
    subrequestsMax: max(sub),
    withinBudget:
      !exceeded &&
      (max(cpu) == null || max(cpu) <= CPU_BUDGET_MS) &&
      (max(sub) == null || max(sub) <= SUBREQUEST_BUDGET),
  };
});

const fmt = (v, suffix = "") => (v == null ? "–" : `${v}${suffix}`);
const lines = [
  `# Star Sailors Free-plan budget: ${base}`,
  "",
  `${new Date().toISOString()} · ${samples} samples per route · CPU source: ${useTail ? "wrangler tail" : "not collected (run with --tail)"}`,
  "",
  "| Flow | Route | Served by | Status | Error rate | 1102 | Size | Cold | Warm (median) | CPU max / median | Subrequests max | Within budget |",
  "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
  ...rows.map((r) =>
    r.skipped
      ? `| ${r.flow} | ${r.name} (\`${r.request}\`) | skipped: no session | | | | | | | | | |`
      : `| ${r.flow} | ${r.name} (\`${r.request}\`) | ${r.served} | ${r.statuses} | ${Math.round(r.errorRate * 100)}% | ${r.error1102 ? "YES" : "no"} | ${fmt(r.bytes, " B")} | ${fmt(r.coldMs, " ms")} | ${fmt(r.warmMs, " ms")} | ${fmt(r.cpuMsMax, " ms")} / ${fmt(r.cpuMsMedian, " ms")} | ${fmt(r.subrequestsMax)} | ${r.withinBudget ? "yes" : "NO"} |`,
  ),
  "",
  "### Background invocations (cron, queue)",
  "",
  ...(backgroundRows.length
    ? [
        "| Invocation | Count | Outcome | CPU max / median | Within budget |",
        "| --- | --- | --- | --- | --- |",
        ...backgroundRows.map((b) => `| ${b.invocation} | ${b.count} | ${b.outcomes} | ${fmt(b.cpuMsMax, " ms")} / ${fmt(b.cpuMsMedian, " ms")} | ${b.withinBudget ? "yes" : "NO"} |`),
      ]
    : [useTail ? "None observed during this run (the snapshot cron fires every 10 minutes; see Workers Logs)." : "Not collected (run with --tail)."]),
  "",
  `Budget: CPU ≤ ${CPU_BUDGET_MS} ms and ≤ ${SUBREQUEST_BUDGET} subrequests per Worker invocation (Workers Free). "Cold" is the first request of the run; run straight after a deploy for a true cold start.`,
];
const report = lines.join("\n");
console.log(report);
if (outFile) writeFileSync(String(outFile), JSON.stringify({ base, samples, tail: useTail, at: new Date().toISOString(), rows, backgroundRows, results }, null, 2));
if (process.env.GITHUB_STEP_SUMMARY) writeFileSync(process.env.GITHUB_STEP_SUMMARY, report + "\n", { flag: "a" });

const failed = rows.some((r) => !r.skipped && (!r.withinBudget || r.errorRate > 0)) || backgroundRows.some((b) => !b.withinBudget);
process.exit(failed ? 1 : 0);
