---
id: d4q1sn
title: "Fix knowns docs sort and specs coverage regression"
status: completed
priority: high
labels:
  - knowns
  - docs
  - specs
  - bugfix
specRefs:
  - "specs/migration/minigame-compatibility-matrix-and-parity-contract"
spec: "specs/migration/minigame-compatibility-matrix-and-parity-contract"
specPath: ".knowns/docs/specs/migration/minigame-compatibility-matrix-and-parity-contract.md"
specs:
  - "specs/migration/minigame-compatibility-matrix-and-parity-contract"
references:
  - "specs/migration/minigame-compatibility-matrix-and-parity-contract"
  - ".knowns/docs/specs/migration/minigame-compatibility-matrix-and-parity-contract.md"
createdAt: '2026-02-22T16:15:00Z'
updatedAt: '2026-02-22T22:30:00Z'
timeSpent: 0
---

# Fix knowns docs sort and specs coverage regression

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Resolve docs route runtime sorting error and restore expected specs coverage behavior after markdown migration into knowns.
Primary spec: specs/migration/minigame-compatibility-matrix-and-parity-contract
Primary spec path: .knowns/docs/specs/migration/minigame-compatibility-matrix-and-parity-contract.md
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 No markdown files in knowns docs tree are missing a title heading
- [x] #2 Imported spec archives do not live under a `specs` scanner path
- [x] #3 Knowns docs tree structure remains valid after migration
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
- Spec reference: specs/migration/minigame-compatibility-matrix-and-parity-contract
- Added missing H1 title to:
  - `.knowns/docs/imported/docs/src-components/Anomalies.tsx.md`
- Added `title` frontmatter to every markdown document under `.knowns/docs` so sort keys are always defined.
- Added explicit task-to-spec references across task frontmatter/body (`specRefs`, `## Spec References`, and `specs/...` tokens).
- Renamed dotted migration spec slugs to parser-safe names:
  - `.knowns/docs/specs/migration/2.2-migration.md` -> `.knowns/docs/specs/migration/two-two-migration.md`
  - `.knowns/docs/specs/migration/2.2-survey-audit-and-ops.md` -> `.knowns/docs/specs/migration/two-two-survey-audit-and-ops.md`
- Renamed imported spec archive folder:
  - `.knowns/docs/imported/specs/` -> `.knowns/docs/imported/specsheets/`
- Verified all markdown files under `.knowns/docs` contain at least one H1 heading and a frontmatter title.
<!-- SECTION:NOTES:END -->


## Spec References

- specs/migration/minigame-compatibility-matrix-and-parity-contract
