---
title: "Survey System — Project Engagement Surveys & Telescope Viewport Fix"
description: "Spec and known tickets covering the project engagement survey system, telescope linked_anomalies prod fix, and responsive survey popup improvements"
category: "spec"
status: "active"
created: "2026-03-22"
updated: "2026-03-22"
---

# Survey System: Project Engagement Surveys & Telescope Viewport Fix

## Overview

Two workstreams shipped in this session:

1. **Telescope `/viewport` prod crash** — the Supabase join on `linked_anomalies` was silently failing in prod due to PostgREST FK detection unreliability.
2. **Project engagement surveys** — popup surveys that fire when a user hits a contribution threshold in a project, asking whether they'd like a dedicated standalone minigame.

---

## 1. Telescope Viewport Fix

### Problem

`/api/gameplay/telescope/viewport` used a Supabase embedded join:

```ts
supabase
  .from("linked_anomalies")
  .select(`id, anomaly_id, anomalies:anomaly_id (id, content, ...)`)
  .eq("author", userId)
  .in("automaton", ["Telescope", "TelescopePlanet"])
  .not("anomalies", "is", null)
```

The `anomalies:anomaly_id (...)` syntax is PostgREST relationship-hint notation. In prod, Supabase's schema cache periodically fails to detect the FK relationship between `linked_anomalies.anomaly_id → anomalies.id`, causing the query to return a `42P01` or similar error. This surfaced as a 500 on the telescope page with the anomalies section empty.

### Fix

Replaced with two independent queries:

1. `SELECT id, anomaly_id, classification_id FROM linked_anomalies WHERE author = ? AND automaton IN (...)` — no join.
2. `SELECT ... FROM anomalies WHERE id = ANY(anomalyIds)` — explicit ID lookup.

If the anomaly fetch fails, the route degrades gracefully (returns empty anomalies array rather than 500). All classification queries are unchanged.

**File:** `src/app/api/gameplay/telescope/viewport/route.ts`

### Known Follow-up Tickets

| ID | Title | Status | Notes |
|----|-------|--------|-------|
| TEL-01 | Confirm FK exists on `linked_anomalies.anomaly_id → anomalies.id` | Open | If FK is missing, the join syntax fix is irrelevant — the underlying data integrity issue should be confirmed in Supabase dashboard |
| TEL-02 | Add FK relationship to `linked_anomalies` Supabase migration | Open | Prerequisite for eventually restoring join syntax if desired |
| TEL-03 | Add error boundary / user-facing empty state to TelescopeSection | Open | Currently shows "Deploy Telescope" prompt when anomalies fail to load, which may be misleading for deployed users |

---

## 2. Project Engagement Surveys

### Background

Users who contribute significantly to a project should be prompted to express interest in a dedicated standalone minigame for that project (e.g. a planet-hunting sim, asteroid miner, or Mars rover game). Responses are captured in PostHog with the user's Supabase UUID attached so follow-up is possible.

### Architecture

```
GameClient.tsx
  └── GameSurveys (userId, classifications)
        ├── useGameSurveys(userId)           ← existing mechanic/loop surveys
        └── useProjectEngagementSurveys(userId, classifications)  ← new
```

The two hooks are independent. Mechanic surveys take display priority; engagement surveys surface once all mechanic surveys for the current session are dismissed/completed.

### Contribution Threshold

5 classifications of the relevant type triggers the survey. This is stored in each survey definition as `contributionThreshold` and can be adjusted per-project without code changes.

### Classification Type → Project Mapping

| Classification type(s) | Project |
|------------------------|---------|
| `planet`, `telescope-tess` | `planet-hunters` |
| `telescope-minorPlanet`, `active-asteroids` | `asteroid-hunting` |
| `rover` | `rover` |
| `cloud`, `lidar-jovianVortexHunter` | `cloudspotting` |
| `telescope-sunspot` | `sunspots` |

### PostHog Capture Shape

For engagement surveys only, `user_uuid` is added to the capture payload:

```ts
posthog.capture("survey sent", {
  $survey_id: "project_engage_planet_hunters_v1",
  $survey_name: "Planet Hunter Alert",
  $survey_response_dedicated_interest: "Yes, sign me up",
  user_uuid: "f47ac10b-58cc-4372-a567-0e02b2c3d479",  // Supabase UUID
})
```

### Responsive Popup Fix

The survey popup was using `fixed right-6 w-full max-w-sm` which overflows the viewport on narrow phones (e.g. 320px). Fixed to:

```
fixed bottom-20 left-3 right-3          ← mobile: full-width minus gutters
sm:bottom-24 sm:left-auto sm:right-6 sm:w-full   ← sm+: pinned bottom-right
```

### Files Changed / Created

| File | Change |
|------|--------|
| `src/features/surveys/types.ts` | Added `ProjectType`, `ProjectEngagementSurvey` types |
| `src/features/surveys/mechanic-surveys.ts` | Added `PROJECT_ENGAGEMENT_SURVEYS` (5 surveys) |
| `src/features/surveys/hooks/useProjectEngagementSurveys.ts` | New hook |
| `src/features/surveys/components/GameSurveys.tsx` | Integrated both hooks; fixed responsive positioning; added `user_uuid` capture |
| `src/app/game/GameClient.tsx` | Pass `data.classifications` to `GameSurveys` |

### Known Follow-up Tickets

| ID | Title | Status | Notes |
|----|-------|--------|-------|
| SUR-01 | Raise contribution threshold based on real data | Open | 5 is an estimate — review PostHog after 2 weeks of live data to see if threshold is too low/high |
| SUR-02 | Add `sunspot` classification type to mapping | Open | Currently only `telescope-sunspot` is mapped; confirm whether plain `sunspot` type is used in any active anomaly set |
| SUR-03 | Create PostHog funnel: survey shown → answered → "Yes" | Open | Use project ID 199773 and filter on `$survey_id` starting with `project_engage_` |
| SUR-04 | Wire "Yes, sign me up" responses to email capture or waitlist | Open | Currently just recorded in PostHog — a follow-up CTA or waitlist form could be triggered |
| SUR-05 | Survey localisation / copy review | Open | Copy was written for English speakers; review if i18n is planned |
| SUR-06 | Add `diskDetective`/`disk-detective` to engagement survey mapping | Open | Disk Detective classifications not currently covered; should map to a "stellar disk" survey if/when one is added |
| SUR-07 | Test survey popup on physical iOS/Android devices | Open | Responsive layout fixed in code; confirm bottom-20 clears nav bars on Safari/Chrome iOS |

---

## 3. Tests Added

### New test file: `useProjectEngagementSurveys.test.ts`

**Location:** `tests/unit/features/surveys/useProjectEngagementSurveys.test.ts`
**Tests:** 21
**All passing**

#### Coverage

| Area | Tests |
|------|-------|
| No userId / empty classifications → null | 2 |
| Below threshold → null | 1 |
| Each of 5 project types triggers correct survey | 7 (5 types + 2 alias classification types) |
| localStorage completed/dismissed suppression | 2 |
| dismissSurvey: sets storage, clears state | 1 |
| completeSurvey: sets storage, clears state | 1 |
| No-op on dismiss/complete when no active survey | 2 |
| Null/undefined classificationtype handling | 1 |
| Independent counting of mixed types | 1 |
| Priority: first eligible survey wins | 1 |
| Fallthrough: skips completed, surfaces next | 1 |
| Survey structure validation | 1 |
| Boundary: exactly 5 triggers; 4 does not | 2 |

### Extended test file: `mechanic-surveys.test.ts`

**Tests added:** 8

| Test | What it checks |
|------|----------------|
| Is a non-empty array | Basic sanity |
| Every survey has required MechanicMicroSurvey fields | Schema completeness |
| Every survey has projectType + contributionThreshold | New fields present |
| All project engagement IDs are unique | No accidental duplicates |
| Every question has `dedicated_interest` id, ≥3 options | Question contract |
| All project types are unique across surveys | One survey per project |
| Covers all 5 key project types | Full project coverage |
| No ID overlap with MECHANIC_SURVEYS | Isolation between survey groups |

---

## 4. PostHog Configuration

`.env.local` updated:

```
NEXT_PUBLIC_POSTHOG_KEY=phc_65umDftbbTkrm1V6azue6OeU4u5c8iJcaHm4JtJ95di
NEXT_PUBLIC_POSTHOG_HOST=https://us.posthog.com
posthog_api_key=phc_65umDftbbTkrm1V6azue6OeU4u5c8iJcaHm4JtJ95di
posthog_project_id=199773
posthog_region=US Cloud
```

Previous local key (`phc_HHi7NJoEq2z9G8aEeb7IrM2YkOGWPHpQm9mKlnnDJAI`, EU endpoint) replaced with the production project.

---

## Open Questions

- Should the engagement survey threshold be per-session or lifetime? Currently lifetime (localStorage).
- Should we show the engagement survey once globally or re-surface it if the user clicks "Maybe later"?
- Is there a Godot-side hook planned to read these PostHog responses and pre-populate a "signed up" list in Experiment 1?
