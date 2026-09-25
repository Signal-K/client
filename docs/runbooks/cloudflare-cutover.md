# Cloudflare-native hosting: cutover, rollback and smoke tests

Tickets: SSC-31 (architecture), SSC-37 (precomputed public data), SSC-39
(background jobs), SSC-38 (Free-plan budget and cutover gate).

## Architecture

Workers Free allows 10 ms of CPU per request. OpenNext ran the Next.js server
(SSR, Clerk middleware and route handlers) on every request, and the Worker
returned Error 1102. Production no longer runs a Next.js server at all:

| Request | Served by | Worker invoked? |
| --- | --- | --- |
| Every page (`/`, `/auth`, `/game`, …) and `/_next/*`, `/assets/*` | Workers Static Assets, from the static export in `out/` | No |
| Dynamic pages (`/posts/123`, `/structures/balloon/clouds/an-1/one`, …) | Worker returns the page's exported placeholder HTML (`/posts/__static__`); the page reads its params from the URL (`useRouteParams`) | Yes, no React render and no subrequests |
| `/api/v1/*` | SSC-35 JSON API (`workers/api`), mounted in the app Worker | Yes |
| `/api/*` | The existing `src/app/api/**/route.ts` handlers, bundled into the Worker with small shims for `next/server`, `next/cache` and `@clerk/nextjs/server` (`workers/app/src/shims`) | Yes |
| `/api/actions/[name]` | The former server actions (`src/server/actions`), now called with `fetch` from `src/app/actions/*` | Yes |
| `/ingest/*` | PostHog reverse proxy (formerly a `next.config` rewrite) | Yes, 1 subrequest |
| `/api/public/*`, `/api/gameplay/leaderboards/sunspots`, `/api/community-activity` | Precomputed snapshots read from Workers KV (SSC-37) | Yes, no PocketBase reads |
| Anything else | `404.html`, status 404 | Yes |
| Cron `*/10 * * * *` | Recomputes the public snapshots into KV | Yes (cron) |
| Cron `0 17 * * *` (production only) | Starts the daily discovery-reminder fan-out | Yes (cron) |
| Queue `starsailors-jobs` (+ `-dlq`) | Push notifications, server-side PostHog events, fan-out (SSC-39) | Yes (queue consumer) |

Identity comes from Clerk's session JWT, either the `__session` cookie or an
`Authorization: Bearer` header. The Worker verifies it locally against the
Clerk JWKS, which is cached per isolate, so there are no Clerk API calls per
request. A mutation authenticated by cookie must carry an allowed `Origin`, as
CSRF protection. Middleware redirects moved to the browser: `GameShell` sends
signed-out visitors to `/auth`, and `LandingSignedInRedirect` sends signed-in
visitors to `/game`.

`next dev` / `yarn build && yarn start` still run the full Next.js server with
middleware and route handlers, for local development and the Cypress suite.

### Build and deploy

- `yarn cf:build` → `scripts/cloudflare/build-static.mjs`: checks the generated
  route tables, type-checks, then runs `next build` with `NEXT_STATIC_EXPORT=1`
  while `src/app/api` and `src/middleware.ts` are set aside (always restored).
- `yarn cf:routes` regenerates `workers/app/src/generated/*` after adding or
  removing an API route or a dynamic page. CI fails when they are stale.
- `yarn cf:preview` builds and serves the result with `wrangler dev` on
  `http://localhost:8787`. Put the Worker secrets in `.dev.vars` (below).
- CI (`ci.yml` → "Cloudflare static build") runs the export and a Worker bundle
  dry-run on every PR. A new server action, `force-dynamic` page, or dynamic
  route without `generateStaticParams` fails there instead of at deploy time.
- Deploys: pushing to `main` runs `deploy-cloudflare.yml` (production), and
  pushing to `staging` runs `deploy-cloudflare-staging.yml`. Both call
  `cloudflare-app-worker.yml`. Nothing deploys to Vercel.

New dynamic pages must export
`generateStaticParams() { return placeholderParams(...) }` from
`@/src/lib/routing/staticParams` and read params with
`useRouteParams("/path/[param]")`, not `useParams()`, which returns the
placeholder in the export.

## Public snapshots (SSC-37)

Shared, non-user-specific data is computed on the cron trigger, never on a
request, and published to the `PUBLIC_DATA` KV namespace as one bundle
(`public-snapshots:v1`). Code: `src/server/snapshots/`.

| Snapshot | Contents | Read by |
| --- | --- | --- |
| `landing-stats` | Total classifications, last 24 h count, active sailors (24 h), active projects and per-project counts (7 d) | Landing page (`/api/public/snapshots/landing-stats`) |
| `sunspot-leaderboard` | Top 10 probe launchers and sunspot classifiers | `/leaderboards/sunspots` |
| `community-activity` | Latest 24 classifications of the last day (user ids stripped on read) | Garden launches, hub vehicles |
| `hub-top-profiles` | Top 5 profiles by classification points | Hub leaderboard (`/api/gameplay/page-data`; the caller's own rank is still read live) |

- **Versioning.** The KV key carries the bundle version. Each section also
  stores its own `schema`. Bump a section's `schema` in `store.ts` when its
  shape changes; older stored data then reads as `missing` until the next
  refresh.
- **Fresh / stale / missing.** Each section records `generatedAt`,
  `lastAttemptAt` and `lastError`. Data older than 30 minutes (three missed
  refreshes) is served but marked `stale`. Never-generated data is `missing`
  (the generic endpoint returns 503; community activity returns `[]`).
  Responses carry `x-snapshot-status` and `x-snapshot-generated-at`. The
  landing page and leaderboard show "updated N min ago" or an out-of-date
  notice.
- **Refresh failure.** A failing producer keeps its previous data and records
  the error. The other snapshots still update.
- **Health.** `GET /api/public/status` lists each snapshot's status, age and
  last error. `healthy: false` means at least one is not fresh.
- **Budget.** Each refresh is one KV write, so the 10-minute cron uses 144
  writes/day per environment (Free: 1,000/day per account, shared with job
  receipts). Reads are memoised per isolate for 30 s.
- **Refresh now** (for example straight after the first deploy):
  `curl -X POST -H "authorization: Bearer $INTERNAL_JOBS_TOKEN" https://starsailors.space/api/internal/snapshots/refresh`
- **Local dev.** Without Cloudflare (`next dev`, Cypress), snapshots are
  built in memory on first read.

## Background jobs (SSC-39)

Non-critical work leaves the request path through the `JOBS` queue. Code:
`src/server/jobs/`. The request returns once the queue has accepted the
message (for example `POST /api/notify-my-discoveries` → 202).

| Job | Queued by | Idempotency |
| --- | --- | --- |
| `analytics.capture` | `captureServerEvent()` (classification submitted) | PostHog dedupes on the job id (`uuid`) |
| `push.user` | `/api/notify-my-discoveries` (the signed-in user only), broadcasts, retries | KV receipt per job id; retries target only failed endpoints |
| `push.broadcast` | `/api/send-test-notification` (operator token) | Child ids derive from the run id |
| `reminders.discoveries` → `reminders.discovery-user` | Daily cron, or `/api/auto-notify-discoveries` (operator token) | Per-day ids (`reminder:<day>:<user>`) plus a receipt: one reminder per user per day |

- **Push delivery.** Web Push (VAPID + aes128gcm) runs on WebCrypto
  (`webpush.ts`), which is tested against the RFC 8291 vector.
  - A 404 or 410 deletes that subscription.
  - A 429, a 5xx or a network error re-queues only the failing endpoints with
    backoff (1, 2, 4, 8 min).
  - Other 4xx responses are logged and not retried.
  - Duplicate deliveries of a reminder share a `Topic`, so the push service
    collapses any that are undelivered.
- **Retries.** A retryable failure calls `message.retry()` with exponential
  backoff. On attempt 5, or on a permanent error (for example missing VAPID
  keys) or an invalid message, the job is **parked**: stored in KV at
  `jobs:dead:<id>` with the error, kept for 14 days, and logged as
  `[jobs] parked …`. The dead-letter queue catches anything that escapes
  (such as a crashed batch) and parks it the same way.
- **Recover.** Fix the cause, then:
  - `GET /api/internal/jobs` lists parked jobs.
  - `POST /api/internal/jobs` with `{"action":"replay"}` (optionally
    `"ids":[…]`) re-queues them under their original ids.

  Both need `Authorization: Bearer $INTERNAL_JOBS_TOKEN`. Receipts stop a job
  whose push already went out from sending again.
- **Fallback.** If the queue is unbound or refuses a send (for example the
  Free plan's daily limit), jobs run after the response via `ctx.waitUntil`.
  A failure there is parked too.
- **Budget.**
  - A batch holds at most 4 jobs, and each user gets at most 5 devices per
    job, which keeps a batch under 50 subrequests.
  - Queues Free allows 10,000 operations/day, about 3 per message.
  - Cron triggers: 2 in production and 1 in staging, out of 5 per account.
- **Security.** `/api/notify-my-discoveries` used to push to any `userId` in
  the body without authentication. `/api/send-test-notification` and
  `/api/auto-notify-discoveries` were open to anyone. They now require a
  session or the operator token.

## Configuration

| Name | Kind | Where | Notes |
| --- | --- | --- | --- |
| `POCKETBASE_URL`, `POCKETBASE_ADMIN_EMAIL`, `POCKETBASE_ADMIN_PASSWORD` | Worker secret | "Sync Cloudflare Worker secrets" workflow | Unchanged |
| `CLERK_SECRET_KEY` | Worker secret | same | Only routes that call the Clerk Backend API use it (guest conversion, playtests, hub bootstrap email fallback) |
| `CLERK_WEBHOOK_SIGNING_SECRET` | Worker secret | same | `/api/webhooks/clerk` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | build env + Worker var | GitHub secret; the deploy passes it with `--var` | The Worker derives the Clerk issuer/JWKS URL from it |
| `CLERK_ISSUER`, `CLERK_JWKS_URL` | Worker var (optional) | `--var` | Override the derived issuer |
| `CLERK_AUTHORIZED_PARTIES` | Worker var (optional) | `--var` | Comma-separated origins. Defaults to the request's own origin, which is right for `starsailors.space`, `www.starsailors.space` and `staging.starsailors.space` |
| `VAPID_PUBLIC_KEY` → `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | build env + Worker var | GitHub secret `VAPID_PUBLIC_KEY`; the deploy passes it with `--var` | Browser subscription prompt and VAPID signing |
| `VAPID_PRIVATE_KEY` | Worker secret (optional) | "Sync Cloudflare Worker secrets" | Without it, push jobs are parked with "VAPID … not configured" (replay after adding it) |
| `INTERNAL_JOBS_TOKEN` | Worker secret (optional) | same | Enables `/api/internal/*`, `/api/send-test-notification` and `/api/auto-notify-discoveries`; they answer 503 without it |
| `PUBLIC_DATA` (KV), `JOBS` (queue) | Bindings | `wrangler.jsonc`; created by `scripts/cloudflare/ensure-resources.mjs` in the deploy workflow | Namespace `starsailors-public-data[-staging]`, queues `starsailors-jobs[-staging]` and `-dlq` |

The deploy workflow's "Confirm Worker secrets already exist" step fails fast if
a secret is missing. Never `wrangler secret put` on every deploy: each put
publishes a Worker version (the 2026-09-18 1102 storm).

`.dev.vars` for `yarn cf:preview`:

```
POCKETBASE_URL=http://127.0.0.1:8090
POCKETBASE_ADMIN_EMAIL=...
POCKETBASE_ADMIN_PASSWORD=...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
```

## Cutover

Preconditions:

1. The Cloudflare API token in `CLOUDFLARE_API_TOKEN` has **Account → Workers
   Scripts: Edit, Workers KV Storage: Edit, Queues: Edit** and **Zone
   (starsailors.space) → Workers Routes: Edit, DNS: Edit**. The token used on 2026-09-21 returned 403 for Workers domains and
   zones, so it could not attach `staging.starsailors.space`.
2. Clerk production instance → Domains: `starsailors.space` is the application
   domain, and `staging.starsailors.space` is allowed as a satellite/subdomain
   origin. The Frontend API proxy `clerk.starsailors.space` only accepts
   `*.starsailors.space` origins (see the `wrangler.jsonc` staging note).
3. Clerk → Webhooks still points at `https://starsailors.space/api/webhooks/clerk`.
4. Any leftover Vercel project/alias for `staging.starsailors.space` is
   removed, and the DNS record is not a CNAME to Vercel. Custom domains need
   the hostname to have no conflicting record; `wrangler deploy` creates it.

Steps:

1. Merge to `staging`, or run "Deploy staging to Cloudflare Workers" manually.
   Confirm the run is green. On its first run, "Ensure KV namespace and queues"
   creates `starsailors-public-data-staging` and the staging queues. Once the
   deploy is green, check `/api/public/status`: the snapshots become fresh
   within 10 minutes, or immediately after a
   `POST /api/internal/snapshots/refresh`.
2. Smoke-test staging (next section), including sign-in with a test account.
3. Run **Measure Cloudflare Free-plan budget** with `target: staging` and the
   test account's `session_id`. It must pass; attach the job summary to SSC-38.
4. Merge to `main`, or run "Deploy to Cloudflare Workers" manually. Note the
   previous version id first: `npx wrangler deployments list`.
5. Smoke-test production and run the budget workflow with `target: production`.
6. Delete the standalone SSC-35 Worker, now served by the app Worker, if it
   was ever deployed: `npx wrangler delete --name starsailors-api` and
   `--name starsailors-api-staging`. Its `/api/v1/*` routes would otherwise
   keep shadowing the app Worker.

## Smoke test

Run against `https://staging.starsailors.space` or `https://starsailors.space`.

```sh
node scripts/cloudflare/measure-budget.mjs --base https://staging.starsailors.space --samples 3
```

The script checks the anonymous rows and, with `BUDGET_SESSION_TOKEN` or
`CLERK_SECRET_KEY` + `BUDGET_SESSION_ID`, the authenticated ones. Then, in a
browser:

- `/` renders the landing page; signed in, it moves to `/game?from=landing`.
- `/auth` → sign in → `/game` loads the garden hub (`/api/gameplay/hub/bootstrap` 200).
- Reload `/game`: no Error 1102, and the hub state persists.
- Open a post (`/posts/<id>`) and a structure mission page directly by URL,
  then navigate between them client-side.
- Submit one classification or comment, which exercises `/api/actions/*`.
- PostHog: the network tab shows `/ingest/*` 200s.
- `/api/public/status` reports `healthy: true`. The landing stats show
  "Updated N min ago".
- Deploy a telescope: the confirmation appears immediately. The Worker logs
  then show `{"invocation":"queue starsailors-jobs",…,"done":1}`, and
  `GET /api/internal/jobs` shows no parked jobs.
- `/api/webhooks/clerk`: Clerk dashboard → Webhooks → send a test event → 200.

## Rollback

Worker versions include their static assets, so a rollback restores the
previous pages and API together:

```sh
npx wrangler deployments list            # find the last good version
npx wrangler rollback <version-id>       # production
npx wrangler rollback <version-id> --env staging
```

To roll back the code instead, revert the SSC-31 commit on `main`. The deploy
workflow then rebuilds the previous version. Before SSC-31 that was OpenNext,
which hits Error 1102 on Workers Free, so a code revert is only useful on
Workers Paid, with `limits.cpu_ms` restored in `wrangler.jsonc`.

Secrets and DNS are not touched by either path.

## Budget evidence (SSC-38)

`x-ssc-subrequests` on every Worker response is the number of outbound
fetches that invocation made. CPU time and outcome come from `wrangler tail`
in the budget workflow.

Local run, 2026-09-25: `wrangler dev` (workerd) with a stub PocketBase and a
locally signed Clerk session JWT, 3 samples per route. workerd does not report
CPU time; that column comes from the deployed workflow run.

| Flow | Route | Status | Size | Subrequests max |
| --- | --- | --- | --- | --- |
| anonymous | `GET /` | 200 | 47.5 kB | static asset |
| anonymous | `GET /auth` | 200 | 13.8 kB | static asset |
| anonymous | `GET /game` | 200 | 13.1 kB | static asset |
| anonymous | `GET /posts/1` | 200 | 18.0 kB | 0 |
| anonymous | `GET /api/auth/session` | 401 | 23 B | 0 |
| anonymous | `GET /budget-missing-page` | 404 | 12.1 kB | 0 |
| authenticated read | `GET /api/auth/session` | 200 | 22 B | 0 |
| authenticated read | `GET /api/v1/me` | 200 | 39 B | 1 (3 on a cold isolate: JWKS + PocketBase auth + read) |
| authenticated read | `GET /api/gameplay/hub/bootstrap` | 200 | 505 B | 6 |
| authenticated read | `GET /api/gameplay/profile/me` | 200 | 89 B | 1 |
| mutation | `POST /api/gameplay/profile/ensure` | 200 | 16 B | 2 |
| mutation | `POST /api/actions/getCurrentProfileAction` | 200 | 34 B | 3 |
| refresh | `GET /game` + `GET /api/gameplay/hub/bootstrap` | 200 | 13.1 kB + 505 B | 6 |

Background invocations, from the same local setup (2026-09-25, `wrangler dev
--test-scheduled` with local KV and Queues, and a mock push service that
decrypts each payload and verifies its VAPID signature):

| Invocation | Result | Subrequests |
| --- | --- | --- |
| Cron `*/10 * * * *` | 4 snapshots published in one KV write | 9 |
| `GET /api/public/snapshots/landing-stats` (after the cron) | 200 `fresh` (503 `missing` before it) | 0 |
| `POST /api/notify-my-discoveries` | 202 in 12 ms | 0 warm (1 when it had to fetch the JWKS) |
| Queue: `push.user`, 3 devices (201 / 410 / 503) | 1 sent, 1 subscription deleted, 1 retried after 60 s | 6 |
| Cron `0 17 * * *` → `reminders.discoveries` → `reminders.discovery-user` | Reminder named the one unclassified discovery | 0 → 1 → 6 |

Error rate 0% on every route. The Worker bundle is 1.76 MB (326 kB gzip),
within the 3 MB Free limit. After SSC-37/39 it is 1.38 MB (256 kB gzip), because
`web-push` is no longer bundled. Production and staging CPU / cold-start figures:
_pending the first "Measure Cloudflare Free-plan budget" run._
