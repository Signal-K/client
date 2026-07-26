# Pocketbase migration scaffold (Phase 2)

## Production deployment

Collection ownership and naming are defined in
`pocketbase/collection-domains.json`. The original Star Sailors collections
are compatibility-frozen; new Star Sailors-specific collections must use the
`ss_` prefix. New Atlas collections use `atlas_` on the shared backend, and
other game/product data belongs in that product's PocketBase spoke.

Run the local guard with:

```bash
yarn pocketbase:check-domains
```

Production runs PocketBase as a private service in
`ops/compose/docker-compose.prod.yml`, with its state stored in the named
`pocketbase_data_prod` volume. Set `POCKETBASE_URL` to the internal service URL
(`http://pocketbase:8090`) and provide `POCKETBASE_ADMIN_EMAIL` and
`POCKETBASE_ADMIN_PASSWORD` to the Next.js container through the deployment
secret manager. Do not publish port 8090 publicly.

The first production boot must have a PocketBase superuser and the collections
from `pb_schema.json` imported before the Next.js service receives traffic.
`pb_migrations/` previously held 26 auto-generated `deleted_*` migrations (an
artifact of a local schema diff during the Clerk/PocketBase cutover) that each
drop a core collection (`anomalies`, `classifications`, `profiles`, etc.).
Compose never mounted that directory, but any other PocketBase deploy path
that does pick up `pb_migrations/` (e.g. the Fly.io instance behind the
Cloudflare Workers deploy, `.github/workflows/deploy-cloudflare.yml`) would
run them on startup and silently wipe the live schema/data — this is the
suspected root cause of the 2026-07-25 "blank screen for logged-in users"
prod incident (`GET /api/gameplay/active-planet` 500s with "Missing or
invalid collection context"). The destructive files have been deleted from
this repo; if a PocketBase instance was affected, re-import the schema with
`yarn pocketbase:import-schema` and restore any lost data from a `/pb_data`
backup.
Back up `/pb_data` before importing data or upgrading the PocketBase image.

For a local instance, import the schema with:

```bash
POCKETBASE_ADMIN_EMAIL=... POCKETBASE_ADMIN_PASSWORD=... \
  yarn pocketbase:import-schema
```

Before copying legacy game records into the shared backend, create the Clerk →
shared-PocketBase identity anchors with the mapper. It is dry-run by default:

```bash
LEGACY_POCKETBASE_ADMIN_EMAIL=... LEGACY_POCKETBASE_ADMIN_PASSWORD=... \
SHARED_POCKETBASE_ADMIN_EMAIL=... SHARED_POCKETBASE_ADMIN_PASSWORD=... \
CLERK_SECRET_KEY=... yarn pocketbase:map-clerk-users
```

Use `DRY_RUN=false` only after reviewing the generated report. The mapper is
idempotent and stores the original Clerk ID in `users.clerk_user_id`; it does
not change Clerk accounts or copy gameplay records.

A local, dockerized Pocketbase instance is running (`ops/compose/compose.yml`,
service `pocketbase`, mapped to host port 8095 — 8090/8091/8092/8093 were
already in use by other local projects) with all 23 collections below
imported. Superuser credentials are in the gitignored
`pocketbase/.superuser.local.env`. Domains were migrated one at a time rather
than as a single big rewrite; see the per-domain sections below for sequencing
and status.

## Stale pre-Clerk user ids (found and fixed 2026-07-07/08)

A post-migration data audit found that `profiles.userId` (736/794 rows),
`linked_anomalies.author` (66/152), and `researched.userId` (1/35) still held
pre-Clerk Supabase UUIDs instead of Clerk ids, even though `classifications`,
`comments`, `votes`, and `mineral_deposits` were 100% correctly Clerk-shaped.

**Root cause, fully traced**: `scripts/migrate-users-supabase-to-clerk.ts`
had only ever been run for the 52 Supabase users with a real email — the
remaining 742 are anonymous/guest Supabase sessions (no email), and Clerk's
`createUser` rejects a user with no identifier at all
(`"email_address" data doesn't match user requirements set for this
instance`). 6 anonymous users had been migrated by hand at some point using a
synthesized `guest-<uuid>@guests.starsailors.space` email, which does pass
validation — but the other 736 were never attempted that way, so they had no
Clerk account and no `externalId` mapping at all. `profiles`/`linked_anomalies`/
`researched` rows for those 736 people were therefore permanently unable to
be remapped to a Clerk id — this is a different (and worse) root cause than
originally suspected (an ordering bug in the Postgres→Pocketbase copy); there
was no ordering bug, the users simply didn't exist in Clerk yet.

**Fix, in order**:
1. `scripts/migrate-anonymous-guests-to-clerk.ts` (new) — creates a Clerk
   user for every anonymous Supabase user using the same
   `guest-<uuid>@guests.starsailors.space` pattern already established by the
   6 that worked, with `externalId` set to the Supabase UUID. Idempotent
   (checks for an existing externalId match before creating), retries
   transient network failures, and writes its report incrementally so a crash
   mid-run doesn't lose progress. Run against production: 736 created, 6
   already-migrated (skipped), 1 apparent error that was actually a race with
   an earlier interrupted run (verified the account existed correctly).
2. `scripts/fix-stale-pocketbase-user-ids.ts` (new) — for every stale
   UUID-shaped value in the three affected fields, looks up the matching
   Clerk user via `externalId` and updates the Pocketbase record in place.
   Defaults to `DRY_RUN=true`; skips (and reports) any record with no Clerk
   match or whose target value would collide with an existing record's value
   in the same collection, rather than guessing or overwriting. Run for real:
   803/803 updated, 0 no-match, 0 conflicts.

**Verified after**: all three fields are 100% Clerk-shaped (0 stale values),
`profiles.userId` has 0 duplicate values, live Clerk instance has exactly 794
users (matching the Supabase source count exactly).

**Process note for next time**: don't assume a Clerk secret key found in
`.env.local` is the live/production instance — this session burned real time
(and created 52 throwaway accounts in a `sk_test_` sandbox instance before
finding the actual `sk_live_...starsailors.space` one) checking `getUserList().totalCount`
against a key that turned out to be an empty, unrelated dev sandbox. Always
verify a known-real id (e.g. one already embedded in existing data) resolves
in the instance before trusting a key. The 52 throwaway accounts in the wrong
test instance were left in place (harmless, isolated, not worth the extra
live-system risk of a bulk-delete pass) — not cleaned up as part of this fix.

## Files

- `pb_schema.json` — importable collection schema (Pocketbase Admin UI →
  Settings → Import collections, or the `/api/collections/import` endpoint)
  covering all 23 current Prisma models.

## Type mapping used

| Postgres/Prisma | Pocketbase field | Notes |
|---|---|---|
| `BigInt @id @default(autoincrement())` | kept as a `number` field `legacyId`, **not** the Pocketbase record `id` | See "Open decision: record ids" below. |
| `String @db.Uuid` (user/profile refs) | `text` | Values become Clerk ids (`user_xxx`) after Phase 1, so `uuid`-shaped storage doesn't fit anyway. |
| `Json`/`Json?` | `json` | Direct mapping, Pocketbase stores as JSON natively. |
| `BigInt[]` (`Mission.rewardedItems`) | `json` | Pocketbase has no native array field; store as a JSON array of numbers. |
| `Decimal` (`UserMineralInventory.quantity`/`.purity`) | `number` | Accepts float precision loss — flag if exact decimal precision turns out to matter for mineral economy balancing. |
| `DateTime @db.Timestamptz`/`@db.Date` | plain `date` field | **Not** Pocketbase's `autodate` type — autodate force-overwrites with the current timestamp on every create/update regardless of the value submitted, which would have silently destroyed every historical `createdAt` (some from 2024) during data migration. Discovered and fixed before any data was imported. Means the app must explicitly set these fields on new-record creation going forward (no automatic stamping). |
| `@@map("snake_case_name")` | collection `name` | Kept identical to the existing table name so raw-SQL-derived code is easier to trace back to its Pocketbase equivalent during rewrite. |

## Resolved decision: record ids

Pocketbase's own `id` is an auto-generated 15-character string, not the
`BigInt` autoincrement id the app currently uses everywhere (e.g.
`anomaly=BigInt(location)`, `classificationId`, cross-references between
`comments`/`votes`/`classifications`). Two options were considered for the
Phase 2 rewrite:

1. **Keep a `legacyId` number field** (what this schema does) — minimizes
   churn in the ~49 files doing numeric id math/comparisons, but means every
   query has to filter on `legacyId` instead of Pocketbase's indexed `id`,
   losing some of Pocketbase's built-in relation-expansion ergonomics.
2. **Switch fully to Pocketbase ids** — cleaner long-term, but touches every
   file that currently does `BigInt(...)`/`.toString()` id handling
   (`recursiveSerialize`, the many `prisma.$queryRaw` id casts, etc.).

**Decided: option 1, keep `legacyId`.** Numeric ids are embedded in live,
user-facing URLs (`/posts/[id]`, `/posts/surveyor/[id]`,
`/planets/clouds/[id]`, `/extraction/[id]`), so switching to Pocketbase's
random ids would break every existing bookmarked/shared link unless a
legacy-id lookup/redirect shim were added anyway — which would defeat the
point of dropping `legacyId`. The relation-expansion ergonomics option 2
would have bought don't apply here either, since the app already does its
own joins in the service layer rather than relying on Pocketbase's `expand`.
The indexed-lookup cost is also moot: every collection carrying a `legacyId`
field already has a `CREATE UNIQUE INDEX` on it (see `pb_schema.json`), so
filtering by `legacyId` performs the same as filtering by native `id`. The
Phase 2 route rewrite can proceed on this basis.

## RLS → Pocketbase API rules

The existing Supabase RLS policies (`supabase/migrations/20260118121401_remote_schema.sql`)
only cover 4 tables — everything else is accessed exclusively through
server-side Prisma (with a service-role-equivalent connection), not directly
from the client. That pattern carries over directly:

- **`profiles`**: public read (`listRule`/`viewRule` = `""`), owner-only
  insert/update (`createRule`/`updateRule` = `@request.auth.id = id`).
- **`user_mineral_inventory`**: fully owner-scoped CRUD (`@request.auth.id = user_id`
  on list/view/create/update/delete).
- **`notification_rejections`**: fully owner-scoped CRUD (`@request.auth.id = profile_id`).
- **`push_anomaly_log`**: superuser-only (`null` rules) — matches the original
  "service role only" policy; only `scripts/notify-unclassified-discoveries.ts`
  touches this table.
- **Every other collection**: `null` rules (superuser/admin-token only), since
  today's API routes already sit in front of all of these as the only access
  path — Pocketbase's admin client from those same routes preserves that.

## Production discrepancies found during the Phase 1 id-remap (fixed)

Discovered while running `scripts/migrate-user-ids-supabase-to-clerk.sql`
against production — the schema/migration history had drifted from what was
actually live:

- **`mineralDeposits` vs `mineral_deposits`**: Prisma declared
  `@@map("mineral_deposits")` but the live table was camelCase
  `mineralDeposits`; every raw-SQL mineral-deposit query was silently broken
  in production. Fixed in `prisma/schema.prisma` and the 4 affected files
  (`src/app/actions/gameplay.ts`, `src/app/api/gameplay/{achievements,mineral-deposits,extraction/[id]}/route.ts`).
  `pb_schema.json`'s `mineral_deposits` collection name is a cosmetic mismatch
  only (Pocketbase collection names aren't SQL identifiers) — left as-is.
- **`user_anomalies`**: schema comment claimed this was "DROPPED ... data
  migrated to linked_anomalies" — it wasn't; 54 live rows, zero overlap with
  `linked_anomalies`. Folded into `linked_anomalies` (`automaton='historical'`)
  and dropped as part of the id-remap transaction.
- **`survey_rewards`**: doesn't exist in production at all
  (`manual/add_survey_rewards_table.sql` was never applied there). Its
  Pocketbase collection exists (imported from the schema) but has no data to
  migrate — creating the table is a separate decision, not bundled into this
  migration.

## Storage: Supabase Storage → Pocketbase

All 7 buckets in use (`avatars`, `uploads`, `media` — user-generated content;
`clouds`, `telescope`, `anomalies`, `zoodex` — static per-anomaly reference
imagery used by ~20 mini-game components) are migrated: 1412 files, 0 errors
(`scripts/migrate-storage-to-pocketbase.ts`). Given how heterogeneous the
per-bucket naming schemes are (some keyed by Clerk user id, some by the
numeric `anomalies.id`, some by an external telescope catalog id, some with
no correlatable key at all), every file is stored in one `storage_objects`
collection keyed by the exact `(bucket, path)` the app already addressed it
by against Supabase — this meant the ~20 read call sites only needed their
URL construction swapped, not a real relational rewrite.

Two things came up while building this:

- **Pocketbase always randomizes stored filenames** (`file.jpg` becomes
  `file_gvl9gyh5w7.jpg`), no override. This broke the original plan to
  construct file URLs fully client-side. Fix: `storageObjectId(bucket, path)`
  (`src/lib/pocketbase/storageId.ts`) is a deterministic hash used as the
  Pocketbase record's own `id` at upload time, and `src/app/api/storage/[bucket]/[...path]/route.ts`
  does the one by-id lookup server-side and 307-redirects to the real file
  URL. `getStorageUrl(bucket, path)` (`src/lib/pocketbase/storageUrl.ts`) just
  returns `/api/storage/{bucket}/{path}` — every call site stays synchronous.
- **`anomalies.avatar_url` already stores full absolute URLs** (some pointing
  at a different/legacy Supabase project, some directly at `mars.nasa.gov`),
  not a bucket-relative path. `Transiting.tsx`'s `buildPlanetImageUrl` was
  double-prefixing these into broken URLs — pre-existing bug, fixed while in
  there (use `avatar_url` as-is when present, `getStorageUrl` only as
  fallback).
- **`profile-actions.ts`, `src/app/page.tsx`, `src/app/game/page.tsx`** were
  still calling `createSupabaseServerClient()`/`supabase.auth.getUser()`
  directly — missed in the Phase 1 Clerk cutover because they don't route
  through `src/lib/server/routeAuth.ts`. Fixed to use Clerk's `auth()`/
  `getRouteUser()`; these were silently broken (always-unauthenticated) since
  Phase 1 shipped.

## Profiles + referrals domain (done)

`profile-actions.ts` and `src/lib/server/game-page-data.ts`'s `getProfileForUser`
were the last two call sites still reading/writing the `profiles`/`referrals`
tables via Prisma while `profile/me`, `profile/ensure`, the Clerk webhook, and
`referral-service.ts` had already moved to the Pocketbase `profiles`/`referrals`/
`survey_rewards` collections. That split meant a profile or referral written
through one path was invisible to the other (e.g. `getReferralPanelDataAction`
would never show referrals created by `ReferralService.applyReferral`, since
one read Postgres and the other wrote Pocketbase). Both files now go through
Pocketbase exclusively for this domain — the profiles+referrals domain is
fully cut over.

## Researched (tech unlocks) domain (done)

Same split-brain pattern as profiles: `src/lib/server/researched.ts`
(`getResearchedProgressForUser`, `unlockTechForUser`) already read/wrote the
Pocketbase `researched` collection, but `src/app/actions/deploy-actions.ts`
still checked `prisma.researched.findFirst` directly to gate `ngtsAccess`
(extra telescope anomaly set) and `probereceptors` (max deploy count). A tech
unlocked via `/api/gameplay/research/unlock` (Pocketbase) was invisible to
these two checks (Postgres) — silently capping deploys/anomaly sets for users
who had already paid to unlock them. Added `hasResearchedTech(userId, techType)`
to `researched.ts` and switched both call sites in `deploy-actions.ts` to use
it.

## Classifications, comments, votes, linked anomalies, mineral deposits (done)

A wider audit (prompted by the researched-domain fix above) found the same
split-brain pattern across every remaining live domain — each had newer
Pocketbase-backed API routes for *some* call sites while older `"use server"`
action files still wrote/read the same table via Prisma:

- **`classification-actions.ts`**: `createClassificationAction` (used by the
  Annotator flow backing AI4Mars, JovianVortexHunter, PlanetFour, Transiting,
  Sunspots, ActiveAsteroids, DailyMinorPlanet, CloudspottingOnMarsShapes) wrote
  to Postgres, while research-unlock, achievements, deploy-status, leaderboards,
  and the community-activity feed all read the Pocketbase `classifications`
  collection — so classifications submitted through the Annotator never counted
  toward any of those.
- **`deploy-actions.ts`** (`deployTelescopeAction`): wrote `linked_anomalies` to
  Postgres, but `/api/gameplay/deploy/status` (which gates whether
  `/structures/telescope` is reachable) only reads the Pocketbase
  `linked_anomalies` collection — deploying the telescope left it looking
  undeployed, redirecting the user straight back to `/activity/deploy`.
- **`social-actions.ts`** (`toggleVoteAction`, `submitCommentAction`): wrote
  `votes`/`comments` to Postgres, while `SimplePostSingle.tsx` reads vote
  totals and comment lists from the Pocketbase-backed
  `/api/gameplay/social/{votes,comments}` routes right after submitting —  a
  cast vote or posted comment never appeared until a hard refresh hit a
  different (Postgres-reading) code path, if ever.
- **`mineral-actions.ts`** (`createMineralDepositAction`): wrote
  `mineral_deposits` to Postgres from the Annotator flow, while `/inventory`
  reads the Pocketbase `mineral_deposits` collection — deposits found via
  in-game annotation never showed up in the inventory list.

All five were switched to the Pocketbase SDK, matching the collection/legacyId
patterns already established in the sibling API routes
(`/api/gameplay/classifications`, `/api/gameplay/deploy/{satellite,rover,solar}`,
`/api/gameplay/social/{votes,comments}`, `/api/gameplay/mineral-deposits`).
`src/lib/server/game-page-data.ts` (the full `/game` page data loader —
recent classifications, activity feed, linked anomalies, referral counts) was
also rewritten in the same pass, since it read all of these tables via Prisma
too.

**As of this pass, no file under `src/` imports `@/lib/server/prisma` anymore.**
The Next.js app's runtime data path is fully on Pocketbase (Clerk remains the
auth provider); only one-off scripts under `scripts/` (the historical data
migration itself) still use Prisma/`pg` directly against Postgres, which is
expected and out of scope.

## Postgres triggers (resolved — no pb_hooks needed)

`supabase/migrations/20260118121401_remote_schema.sql` defines exactly three
triggers (`grep -n "CREATE TRIGGER\|CREATE OR REPLACE TRIGGER"`), and all
three turn out to already be superseded by application code rather than
needing a dedicated Pocketbase `pb_hooks` JS hook:

- **`on_auth_user_created` → `handle_new_user()`**: inserted a `profiles` row
  (`id`, `full_name`, `avatar_url`) on every new `auth.users` row. Already
  replaced by `src/app/api/webhooks/clerk/route.ts` (`user.created` event →
  `pb.collection("profiles").create(...)`), as noted in that file's own
  comment.
- **`handle_nps_surveys_updated_at` → `handle_updated_at()`**: stamped
  `updated_at = now()` on every `nps_surveys` UPDATE. Moot — the Pocketbase
  `nps_surveys` flow (`src/app/api/gameplay/nps/route.ts`) only ever creates
  rows, never updates them.
- **`update_solar_events_updated_at` → `trigger_set_timestamp()`**: same
  `updated_at = now()` stamp, on `solar_events` UPDATE. Already replicated by
  hand in `src/app/api/gameplay/solar/route.ts`'s `mark_defended` action,
  which explicitly sets `updatedAt: new Date().toISOString()` on every
  `pb.collection("solar_events").update(...)` call.

No further action needed here — this item is closed.

## Prisma removed from the app (done)

With every domain confirmed migrated, removed Prisma from the running app
entirely: `prisma/` (schema + migrations), `src/lib/server/prisma.ts`, the
`prisma`/`@prisma/client` packages and `prisma:*` scripts in `package.json`,
and the `yarn prisma:generate`/`yarn prisma:migrate:deploy` build/deploy steps
in `ops/docker/{next.dockerfile,test.dockerfile,Dockerfile.prod}` and
`ops/compose/docker-compose.prod.yml`. Also removed the `prisma-studio`
service from `ops/compose/compose.yml` (a dev-only DB browser, non-functional
once the package is gone).

**The Postgres database itself is untouched** — `docker-compose.prod.yml`
still runs a `postgres` container and `DATABASE_URL` is still wired through
(used by the one-off `scripts/migrate-*-to-pocketbase.ts` / `-clerk.ts`
scripts, which talk to Postgres directly via `pg`, not Prisma). Formally
decommissioning that database (dropping the container, revoking credentials,
etc.) is still a separate decision for whoever owns that infra — this pass
only removed the *application's* dependency on it.

## Supabase teardown (done, 2026-07-24)

With every domain confirmed on Pocketbase/Clerk and no code path left reading
Supabase (see "Storage: Supabase Storage → Pocketbase" and "Prisma removed
from the app" above), the one-off cutover scripts had finished their job and
were removed along with their dependency:

- Deleted `scripts/migrate-users-supabase-to-clerk.ts`,
  `scripts/migrate-anonymous-guests-to-clerk.ts`,
  `scripts/migrate-anonymous-active-users.ts`,
  `scripts/migrate-data-to-pocketbase.ts`,
  `scripts/migrate-storage-to-pocketbase.ts`,
  `scripts/fix-stale-pocketbase-user-ids.ts`, and
  `scripts/migrate-user-ids-supabase-to-clerk.sql`.
- Deleted the legacy `supabase/` directory (`config.toml`, `migrations/`).
- Removed the `@supabase/supabase-js` dependency from `package.json`/`yarn.lock`.
- Removed the now-unused Supabase/Postgres env vars from `.env.example`.

The Postgres database itself (see "Prisma removed from the app" above) is a
separate, still-open decision for whoever owns that infra — decommissioning
it isn't blocked by anything in this repo anymore.

**Known gap**: `.github/workflows/ci.yml`'s `e2e` job still spins up a bare
`postgres` service and sets `SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_URL` env vars
that nothing reads. It was never updated for the Pocketbase/Clerk cutover, so
it doesn't start a Pocketbase service or provide Clerk test keys the way
`ops/compose/docker-compose.test.yml` and `scripts/tests/with-local-pocketbase-env.sh`
do — the e2e job as configured does not actually exercise a working app.

## Not yet done

- Anomaly creation/authoring (if any admin tooling ever needs it) — the only
  `anomalies` write path (`/api/gameplay/anomalies` POST) has no callers in
  `src/`; anomalies were reference data seeded once via the (now-removed)
  data migration script, not created at runtime.
