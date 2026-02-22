---
id: 3h2mqd
title: 'Migrate deploy mechanics write paths to API routes'
status: done
priority: high
labels:
  - architecture
  - api
  - deployment
specRefs:
  - "specs/mechanics/deployment-spec"
spec: "specs/mechanics/deployment-spec"
specPath: ".knowns/docs/specs/mechanics/deployment-spec.md"
specs:
  - "specs/mechanics/deployment-spec"
references:
  - "specs/mechanics/deployment-spec"
  - ".knowns/docs/specs/mechanics/deployment-spec.md"
createdAt: '2026-02-19T09:03:00.000Z'
updatedAt: '2026-02-19T09:03:00.000Z'
timeSpent: 14
---
# Migrate deploy mechanics write paths to API routes

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Move telescope, rover, and satellite deployment write operations from client-side Supabase calls into authenticated Next.js API routes while preserving gameplay parity.
Primary spec: specs/mechanics/deployment-spec
Primary spec path: .knowns/docs/specs/mechanics/deployment-spec.md
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Telescope deployment inserts are server-side via API
- [x] #2 Rover deployment inserts/routes writes are server-side via API
- [x] #3 Satellite deployment inserts are server-side via API
- [x] #4 Deploy pages continue to render and pass TypeScript checks
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
- Spec reference: specs/mechanics/deployment-spec
Added API routes at app/api/gameplay/deploy/telescope/route.ts, app/api/gameplay/deploy/rover/route.ts, and app/api/gameplay/deploy/satellite/route.ts. Rewired client handlers in TelescopeActions, DeploySatellite, and DeployRover page to POST to these routes. Added profile ensure route (app/api/gameplay/profile/ensure/route.ts) and switched activity deploy page profile creation to server-side route. Kept existing Supabase-backed behavior and added cache revalidation paths on write routes.
<!-- SECTION:NOTES:END -->


## Spec References

- specs/mechanics/deployment-spec
