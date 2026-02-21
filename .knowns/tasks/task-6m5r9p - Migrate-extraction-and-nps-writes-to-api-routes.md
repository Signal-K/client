---
id: 6m5r9p
title: 'Migrate extraction and NPS writes to API routes'
status: done
priority: high
labels:
  - architecture
  - api
  - writes
createdAt: '2026-02-19T10:28:00.000Z'
updatedAt: '2026-02-19T10:28:00.000Z'
timeSpent: 8
---
# Migrate extraction and NPS writes to API routes

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Move remaining client-side write operations in extraction completion and NPS survey submission to authenticated server API routes backed by Supabase SSR.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Extraction completion write flow uses API route
- [x] #2 NPS survey submission uses API route
- [x] #3 Server routes perform auth checks and data validation
- [x] #4 TypeScript passes
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Added app/api/gameplay/extraction/[id]/route.ts (GET + POST) and app/api/gameplay/nps/route.ts. Updated app/extraction/[id]/page.tsx to fetch/submit through extraction API route and updated src/components/ui/helpers/nps-popup.tsx to submit feedback via API route.
<!-- SECTION:NOTES:END -->
