---
id: u5k2re
title: "2.2 Saily external linkage and context handoff"
status: completed
priority: high
labels:
  - migration-2.2
  - saily
  - integration
  - external
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

# 2.2 Saily external linkage and context handoff

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Treat Saily as an external frontend for this repository and provide in-app linkage and ecosystem context only.
Primary spec: specs/migration/two-two-migration
Primary spec path: .knowns/docs/specs/migration/two-two-migration.md
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Homepage and ecosystem routing include a direct Saily link
- [x] #2 Saily is labeled as external codebase in user-facing ecosystem guidance
- [x] #3 Knowns notes clarify that Saily gameplay implementation is out of scope for this repo
- [x] #4 External URL is documented as `https://thedailysail.starsailors.space`
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
- Spec reference: specs/migration/two-two-migration
- Linked Saily from redesigned landing page (`app/apt/page.tsx`) with external CTA buttons.
- Added explicit copy that Saily is a separate frontend/codebase.
- Consolidated this ticket to external-integration scope per product direction.
<!-- SECTION:NOTES:END -->


## Spec References

- specs/migration/two-two-migration
