---
id: jfp2pp
title: 'Architecture migration: API routes for standalone game/experiment mechanics'
status: done
priority: high
labels:
  - architecture
  - api
  - performance
createdAt: '2026-02-19T08:12:39.668Z'
updatedAt: '2026-02-19T08:17:30.957Z'
timeSpent: 7
---
# Architecture migration: API routes for standalone game/experiment mechanics

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Move standalone game/experiment mechanic read-write flows to authenticated API routes backed by Supabase.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Core classification experiment write paths use API routes
- [x] #2 Research mechanic read/write paths use API routes
- [x] #3 Revalidation hooks added where writes mutate cached data
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Added API routes for gameplay/research/summary, gameplay/research/unlock, gameplay/classifications, gameplay/telescope/viewport. Migrated core telescope classification writes and research writes to API. Added revalidatePath calls on write routes.
<!-- SECTION:NOTES:END -->

