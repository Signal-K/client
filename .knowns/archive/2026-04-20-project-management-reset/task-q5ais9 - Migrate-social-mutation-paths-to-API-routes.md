---
id: q5ais9
title: Migrate social mutation paths to API routes
status: done
priority: medium
labels:
  - performance
  - api
  - refactor
specRefs:
  - "specs/mechanics/social-spec"
spec: "specs/mechanics/social-spec"
specPath: ".knowns/docs/specs/mechanics/social-spec.md"
specs:
  - "specs/mechanics/social-spec"
references:
  - "specs/mechanics/social-spec"
  - ".knowns/docs/specs/mechanics/social-spec.md"
createdAt: '2026-02-19T08:08:08.986Z'
updatedAt: '2026-02-19T09:58:19Z'
timeSpent: 122
---
# Migrate social mutation paths to API routes

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Move votes/comments writes from client-side Supabase calls to authenticated API routes and keep UI behavior unchanged.
Primary spec: specs/mechanics/social-spec
Primary spec path: .knowns/docs/specs/mechanics/social-spec.md
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Typecheck passes
- [x] #2 Primary post vote flow uses server action write path (cookie-authenticated)
- [x] #3 Primary comment submit flow uses server action write path (cookie-authenticated)
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
- Spec reference: specs/mechanics/social-spec
Architecture updated per directive: Next.js-only social writes moved to server actions instead of API writes. Added API read endpoint for vote totals/user vote.
<!-- SECTION:NOTES:END -->


## Spec References

- specs/mechanics/social-spec
