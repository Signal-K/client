# Garden: a small community-research habit (spec, draft)

Status: draft for Liam's review. Nothing in this document has been built.
Context: SSC-44 follow-up. Decided in conversation on 2026-11-04.

## Decisions (Liam)

1. This repo becomes **Garden**: a minimal citizen-science habit, not a game. Light gamification only.
2. One big citizen-science sandbox was too ambitious. Old gameplay moves into separate minigames until we learn which games people want. Landnam is how we find out.
3. Garden **stands alone** for an individual player. We have few players, so it cannot depend on anyone else being present.
4. The **community garden** is driven by totals from the **entire ecosystem** (Garden, Landnam, Atlas, Saily/Daily Transit, and later games), not Garden's own data alone.
5. **Existing users lose nothing.** Accounts stay shared with Landnam.

## History: why this is a return, not a pivot

- Jan to May 2023: web3 era. DAO governance, stake-to-earn gear shop, Lens and thirdweb logins, a 3D planet editor, a planet gallery, a shipyard, a journal, posts that tag planets, voting on anomalies (Supabase).
- Jul to Sep 2023: almost no commits.
- Oct to Dec 2023: rebuild around a feed, posts, anomalies and your own planets. `pages/garden.tsx` already exists (a gallery of the player's planets). A Capacitor Android build.
- 2024: classification projects (telescope, Planet Hunters, rover, clouds, Zoodex animals), mining, structures. Tags `Prerelease-*` to `prerelease-soodon`.
- 2025: Clerk and PocketBase cutover, Cloudflare Workers.
- 2026: garden hub (SSC-7), Free-plan API Worker (SSC-31/35), Space Week (SSC-41 to 44).

Through-line: your own planets plus a community classifying anomalies together. Governance and token layers were dropped; the classification layer kept growing.

(History was sampled, not read exhaustively.)

## What Garden keeps

- Garden scene, roster and first-session onboarding.
- One sky-classify task per day, with a daily stamp and a soft streak (a missed day costs nothing).
- Time-boxed sky event cards (they already expire by date).
- The community garden: plants and structures grow as ecosystem totals grow.

Reference model is Landnam's community research (`web/lib/research/stamps.ts`, `pocketbase/research.go`): one stamp per task per day, a shared monthly bar, weekly paths, event weeks, and a planned shared construction bar (SSL-758/759). Garden borrows the habit loop, not the server design.

## Community garden: ecosystem totals

Goal: the garden grows from the sum of contributions across every game in the ecosystem.

Rules:

- **Garden never needs another game to work.** With no ecosystem data it still shows the player's own progress.
- **One precomputed number per read.** Garden reads a single snapshot (the existing `readSnapshot` KV pattern used by `community-activity`). It never scans per-player rows per request. This follows the "keep the server light" rule.
- **Each game reports, nobody is queried live.** Each product contributes a monthly count (and optionally a per-discipline split) to a shared ecosystem ledger. A cron folds the ledger into one KV snapshot.
- **Scale the goal.** A fixed goal of 1000 stamps a month looks dead with few players. The target should scale with recent active players, or use a rolling baseline, so the garden visibly grows at our size.
- **No double counting.** One contribution counts once per player per day per kind, the same rule Landnam uses.

Open question (needs Liam): where the ledger lives. The shared backend (`../backend`, which holds `users`, `ecosystem_profiles`, `internal_apps`) is the natural home, but it is not in this repo and I have not seen whether it has a contributions table.

## Existing users: data safety

Facts from the repo:

- `pocketbase/collection-domains.json` freezes 22 legacy collections for compatibility. New ones must be `ss_`-prefixed.
- Identity is Clerk plus `ss_clerk_identity`, with shared `users` and `ecosystem_profiles` on the shared backend. Landnam signs in with its own `clerkId`.
- The 2026-07-25 prod outage was suspected to come from auto-generated `deleted_*` migrations that drop core collections. They were deleted from the repo.
- `archive-legacy-structures` is the precedent for removing safely: it hides rows (`sscHidden`), defaults to a dry run, never deletes.

Rules for the rename and the cuts:

1. **Rename is names only.** Repo, product name, UI copy. No collection renames. No Clerk app or issuer change. No Cloudflare Worker renames at first (secrets, bindings and KV are keyed to them).
2. **Additive only.** No dropped collections, fields or rows. Cutting a feature removes its UI and routes, never its data.
3. **Guard.** Add a check that fails if `pocketbase/pb_migrations` contains a delete or drop. Back up `/pb_data` before any schema import.
4. **Moved features keep reading the same collections** until their new home exists.
5. **Landnam compatibility check** before shipping: sign in to Garden and Landnam with one account and confirm the same profile resolves (`resolveGardenIdentity`).

## Data audit: API routes and the collections they touch

From `src/app/api/gameplay/*` (collection names found in each route's source; routes with none read through shared libs).

| Route | Collections |
|---|---|
| classifications, telescope, active-planet, locations, achievements | `anomalies`, `ss_classifications`, `linked_anomalies`, `profiles` |
| planet, planet-type, social, surveyor | `ss_classifications`, `ss_comments`, `votes`, `profiles` |
| research, profile | `profiles`, `referrals`, `ss_classifications` |
| hub, saturn-storm | `ss_hub_state` (via hub state), `ss_clerk_identity`, `inventory`, `linked_anomalies` |
| deploy | `anomalies`, `linked_anomalies`, `researched`, `routes`, `ss_classifications` |
| extraction, mineral-deposits | `mineral_deposits`, `user_mineral_inventory` |
| inventory | `inventory` |
| missions | `missions` |
| zoodex (and `/api/zoodex`) | `zoo`, `storage_objects`, `uploads` |
| solar | `solar_events`, `defensive_probes` |
| notifications, nps, uploads, storage | `push_subscriptions`, `notification_rejections`, `nps_surveys`, `uploads`, `storage_objects` |
| leaderboards, milestones, page-data | none directly |

Classification of data:

- **Core, stays live in Garden:** `profiles`, `ss_classifications`, `anomalies`, `linked_anomalies`, `researched`, `votes`, `ss_comments`, `ss_hub_state`, `ss_clerk_identity`, `referrals`, `push_subscriptions`.
- **UI cut, data kept untouched:** `inventory`, `mineral_deposits`, `user_mineral_inventory`, `routes`, `missions`, `zoo`, `storage_objects`, `uploads`, `solar_events`, `defensive_probes`.

Not yet verified:

- Production row counts per collection and the number of real users.
- Which of these collections Landnam or Atlas read from the shared backend.
- Whether Zoodex and the alchemy-crafting minigame survived into `main` (only the 2024 tags were checked).

## Feature map (proposal, not decided)

| Old feature | Destination |
|---|---|
| Mining and extraction, rover, base and structures, skill tree | Landnam |
| Planet Hunters-style classifying | Daily Transit (Saily) or Garden's one daily task |
| Zoodex animals, field capture | Atlas |
| Social posts and comments, leaderboards, referrals | Out of Garden; code stays in git history |

## Order of work

1. This audit and spec (this document).
2. Rename, plus the migration guard.
3. First slice: the garden bar and growth rule, reading one ecosystem snapshot.
4. Move one old feature at a time into its destination game, each with a data check.

## Linear (not yet done)

- Create an issue under "Star Sailors Shared World & Achievements" (P-SSC-17, currently empty) for the spec above.
- SSC-41/42/43 are merged in `65d257b8` but still "In Review".
