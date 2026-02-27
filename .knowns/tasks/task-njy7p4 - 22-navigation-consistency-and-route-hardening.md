---
id: njy7p4
title: "2.2 navigation consistency and route hardening"
status: completed
priority: high
labels:
  - migration-2.2
  - navigation
  - routing
  - qa
specRefs:
  - "specs/migration/two-two-migration"
spec: "specs/migration/two-two-migration"
specPath: ".knowns/docs/specs/migration/two-two-migration.md"
createdAt: '2026-02-26T18:25:00Z'
updatedAt: '2026-02-26T22:45:00Z'
timeSpent: 0
---

# 2.2 navigation consistency and route hardening

## Description

Normalize nav targets across legacy and modern headers so key links always resolve and shared navigation language remains consistent across pages.

## Acceptance Criteria

- [x] #1 Legacy navbar links point to valid pages
- [x] #2 Missing route indexes for linked sections are added
- [x] #3 In-app route smoke test confirms no obvious dead links in top-level navs

## Implementation Notes

- Updated legacy nav targets in:
  - `src/components/layout/Navbar.tsx`
  - `src/components/layout/Tes.tsx`
- Added route compatibility pages:
  - `src/app/scenes/desert/page.tsx`
  - `src/app/scenes/ocean/page.tsx`
- Added missing leaderboard index page:
  - `src/app/leaderboards/page.tsx`
- Remaining work:
  - Completed broader static link audit across `src` internal hrefs/router pushes.
  - Current static audit result: `MISSING_COUNT 0` (excluding `/assets` and `/api` paths).
  - Middleware refactored to cookie-based auth guard for `/game` routes only, removing `@supabase/ssr` import from middleware and eliminating build-time Edge runtime warnings.
  - Unified setup routes (`/setup/telescope`, `/setup/satellite`, `/setup/rover`, `/setup/solar`) onto the shared world shell by upgrading `SetupScaffold` to `MainHeader` + `TelescopeBackground`.
  - Added rover URL compatibility aliases to prevent broken links from variant spellings:
    - `src/app/viewports/rover/page.tsx` -> `/viewports/roover`
    - `src/app/activity/deploy/rover/page.tsx` -> `/activity/deploy/roover`
  - Fixed legacy navbar invalid nested anchors for stable menu behavior and valid DOM in tests.
- Validation:
  - `yarn lint` passes.
  - `npm run test:unit` passes (`123` files, `1024` tests).
- Legacy `Tes` navbar hardened to avoid nested interactive/anchor structures and to align menu destinations with modern surfaces (`/research`, `/leaderboards`, `/ecosystem`).
- Migrated key deployment/viewport routes from legacy navbar shell to shared world shell (`MainHeader` + `TelescopeBackground`) for consistency and fewer route-specific layout issues:
  - `src/app/activity/deploy/page.tsx`
  - `src/app/viewports/roover/page.tsx`
  - `src/app/viewports/solar/page.tsx`
  - `src/app/viewports/satellite/page.tsx`
  - `src/app/viewports/satellite/deploy/page.tsx`
- Added telescope compatibility aliases to absorb stale links:
  - `src/app/viewports/telescope/page.tsx` -> `/structures/telescope`
  - `src/app/activity/deploy/telescope/page.tsx` -> `/activity/deploy`
- Added legacy project-path compatibility layer:
  - `src/app/app/projects/[project]/page.tsx` redirects old `/app/projects/*` links to canonical structure routes.
  - `src/app/app/projects/page.tsx` redirects `/app/projects` to `/game`.
- Updated achievement route metadata to point to canonical telescope page:
  - `src/types/achievement.ts` classification routes now point to canonical `/structures/*` and `/viewports/*` paths.
- Migrated additional high-use pages to the shared shell:
  - `src/app/structures/telescope/page.tsx`
  - `src/app/posts/[id]/page.tsx`
- Migrated structure project routes from legacy navbar shell to shared shell:
  - `src/app/structures/balloon/page.tsx`
  - `src/app/structures/balloon/[project]/page.tsx`
  - `src/app/structures/telescope/[project]/page.tsx`
- Migrated additional legacy structure surfaces to shared shell:
  - `src/app/structures/cameras/page.tsx`
  - `src/app/structures/seiscam/page.tsx`
- Fixed broken navigation in balloon structure root:
  - "Research" CTA now routes directly to `/research` instead of invalid `/structures/balloon/research`.
- Fixed dead-end links in seiscam structure root:
  - "Research" CTA now routes to `/research`.
  - mission CTAs now point to active structure mission routes (`/structures/balloon/landmarks`, `/structures/balloon/surface`) instead of missing `/structures/seiscam/*` pages.
- Additional validation:
  - `yarn lint` passes.
  - `npm run test:unit` passes (`126` files, `1032` tests).
- Migrated remaining dynamic mission/detail pages and high-friction planet routes to shared shell:
  - `src/app/posts/surveyor/[id]/page.tsx`
  - `src/app/planets/[id]/page.tsx`
  - `src/app/planets/paint/[id]/page.tsx`
  - `src/app/structures/seiscam/[project]/[id]/[mission]/page.tsx`
  - `src/app/structures/telescope/[project]/[id]/[mission]/page.tsx`
  - `src/app/structures/balloon/[project]/[id]/[mission]/page.tsx`
- Updated discovery summary shell for consistent navigation treatment:
  - `src/components/projects/(classifications)/NextScene.tsx`
- Validation:
  - `yarn lint` passes.
  - `npm run test:unit` passes (`126` files, `1032` tests).
