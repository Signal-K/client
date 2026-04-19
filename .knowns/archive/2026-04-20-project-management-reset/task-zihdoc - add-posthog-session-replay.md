---
id: zihdoc
title: "Add posthog session replay"
status: done
priority: high
labels:
  - posthog
  - analytics
  - db
specRefs:
  - "specs/migration/two-two-survey-audit-and-ops"
spec: "specs/migration/two-two-survey-audit-and-ops"
specPath: ".knowns/docs/specs/migration/two-two-survey-audit-and-ops.md"
specs:
  - "specs/migration/two-two-survey-audit-and-ops"
references:
  - "specs/migration/two-two-survey-audit-and-ops"
  - ".knowns/docs/specs/migration/two-two-survey-audit-and-ops.md"
createdAt: '2026-02-19T13:31:11Z'
updatedAt: "2026-02-19T09:58:19Z"
timeSpent: 0
---

# Add posthog session replay

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Primary spec: specs/migration/two-two-survey-audit-and-ops
Primary spec path: .knowns/docs/specs/migration/two-two-survey-audit-and-ops.md
<!-- SECTION:DESCRIPTION:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
- Spec reference: specs/migration/two-two-survey-audit-and-ops
Session replay is enabled in `src/components/providers/PostHogProvider.tsx`:
- `disable_session_recording: false`
- `session_recording` configuration block present in `posthog.init(...)`.

Provider is wired from root layout (`app/layout.tsx`) with API key/project/region env wiring.
<!-- SECTION:NOTES:END -->


## Spec References

- specs/migration/two-two-survey-audit-and-ops
