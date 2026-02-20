---
id: q5ais9
title: Migrate social mutation paths to API routes
status: done
priority: medium
labels:
  - performance
  - api
  - refactor
createdAt: '2026-02-19T08:08:08.986Z'
updatedAt: '2026-02-19T09:58:19Z'
timeSpent: 122
---
# Migrate social mutation paths to API routes

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Move votes/comments writes from client-side Supabase calls to authenticated API routes and keep UI behavior unchanged.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Typecheck passes
- [x] #2 Primary post vote flow uses server action write path (cookie-authenticated)
- [x] #3 Primary comment submit flow uses server action write path (cookie-authenticated)
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Architecture updated per directive: Next.js-only social writes moved to server actions instead of API writes. Added API read endpoint for vote totals/user vote.
<!-- SECTION:NOTES:END -->
