---
title: "2.2 Survey Audit And Operations"
---

# 2.2 Survey Audit And Operations

Date: 2026-02-22
Project: PostHog project `199773` (US Cloud)

## Current Survey Inventory

### Active
- `019c83d3-d0a5-0000-4e8f-5b7fd8794666` - Star Sailors Webapp Loop Survey (2.2)
  - Type: `popover`
  - Trigger: `posthog_survey_triggered` where `trigger_page = game`
  - Surface: web client gameplay loop
- `019c6b89-a660-0000-ef2b-2163bc9dea6f` - DailySail Exit Survey (v1)
  - Type: `popover`
  - Trigger: `exit_survey_triggered` with `source=first_game_complete`, `app_version=v1`
  - Surface: DailySail flow
- `019c603e-d236-0000-85ce-f507635d2311` - Experiment 1 Exit Survey (Godot build)
  - Type: `external_survey`
  - Surface: Experiment 1 testing flow

### Archived On 2026-02-22
- `019c4a79-92bd-0000-c97c-2a2c11a18d4f` - Open feedback (2026-02-11 10:04)
- `019bb036-6cd7-0000-fc06-1c83a01e7759` - Star Sailors Feedback

Reason: These were broad external links with stale question framing and low completion quality for current 2.2 migration goals.

## Monitoring Baseline

Monitoring snapshot file:
- `.knowns/reports/posthog/survey-monitor-2026-02-22T05-32-31-136Z.json`

Baseline from recent event history:
- Open feedback: `shown=9`, `sent=29`, `completed=4`, `completion_rate=0.138`
- Star Sailors Feedback: `shown=2`, `sent=4`, `completed=1`, `completion_rate=0.25`

## Flow Mapping

- Web client (`/game`):
  - Trigger event emitted after meaningful engagement in base/deploy/classification loop.
  - Survey target is now `Star Sailors Webapp Loop Survey (2.2)`.
- Experiment 1:
  - Existing external survey remains active for prototype-specific feedback.
- DailySail:
  - Existing versioned popover remains active for first-game completion.
- Click-A-Coral:
  - No active survey (project not playtest-ready yet).
- Saily:
  - No active survey yet in this repo flow (pending playable daily anomaly loop).

## Learnings From Existing Responses

- Gameplay demand leans toward:
  - better mobile responsiveness
  - clearer onboarding and progression cues
  - stronger resource-management and construction loops
- External social traffic generated many shallow responses, which reduced signal quality.
- Survey completion rates were modest; event-triggered in-app timing is preferred over broad external links.

## 2.2 Survey Plan

1. Keep only context-bound surveys active (webapp, DailySail, Experiment 1).
2. Use user identification (`supabase_uuid`, email when available) to improve attribution quality.
3. Keep dedup/cooldown in client trigger logic to limit survey fatigue.
4. Run recurring monitoring via:
   - `node scripts/posthog/monitor_surveys.cjs` with env `POSTHOG_PERSONAL_API_KEY`.

