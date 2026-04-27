---
id: m4p8sv
title: "2.2 posthog mechanic micro-surveys and session token propagation"
status: completed
priority: high
labels:
  - migration-2.2
  - posthog
  - surveys
  - analytics
  - ux
specRefs:
  - "specs/migration/two-two-survey-audit-and-ops"
spec: "specs/migration/two-two-survey-audit-and-ops"
specPath: ".knowns/docs/specs/migration/two-two-survey-audit-and-ops.md"
createdAt: '2026-02-26T22:59:00Z'
updatedAt: '2026-02-26T23:06:00Z'
timeSpent: 0
---

# 2.2 posthog mechanic micro-surveys and session token propagation

## Description

Add one-to-two-question, in-world micro-surveys for distinct mechanics/playthrough surfaces, ensure one-time display per user/survey, and include a session token in submitted survey analytics payloads.

## Acceptance Criteria

- [x] #1 Mechanic-specific surveys are shown for multiple surfaces (core loops + ecosystem/minigame track)
- [x] #2 Survey UI is responsive and visually consistent with the game shell
- [x] #3 Users are not shown the same survey twice
- [x] #4 Session token is included in survey analytics responses

## Implementation Notes

- Added mechanic survey model and definitions:
  - `src/features/surveys/types.ts`
  - `src/features/surveys/mechanic-surveys.ts`
- Added world-style survey UI component:
  - `src/features/surveys/components/MechanicPulseSurvey.tsx`
- Wired game mechanic surveys on `/game`:
  - telescope loop debrief
  - rover loop debrief
  - one-time-per-user/survey dedup via localStorage key (`surveyStorageKey`)
  - analytics events:
    - `mechanic_micro_survey_shown`
    - `mechanic_micro_survey_submitted`
    - `mechanic_micro_survey_dismissed`
- Wired ecosystem/minigame survey on `/ecosystem`:
  - minigame priority + web/minigame bridge depth
  - one-time-per-user/survey dedup
- Added analytics session token utility and global PostHog registration:
  - `src/lib/analytics/session-token.ts`
  - `src/components/layout/RootLayoutClient.tsx` registers `starsailors_session_token`
- Survey response captures explicitly include `starsailors_session_token` as payload property.
- Validation:
  - `yarn lint` passes
  - `npm run test:unit` passes (`126` files, `1032` tests)
  - `yarn build` passes
