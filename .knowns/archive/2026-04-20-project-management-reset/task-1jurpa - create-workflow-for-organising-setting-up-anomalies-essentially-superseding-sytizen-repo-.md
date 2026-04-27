---
id: 1jurpa
title: "Create workflow for organising & setting up anomalies (essentially superseding sytizen repo)"
status: completed
priority: medium
labels:
  - anomalies
  - data
  - db
specRefs:
  - "specs/migration/minigame-compatibility-matrix-and-parity-contract"
spec: "specs/migration/minigame-compatibility-matrix-and-parity-contract"
specPath: ".knowns/docs/specs/migration/minigame-compatibility-matrix-and-parity-contract.md"
specs:
  - "specs/migration/minigame-compatibility-matrix-and-parity-contract"
references:
  - "specs/migration/minigame-compatibility-matrix-and-parity-contract"
  - ".knowns/docs/specs/migration/minigame-compatibility-matrix-and-parity-contract.md"
createdAt: '2026-02-19T18:16:18Z'
updatedAt: "2026-03-06T08:55:25Z"
timeSpent: 0
---

# Create workflow for organising & setting up anomalies (essentially superseding sytizen repo)

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Primary spec: specs/migration/minigame-compatibility-matrix-and-parity-contract
Primary spec path: .knowns/docs/specs/migration/minigame-compatibility-matrix-and-parity-contract.md
A concrete client-side anomaly setup workflow has been documented and formalized.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

- [x] #1 A repeatable anomaly setup workflow is defined for client-side operations
- [x] #2 Required anomaly payload/schema expectations are documented
- [x] #3 Verification and regression steps are included
- [x] #4 Workflow report is checked into `.knowns/reports`

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
- Spec reference: specs/migration/minigame-compatibility-matrix-and-parity-contract
- Added workflow report:
  - `.knowns/reports/anomaly-workflow-v0-2026-03-06.md`
- Workflow now captures:
  - anomaly payload requirements
  - linking/import flow
  - regression verification commands (`yarn lint`, `npm run test:unit`, `yarn build`)
<!-- SECTION:NOTES:END -->


## Spec References

- specs/migration/minigame-compatibility-matrix-and-parity-contract
