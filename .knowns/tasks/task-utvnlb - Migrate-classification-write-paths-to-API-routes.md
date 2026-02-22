---
id: utvnlb
title: Migrate classification write paths to API routes
status: done
priority: high
labels:
  - performance
  - api
  - refactor
specRefs:
  - "specs/mechanics/classification-spec"
spec: "specs/mechanics/classification-spec"
specPath: ".knowns/docs/specs/mechanics/classification-spec.md"
specs:
  - "specs/mechanics/classification-spec"
references:
  - "specs/mechanics/classification-spec"
  - ".knowns/docs/specs/mechanics/classification-spec.md"
createdAt: '2026-02-19T08:08:08.782Z'
updatedAt: '2026-02-19T08:17:14.495Z'
timeSpent: 523
---
# Migrate classification write paths to API routes

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Move high-traffic classification insertion/update logic from client-side Supabase calls to authenticated Next API routes while keeping Supabase as persistence layer and avoiding schema migrations.
Primary spec: specs/mechanics/classification-spec
Primary spec path: .knowns/docs/specs/mechanics/classification-spec.md
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Classification submission from core telescope viewport no longer writes directly from browser
- [x] #2 API route validates auth and payload before DB write
- [x] #3 Typecheck passes
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
- Spec reference: specs/mechanics/classification-spec
Implemented: research+achievements+milestones API routes, classification API route, telescope viewport API route, SSR supabase route utility, migrated key client flows to API fetch.
<!-- SECTION:NOTES:END -->



## Spec References

- specs/mechanics/classification-spec
