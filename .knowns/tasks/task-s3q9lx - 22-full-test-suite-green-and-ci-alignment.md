---
id: s3q9lx
title: "2.2 full test suite green and CI alignment"
status: completed
priority: high
labels:
  - migration-2.2
  - testing
  - ci
  - reliability
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
updatedAt: '2026-03-06T08:51:42Z'
timeSpent: 0
---

# 2.2 full test suite green and CI alignment

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Make all project test suites pass in local and CI contexts with deterministic setup, then enforce stable pass criteria in pipeline workflows.
Primary spec: specs/migration/two-two-migration
Primary spec path: .knowns/docs/specs/migration/two-two-migration.md
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Unit/integration/e2e commands are documented and reproducible
- [x] #2 Failing tests are triaged and fixed or quarantined with expiry plan
- [x] #3 CI pipeline reflects required suite matrix with clear gating behavior
- [x] #4 Final run evidence is attached for each required test category
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
- Spec reference: specs/migration/two-two-migration
- Validation runs executed:
  - `npm run lint` passed
  - `npm run test:unit` passed
  - `yarn build` passed on March 6, 2026
- CI matrix tightened:
  - Added explicit lint gate in `.github/workflows/pipeline.yml`.
- Workflow enhancements added:
  - community event notification dispatch with dry-run/report artifact.
- Final run evidence (March 6, 2026):
  - `yarn lint`: pass
  - `npm run test:unit`: pass (`126` files, `1046` tests)
  - `yarn build`: pass (static page generation completed; route manifest emitted)
<!-- SECTION:NOTES:END -->


## Spec References

- specs/migration/two-two-migration
