---
id: l9s3pw
title: "2.2 survey rewards, dedup, and delivery rules"
status: in-progress
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
- [ ] #2 Users cannot repeatedly trigger the same survey reward
- [ ] #3 Reward assignment is auditable (who, what survey, when, reward value)
- [ ] #4 UX includes clear success/failure states for survey reward processing
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
<!-- SECTION:NOTES:END -->


## Spec References

- specs/migration/two-two-migration
