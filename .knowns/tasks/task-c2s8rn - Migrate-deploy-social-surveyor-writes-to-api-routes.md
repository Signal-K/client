---
id: c2s8rn
title: 'Migrate deploy + social surveyor writes to API routes'
status: done
priority: high
labels:
  - architecture
  - api
  - social
createdAt: '2026-02-19T10:36:00.000Z'
updatedAt: '2026-02-19T10:36:00.000Z'
timeSpent: 9
---
# Migrate deploy + social surveyor writes to API routes

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Move remaining client-side write operations in deploy helper flows and surveyor comments to authenticated API routes.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 ActivityHeader quick satellite deploy write uses API route
- [x] #2 Solar participation write uses API route
- [x] #3 Surveyor comment calculators/forms submit through API route
- [x] #4 TypeScript passes
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Added app/api/gameplay/deploy/satellite/quick/route.ts, app/api/gameplay/deploy/solar/route.ts, and app/api/gameplay/surveyor/comments/route.ts. Updated src/components/scenes/deploy/ActivityHeader.tsx, src/components/scenes/deploy/solar/SolarHealth.tsx, src/components/social/posts/Surveyor/SurveyorPostCard.tsx, and src/components/social/posts/Surveyor/CalculatorSurveyor.tsx to use server-authenticated routes for write paths.
<!-- SECTION:NOTES:END -->
