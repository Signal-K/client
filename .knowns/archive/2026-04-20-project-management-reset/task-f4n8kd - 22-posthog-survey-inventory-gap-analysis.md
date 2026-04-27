---
id: f4n8kd
title: "2.2 posthog survey inventory and gap analysis"
status: completed
priority: high
labels:
  - migration-2.2
  - posthog
  - analytics
  - surveys
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

# 2.2 posthog survey inventory and gap analysis

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Audit all current PostHog surveys and responses, map each survey to project/user-flow stage, identify stale questions, and produce a concrete update plan per project.
Primary spec: specs/migration/two-two-migration
Primary spec path: .knowns/docs/specs/migration/two-two-migration.md
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Current surveys and trigger points are enumerated in one knowns note
- [x] #2 Existing responses are summarized by project and flow step
- [x] #3 Required edits/new surveys are listed with rationale per ecosystem project
- [x] #4 Plan identifies ownership, rollout order, and measurement events
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
- Spec reference: specs/migration/two-two-migration
- Audited live surveys in PostHog project `199773` (US Cloud) and captured active + archived states in:
  - `.knowns/docs/specs/migration/two-two-survey-audit-and-ops.md`
- Created new survey:
  - `019c83d3-d0a5-0000-4e8f-5b7fd8794666` (`Star Sailors Webapp Loop Survey (2.2)`)
- Archived stale external surveys:
  - `019c4a79-92bd-0000-c97c-2a2c11a18d4f`
  - `019bb036-6cd7-0000-fc06-1c83a01e7759`
- Added repeatable monitoring script:
  - `scripts/posthog/monitor_surveys.cjs`
- Stored baseline monitoring snapshot:
  - `.knowns/reports/posthog/survey-monitor-2026-02-22T05-32-31-136Z.json`
<!-- SECTION:NOTES:END -->


## Spec References

- specs/migration/two-two-migration
