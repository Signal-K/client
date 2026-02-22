---
id: k4m9px
title: "2.2 feature-based filesystem migration for Next.js app"
status: completed
priority: high
labels:
  - migration-2.2
  - architecture
  - filesystem
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
updatedAt: '2026-02-22T15:28:00Z'
timeSpent: 0
---

# 2.2 feature-based filesystem migration for Next.js app

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Restructure component organization toward feature-based ownership (`src/features/*`) while preserving Next.js route files under `app/` and existing gameplay mechanics.
Primary spec: specs/migration/two-two-migration
Primary spec path: .knowns/docs/specs/migration/two-two-migration.md
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 High-traffic route surfaces use feature-scoped components
- [x] #2 Legacy `src/components` references are reduced for migrated features
- [x] #3 Route files stop importing other route files directly
- [x] #4 Migration notes document new layout conventions
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
- Spec reference: specs/migration/two-two-migration
- Moved game dashboard UI components into feature scope:
  - `src/features/game/components/*` (from `src/components/game/*`)
- Moved setup scaffold to:
  - `src/features/setup/components/SetupScaffold.tsx`
- Moved notification prompt to:
  - `src/features/notifications/components/PushNotificationPrompt.tsx`
- Updated imports in:
  - `app/game/page.tsx`
  - `app/setup/rover/page.tsx`
  - `app/setup/satellite/page.tsx`
  - `app/setup/solar/page.tsx`
  - `app/setup/telescope/page.tsx`
- Removed route-to-route imports in structure pages, replacing with auth guards/redirects.
- Added filesystem convention and merge-candidate doc:
  - `.knowns/docs/specs/migration/filesystem-organization.md`
<!-- SECTION:NOTES:END -->


## Spec References

- specs/migration/two-two-migration
