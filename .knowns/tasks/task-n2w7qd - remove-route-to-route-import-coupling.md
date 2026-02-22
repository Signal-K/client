---
id: n2w7qd
title: "Remove route-to-route import coupling"
status: completed
priority: high
labels:
  - architecture
  - routing
  - cleanup
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
updatedAt: '2026-02-22T15:20:00Z'
timeSpent: 0
---

# Remove route-to-route import coupling

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Eliminate direct imports of `app/*/page.tsx` from other routes and replace them with explicit auth redirects or shared component imports.
Primary spec: specs/migration/two-two-migration
Primary spec path: .knowns/docs/specs/migration/two-two-migration.md
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Telescope route no longer imports landing/home route files
- [x] #2 Balloon/camera routes no longer import home route file
- [x] #3 Auth fallback behavior remains consistent via redirect/guard patterns
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
- Spec reference: specs/migration/two-two-migration
- Updated `app/structures/telescope/page.tsx` to remove `@/app/page` and `@/app/apt/page` imports and use auth redirect guard.
- Updated `app/structures/balloon/page.tsx` to remove unused route import.
- Updated `app/structures/cameras/page.tsx` to remove route import and redirect unauthenticated users to `/auth`.
<!-- SECTION:NOTES:END -->



## Spec References

- specs/migration/two-two-migration
