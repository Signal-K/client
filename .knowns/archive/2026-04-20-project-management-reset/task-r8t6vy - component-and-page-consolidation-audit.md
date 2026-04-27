---
id: r8t6vy
title: "Component and page consolidation audit"
status: done
priority: high
labels:
  - architecture
  - cleanup
  - ux
  - refactor
specRefs:
  - "specs/migration/two-two-migration"
spec: "specs/migration/two-two-migration"
specPath: ".knowns/docs/specs/migration/two-two-migration.md"
specs:
  - "specs/migration/two-two-migration"
references:
  - "specs/migration/two-two-migration"
  - ".knowns/docs/specs/migration/two-two-migration.md"
createdAt: '2026-02-22T15:20:00Z'
updatedAt: '2026-02-22T15:40:00Z'
timeSpent: 0
---

# Component and page consolidation audit

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Identify and merge/remove duplicate route wrappers, overlapping setup/viewport shells, and stale components while preserving core gameplay loops (deploy, classify, visit, interact, rewards, stardust).
Primary spec: specs/migration/two-two-migration
Primary spec path: .knowns/docs/specs/migration/two-two-migration.md
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Duplicate/overlapping pages are catalogued with merge decision
- [ ] #2 At least one redundant shell/page pattern is consolidated
- [x] #3 A migration map is documented for remaining cleanup candidates
- [x] #4 No change to chapter/progression/classification mechanics
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
- Spec reference: specs/migration/two-two-migration
- Added consolidation audit doc:
  - `.knowns/docs/specs/migration/component-consolidation-audit.md`
- Completed coupling cleanup in separate task:
  - `.knowns/tasks/task-n2w7qd - remove-route-to-route-import-coupling.md`
- Next concrete consolidation target:
  - unify deploy/viewport shell patterns for satellite + rover pages.
<!-- SECTION:NOTES:END -->


## Spec References

- specs/migration/two-two-migration
