---
id: l9s3pw
title: "2.2 survey rewards, dedup, and delivery rules"
status: done
priority: high
labels:
  - migration-2.2
  - posthog
  - rewards
  - ux
specRefs:
  - "specs/migration/two-two-migration"
spec: "specs/migration/two-two-migration"
specPath: ".knowns/docs/specs/migration/two-two-migration.md"
specs:
  - "specs/migration/two-two-migration"
references:
  - "specs/migration/two-two-migration"
  - ".knowns/docs/specs/migration/two-two-migration.md"
createdAt: '2026-02-22T13:25:00Z'
updatedAt: '2026-02-22T14:24:00Z'
timeSpent: 0
---

# 2.2 survey rewards, dedup, and delivery rules

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implement survey display governance so users are asked at the right time, never spammed, and can receive consistent in-app rewards for valid survey completion.
Primary spec: specs/migration/two-two-migration
Primary spec path: .knowns/docs/specs/migration/two-two-migration.md
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Survey impression eligibility is enforced by cooldown and completion history
- [x] #2 Users cannot repeatedly trigger the same survey reward (dedup logic needed)
- [x] #3 Reward assignment is auditable (who, what survey, when, reward value) (audit table/logging needed)
- [x] #4 UX includes clear success/failure states for survey reward processing (UI feedback needed)
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
- Spec reference: specs/migration/two-two-migration
- Updated webapp survey trigger to new active 2.2 survey in `app/game/page.tsx`.
- Added cooldown and dedup guardrails:
  - `POSTHOG_SURVEY_SHOWN_KEY`
  - `POSTHOG_SURVEY_LAST_SHOWN_AT_KEY`
  - 14-day cooldown window (`POSTHOG_SURVEY_COOLDOWN_MS`)
- Added `trigger_surface: "web-client"` tracking property for cleaner survey attribution.
- Added PostHog user identification in `src/components/layout/RootLayoutClient.tsx`:
  - `posthog.identify(user.id, { email, supabase_uuid })`
- Created `supabase/migrations/manual/add_survey_rewards_table.sql`:
  - `survey_rewards` table with `UNIQUE(user_id, survey_id)` constraint for server-side dedup
  - RLS enabled; SELECT policy for own rows; INSERT via service-role only
- Created `src/app/api/gameplay/survey-reward/route.ts` (POST):
  - Auth-gated; uses `INSERT ... ON CONFLICT DO NOTHING RETURNING id`
  - Returns `{ granted, alreadyGranted, stardust }` — idempotent across retries
- Updated `src/app/api/gameplay/research/summary/route.ts`:
  - Added parallel `survey_rewards` query; `surveyBonus` added to `availableStardust`
  - `surveyBonus` also returned in the response payload
- Updated `src/app/api/gameplay/research/unlock/route.ts`:
  - Same `survey_rewards` query added; `surveyBonus` folded into spendable stardust check
- Updated `src/app/game/page.tsx`:
  - `handleSurveyReward` (useCallback): calls API, writes `SURVEY_REWARD_GRANTED_KEY` to localStorage
  - PostHog event interception useEffect: monkey-patches `posthog.capture` to detect `"survey sent"` + `$survey_completed === true`; restores on cleanup
  - Fixed-position toast (`⭐ +5 Stardust`) with `animate-in slide-in-from-bottom-4`, auto-dismisses after 4 s
<!-- SECTION:NOTES:END -->


## Spec References

- specs/migration/two-two-migration
