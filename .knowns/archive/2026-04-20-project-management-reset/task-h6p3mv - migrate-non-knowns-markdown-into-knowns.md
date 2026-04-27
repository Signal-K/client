---
id: h6p3mv
title: "Migrate non-knowns markdown into knowns"
status: completed
priority: medium
labels:
  - docs
  - knowns
  - cleanup
specRefs:
  - "specs/migration/minigame-compatibility-matrix-and-parity-contract"
spec: "specs/migration/minigame-compatibility-matrix-and-parity-contract"
specPath: ".knowns/docs/specs/migration/minigame-compatibility-matrix-and-parity-contract.md"
specs:
  - "specs/migration/minigame-compatibility-matrix-and-parity-contract"
references:
  - "specs/migration/minigame-compatibility-matrix-and-parity-contract"
  - ".knowns/docs/specs/migration/minigame-compatibility-matrix-and-parity-contract.md"
createdAt: '2026-02-22T16:00:00Z'
updatedAt: '2026-02-22T16:00:00Z'
timeSpent: 0
---

# Migrate non-knowns markdown into knowns

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Move all markdown files outside `.knowns` into knowns docs/specs structure, preserving root `README.md` in place.
Primary spec: specs/migration/minigame-compatibility-matrix-and-parity-contract
Primary spec path: .knowns/docs/specs/migration/minigame-compatibility-matrix-and-parity-contract.md
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 All non-knowns markdown files are moved into `.knowns/docs/...`
- [x] #2 Root `README.md` remains at repository root
- [x] #3 Moved files are split into docs vs specs folders
- [x] #4 Final verification shows no other `.md` files outside `.knowns` except `README.md`
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
- Spec reference: specs/migration/minigame-compatibility-matrix-and-parity-contract
- Moved to specs:
  - `.knowns/docs/imported/specsheets/ARCHITECTURE.md`
  - `.knowns/docs/imported/specsheets/SSR_MIGRATION.md`
  - `.knowns/docs/imported/specsheets/SUNSPOT_MISSION_IMPLEMENTATION.md`
  - `.knowns/docs/imported/specsheets/MINERAL_DEPOSIT_SYSTEM.md`
  - `.knowns/docs/imported/specsheets/NGTS_ANNOTATION_IMPLEMENTATION.md`
  - `.knowns/docs/imported/specsheets/WARP.md`
- Moved to docs:
  - `.knowns/docs/imported/docs/ACHIEVEMENT_SYSTEM.md`
  - `.knowns/docs/imported/docs/STAR_SAILORS_USER_FLOWS.md`
  - `.knowns/docs/imported/docs/CITIZEN_SCIENCE_OVERVIEW.md`
  - `.knowns/docs/imported/docs/src-components/onboarding-README.md`
  - `.knowns/docs/imported/docs/src-components/Anomalies.tsx.md`
- Verification command result:
  - `rg --files -g '*.md'` returns only `README.md` at repo root.
<!-- SECTION:NOTES:END -->


## Spec References

- specs/migration/minigame-compatibility-matrix-and-parity-contract
