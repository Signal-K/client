---
id: n51zqx
title: 'Architecture migration: use client audit and server-first fetch'
status: done
priority: medium
labels:
  - architecture
  - cleanup
specRefs:
  - "specs/mechanics/classification-spec"
spec: "specs/mechanics/classification-spec"
specPath: ".knowns/docs/specs/mechanics/classification-spec.md"
specs:
  - "specs/mechanics/classification-spec"
references:
  - "specs/mechanics/classification-spec"
  - ".knowns/docs/specs/mechanics/classification-spec.md"
createdAt: '2026-02-19T08:12:40.078Z'
updatedAt: '2026-02-19T09:58:19Z'
timeSpent: 0
---
# Architecture migration: use client audit and server-first fetch

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Audit migrated mechanic surfaces for unnecessary use client and push server fetch by default.
Primary spec: specs/mechanics/classification-spec
Primary spec path: .knowns/docs/specs/mechanics/classification-spec.md
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Migrated files remove unnecessary use client where feasible
- [x] #2 Data fetching for migrated surfaces defaults to server/API
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
- Spec reference: specs/mechanics/classification-spec
Audit started. Current hotspot list for client-first mutation/fetch cleanup:
- `src/core/context/ActivePlanet.tsx` still performs direct client updates.
- `src/utils/mineralDepositCreation.ts` still performs direct insert path.

Follow-up will migrate these remaining client mutation surfaces to existing authenticated API routes and then reassess `use client` usage for components that become data-thin after the migration.

Progress update:
- Added server-first active planet endpoint `app/api/gameplay/active-planet/route.ts` (GET/POST).
- Migrated `src/core/context/ActivePlanet.tsx` off direct profile/anomaly/classification Supabase client queries to authenticated API fetches.
- Migrated `src/utils/mineralDepositCreation.ts` deposit creation write off direct client insert to `/api/gameplay/mineral-deposits`.

Validation: `npx tsc --noEmit` passes.

Audit outcome on `use client`:
- Active migration targets remain client components due interactive state/context needs.
- Unnecessary client-side Supabase mutation/fetch paths in audited hotspots were removed in favor of authenticated API routes.
<!-- SECTION:NOTES:END -->


## Spec References

- specs/mechanics/classification-spec
