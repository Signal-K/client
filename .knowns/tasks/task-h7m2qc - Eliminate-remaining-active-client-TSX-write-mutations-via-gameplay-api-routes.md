---
id: h7m2qc
title: Eliminate remaining active client TSX write mutations via gameplay API routes
status: done
priority: high
labels:
  - architecture
  - api
  - migration
createdAt: '2026-02-19T11:35:00.000Z'
updatedAt: '2026-02-19T12:45:00.000Z'
timeSpent: 61
---
# Eliminate remaining active client TSX write mutations via gameplay API routes

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Remove all active direct Supabase write mutations from TSX components by routing writes through authenticated API endpoints while preserving behavior and avoiding schema migrations.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Active TSX client write hotspots migrated to API routes
- [x] #2 Rover/satellite/solar/gameplay mechanics still function with same UX flow
- [x] #3 Notification and Mars-photo mutation flows moved off direct client writes
- [x] #4 Typecheck passes
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Added API routes:
- app/api/gameplay/linked-anomalies/route.ts
- app/api/gameplay/mineral-deposits/route.ts
- app/api/gameplay/mineral-deposits/bulk/route.ts
- app/api/gameplay/inventory/use/route.ts
- app/api/gameplay/profile/classification-points/route.ts
- app/api/gameplay/deploy/rover/return/route.ts
- app/api/gameplay/solar/route.ts
- app/api/gameplay/notifications/subscribe/route.ts
- app/api/gameplay/notifications/reject/route.ts
- app/api/gameplay/anomalies/route.ts

Updated components:
- src/components/projects/(classifications)/PostForm.tsx
- src/components/projects/(classifications)/Annotating/useAnnotatorLogic.tsx
- src/components/scenes/deploy/Rover/RoverSection.tsx
- src/components/scenes/deploy/satellite/SatellitePosition.tsx
- src/components/scenes/deploy/satellite/SatelliteProgressBar.tsx
- src/components/scenes/deploy/satellite/satelliteSpiderScan.tsx
- src/components/tabs/SolarTab.tsx
- src/components/projects/Telescopes/DiskDetector.tsx
- src/components/projects/Telescopes/SuperWASP.tsx
- src/components/providers/NotificationSubscribeButton.tsx
- src/components/projects/Auto/Mars-Photos.tsx

Audit result:
- Remaining TSX mutation grep hits reduced to zero active writes (commented legacy line in `src/components/profile/setup/ProfileSetup.tsx` removed).
- `npx tsc --noEmit` passes.
- `npm run test:unit` passes.
- Full Cypress headless suite passes (`auth`, `navigation`, `planets`, `research`, `smoke-critical`, `user-flows`, `working-routes`).
<!-- SECTION:NOTES:END -->
