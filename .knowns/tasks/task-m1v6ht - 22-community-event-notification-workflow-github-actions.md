---
id: m1v6ht
title: "2.2 community event notification workflow via GitHub Actions"
status: completed
priority: medium
labels:
  - migration-2.2
  - notifications
  - github-actions
  - operations
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
updatedAt: '2026-02-22T15:02:00Z'
timeSpent: 0
---

# 2.2 community event notification workflow via GitHub Actions

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create an operational workflow to trigger community-event notifications from repository automation, with safeguards for targeting, dry-runs, and delivery reporting.
Primary spec: specs/migration/two-two-migration
Primary spec path: .knowns/docs/specs/migration/two-two-migration.md
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 GitHub Action can dispatch event payloads to notification API securely
- [x] #2 Workflow supports dry-run and production modes
- [x] #3 Delivery report artifact is generated for each run
- [x] #4 Runbook documents trigger parameters and rollback procedure
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
- Spec reference: specs/migration/two-two-migration
- Added workflow-dispatch job in `.github/workflows/pipeline.yml`:
  - `community_event_notify`
  - supports `run_community_event_notify`, title/message/url, and `community_event_dry_run`.
- Added delivery script:
  - `scripts/notify-community-event.js`
  - deduplicates endpoints, supports dry-run, writes JSON report.
- Added artifact upload:
  - `community-event-report` from `community-event-report.json`.
- Runbook added:
  - `.knowns/docs/specs/migration/community-event-notify-runbook.md`
<!-- SECTION:NOTES:END -->


## Spec References

- specs/migration/two-two-migration
