---
id: p8v2qn
title: "2.2 posthog dashboard for mechanic micro-surveys"
status: completed
priority: high
labels:
  - migration-2.2
  - posthog
  - analytics
  - dashboard
specRefs:
  - "specs/migration/two-two-survey-audit-and-ops"
spec: "specs/migration/two-two-survey-audit-and-ops"
specPath: ".knowns/docs/specs/migration/two-two-survey-audit-and-ops.md"
createdAt: '2026-02-26T23:12:00Z'
updatedAt: '2026-02-26T23:18:00Z'
timeSpent: 0
---

# 2.2 posthog dashboard for mechanic micro-surveys

## Description

Create a reusable automation path that provisions a PostHog dashboard for the new mechanic micro-survey events and attaches key trend insights.

## Acceptance Criteria

- [x] #1 Script exists to create or reuse dashboard
- [x] #2 Script provisions insights for shown/submitted/dismissed events
- [x] #3 Script outputs dashboard URL and created insight IDs
- [x] #4 Dashboard has been created in target PostHog project with live credentials

## Implementation Notes

- Added:
  - `scripts/posthog/create_mechanic_surveys_dashboard.cjs`
  - `scripts/posthog/create_mechanic_surveys_dashboard.sh`
- Script behavior:
  - reads `POSTHOG_PERSONAL_API_KEY`, `POSTHOG_PROJECT_ID`, `POSTHOG_HOST`
  - creates or reuses dashboard `Star Sailors Mechanics Pulse`
  - creates trend insights for:
    - `mechanic_micro_survey_shown`
    - `mechanic_micro_survey_submitted`
    - `mechanic_micro_survey_dismissed`
- Dashboard created successfully with provided credentials:
  - Dashboard ID: `1312055`
  - URL: `https://us.posthog.com/project/199773/dashboard/1312055`
  - Insight IDs:
    - `7082230` (`Mechanic Survey Shown (by survey)`)
    - `7082231` (`Mechanic Survey Submitted (by survey)`)
    - `7082232` (`Mechanic Survey Dismissed (by survey)`)

## Runbook

```bash
export POSTHOG_PERSONAL_API_KEY=phx_...
export POSTHOG_PROJECT_ID=199773
export POSTHOG_HOST=us.posthog.com
scripts/posthog/create_mechanic_surveys_dashboard.sh
```
