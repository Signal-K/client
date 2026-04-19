---
id: vh9j2c
title: 'Migrate deploy read paths to authenticated API routes'
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
createdAt: '2026-02-19T09:12:00.000Z'
updatedAt: '2026-02-19T09:18:00.000Z'
timeSpent: 15
---
# Migrate deploy read paths to authenticated API routes

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Move deployment status and awaiting-object read flows from client-side Supabase queries into authenticated API routes to reduce client complexity and centralize Supabase access.
Primary spec: specs/mechanics/deployment-spec
Primary spec path: .knowns/docs/specs/mechanics/deployment-spec.md
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Deployment status hook reads from API route
- [x] #2 Awaiting objects panel reads from API route
- [x] #3 Telescope viewport section reads from API route
- [x] #4 Rover deploy setup initialization reads from API route
- [x] #5 TypeScript checks pass after migration
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
- Spec reference: specs/mechanics/deployment-spec
Added app/api/gameplay/deploy/status/route.ts and app/api/gameplay/deploy/awaiting/route.ts. Updated src/hooks/useDeploymentStatus.ts, src/components/deployment/allLinked.tsx, and src/components/scenes/deploy/Telescope/TelescopeSection.tsx to fetch from API routes instead of direct client Supabase access. Added app/api/gameplay/deploy/rover/setup/route.ts and updated app/activity/deploy/roover/page.tsx to load rover deploy setup via API.
<!-- SECTION:NOTES:END -->


## Spec References

- specs/mechanics/deployment-spec
