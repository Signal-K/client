---
id: utvnlb
title: Migrate classification write paths to API routes
status: done
priority: high
labels:
  - performance
  - api
  - refactor
createdAt: '2026-02-19T08:08:08.782Z'
updatedAt: '2026-02-19T08:17:14.495Z'
timeSpent: 523
---
# Migrate classification write paths to API routes

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Move high-traffic classification insertion/update logic from client-side Supabase calls to authenticated Next API routes while keeping Supabase as persistence layer and avoiding schema migrations.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Classification submission from core telescope viewport no longer writes directly from browser
- [x] #2 API route validates auth and payload before DB write
- [x] #3 Typecheck passes
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implemented: research+achievements+milestones API routes, classification API route, telescope viewport API route, SSR supabase route utility, migrated key client flows to API fetch.
<!-- SECTION:NOTES:END -->

