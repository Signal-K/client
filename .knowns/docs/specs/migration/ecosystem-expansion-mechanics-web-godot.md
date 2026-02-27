---
title: "2.2 Ecosystem Expansion Mechanics (Web + Godot)"
---

# 2.2 Ecosystem Expansion Mechanics (Web + Godot)

Date: 2026-02-26
Scope: Star Sailors web client + external Godot minigames

## Goals

1. Preserve one identity and one progression economy across web and Godot surfaces.
2. Make minigames feel like meaningful missions, not detached demos.
3. Improve retention by chaining short, distinct loops with persistent rewards.

## Shared Progression Contract

## Identity

- Canonical user id: Supabase `auth.users.id` (uuid)
- Event identity trait: `supabase_uuid`
- Required per-session context:
  - `app_surface`: `web` | `godot_experiment1` | `godot_mining` | etc.
  - `app_version`
  - `mission_id` (nullable)

## Reward Ledger

- All cross-surface rewards are written server-side through API routes.
- Idempotency key format:
  - `reward_key = {user_id}:{surface}:{run_id}:{reward_type}`
- Reward row contract (proposed):
  - `id` uuid
  - `user_id` uuid
  - `surface` text
  - `run_id` text
  - `reward_type` text
  - `reward_value` int
  - `granted_at` timestamptz
  - unique index on `reward_key`

## Cooldowns and Abuse Controls

- Daily mission claims: one claim per mission template per UTC day.
- Share/referral rewards: one reward per referree code application.
- High-value minigame payout:
  - capped by session duration floor + objective completion proof.

## Loop 1: Prospecting Expedition Chain

## Player Arc

1. Web: choose a planet sector and expedition loadout.
2. Godot mining minigame: execute timed extraction run.
3. Web return: receive ore quality, anomaly clues, and narrative updates.

## Integration Points

- Web pre-run API: create `expedition_run` and issue signed run token.
- Godot completion API: submit run metrics + token.
- Web post-run:
  - inventory update
  - mission log update
  - optional unlock in research tree

## Core Rewards

- `ore_units`
- `stardust_bonus`
- `expedition_reputation`

## Loop 2: Citizen Science Guild Contracts

## Player Arc

1. Web: join weekly guild contract (planet-hunting, cloud-tracking, solar).
2. Complete tasks on any surface.
3. Guild meter unlocks collective tier rewards.

## Integration Points

- Weekly contract entity in web backend.
- Contribution writes from both web actions and Godot runs.
- Live progress in game dashboard (mission control block).

## Core Rewards

- Shared cosmetic unlocks
- Contract stardust multipliers
- Sector world-state events (temporary modifiers)

## Loop 3: Dynamic Sector Incidents

## Player Arc

1. Web detects incident in a sector (storm, flare, debris field).
2. Player chooses response:
  - classify in web
  - execute reaction minigame in Godot
3. Sector outcome affects available missions for 24-72h.

## Integration Points

- Incident generator service (server-only).
- Incident resolution events from both clients.
- Sector state table consumed by `/game` and setup pages.

## Core Rewards

- Incident badges
- Rare anomaly access windows
- Temporary efficiency boosts

## Rollout Sequence

1. Pilot (2 weeks):
  - Loop 1 only (prospecting chain)
  - limited reward types
  - strict payout caps
2. Expand (2-4 weeks):
  - add guild contracts
  - add leaderboard slices by surface
3. Live operations:
  - enable sector incidents
  - weekly cadence + A/B survey prompts

## PostHog Event Schema (Proposed)

## Core Events

- `ecosystem_mission_started`
  - `mission_id`, `surface`, `run_id`, `entry_point`
- `ecosystem_mission_completed`
  - `mission_id`, `surface`, `run_id`, `duration_sec`, `objective_score`
- `ecosystem_reward_granted`
  - `reward_type`, `reward_value`, `surface`, `run_id`, `reward_key`
- `ecosystem_state_changed`
  - `state_type`, `sector_id`, `new_state`, `duration_hours`

## Guardrail Metrics

- run completion rate per surface
- reward grant failure rate
- duplicate reward prevention hit rate
- day-1/day-7 retention by first-surface cohort

## Dependencies

1. Stable signed-run API contract between web backend and Godot clients.
2. Shared reward ledger table + idempotency index.
3. Unified telemetry naming across web and Godot builds.
