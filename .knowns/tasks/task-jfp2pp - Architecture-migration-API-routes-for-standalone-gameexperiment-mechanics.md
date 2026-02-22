---
id: jfp2pp
title: 'Architecture migration: API routes for standalone game/experiment mechanics'
status: done
priority: high
labels:
  - architecture
  - api
  - performance
specRefs:
  - "specs/mechanics/classification-spec"
spec: "specs/mechanics/classification-spec"
specPath: ".knowns/docs/specs/mechanics/classification-spec.md"
specs:
  - "specs/mechanics/classification-spec"
references:
  - "specs/mechanics/classification-spec"
  - ".knowns/docs/specs/mechanics/classification-spec.md"
createdAt: '2026-02-19T08:12:39.668Z'
updatedAt: '2026-02-19T08:17:30.957Z'
timeSpent: 7
---
# Architecture migration: API routes for standalone game/experiment mechanics

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Move standalone game/experiment mechanic read-write flows to authenticated API routes backed by Supabase.
Primary spec: specs/mechanics/classification-spec
Primary spec path: .knowns/docs/specs/mechanics/classification-spec.md
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Core classification experiment write paths use API routes
- [x] #2 Research mechanic read/write paths use API routes
- [x] #3 Revalidation hooks added where writes mutate cached data
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
- Spec reference: specs/mechanics/classification-spec
Added API routes for gameplay/research/summary, gameplay/research/unlock, gameplay/classifications, gameplay/telescope/viewport. Migrated core telescope classification writes and research writes to API. Added revalidatePath calls on write routes.
<!-- SECTION:NOTES:END -->



## Spec References

- specs/mechanics/classification-spec
