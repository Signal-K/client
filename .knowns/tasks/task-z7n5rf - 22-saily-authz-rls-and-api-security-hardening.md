---
id: z7n5rf
title: "2.2 Saily authz/security hardening (external codebase)"
status: blocked
priority: high
labels:
  - migration-2.2
  - saily
  - security
  - auth
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

# 2.2 Saily authz, RLS, and API security hardening

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Saily auth/RLS/API security hardening is out of scope for this repository and should be executed in the external Saily codebase.
Primary spec: specs/migration/two-two-migration
Primary spec path: .knowns/docs/specs/migration/two-two-migration.md
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 RLS policies enforce player-only access to own pending submissions in Saily repo
- [ ] #2 Admin role can review all submissions and perform status transitions in Saily repo
- [ ] #3 API endpoints validate payload constraints and reject invalid writes in Saily repo
- [ ] #4 Abuse protections (rate limiting and audit logging) are in place in Saily repo
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
- Spec reference: specs/migration/two-two-migration
- Marked blocked in this repository after scope clarification: Saily lives at `https://thedailysail.starsailors.space`.
- Retained for dependency tracking only.
<!-- SECTION:NOTES:END -->


## Spec References

- specs/migration/two-two-migration
