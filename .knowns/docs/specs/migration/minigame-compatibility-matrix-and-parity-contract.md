---
title: Minigame compatibility matrix and parity contract
createdAt: '2026-02-19T08:20:35.019Z'
updatedAt: '2026-02-19T08:21:16.432Z'
description: >-
  Cross-referenced compatibility spec for citizen science projects/minigames,
  components/chapters, tests, and visual/behavior parity requirements during
  backend migration.
tags:
  - spec
  - migration
  - compatibility
  - qa
---
# Minigame Compatibility Matrix And Parity Contract

## Scope

This spec gates architecture migration work so all citizen-science projects/minigames keep identical user-visible behavior and visuals while backend access patterns change.

Migration rules for this phase:

- Standalone game/experiment mechanics: use API routes.
- Next.js-app-only mechanics/functionality: use Supabase SSR + server actions for writes.
- Server fetch by default.
- HTTP-only cookies for auth/session.
- Avoid new migration/RLS dependencies in this phase.

## No-Regression Contract

### Functional parity

- Classification creation, progression, stardust/research unlocks, discovery generation, and social interactions must remain behaviorally identical.
- Existing gating rules and prerequisites (e.g., NGTS access, extraction unlock dependencies) must not change.
- Existing data shape consumed by current UI components must remain backward compatible.

### Visual parity

- No intentional redesign in this phase.
- Existing layout hierarchy, component spacing, typography choices, colors, and iconography must remain unchanged.
- Existing animation cadence and transition timing must remain unchanged unless bug-fix only.

### Interaction parity

- Route entry points and navigation flow remain unchanged.
- Existing form states, loading states, error states, and success transitions must remain unchanged.
- Existing user copy/labels remain unchanged unless correcting bugs/typos.

## Citizen-Science Project Matrix

Reference chapters are from:

- `CITIZEN_SCIENCE_OVERVIEW.md`
- `STAR_SAILORS_USER_FLOWS.md`

### Telescope projects

1. Planet Hunters (TESS/NGTS)
Chapter refs: `3.1` in both docs
Classification types: `planet`, `superwasp-variable` (project-specific), NGTS gated by `ngtsAccess`
Primary components:
- `src/components/projects/Telescopes/Transiting.tsx`
- `src/components/projects/Telescopes/SuperWASP.tsx`
- `src/components/projects/Telescopes/NGTSTutorial.tsx`
- `src/components/projects/(classifications)/PostForm.tsx`
- `src/components/projects/(classifications)/Annotating/useAnnotatorLogic.tsx`
Routes/chapters:
- `app/structures/telescope/page.tsx`
- `app/viewports/solar/page.tsx` (supporting surfaces)
Mechanics touched:
- classification, research, stardust, deployment unlock dependencies, discovery
Current tests:
- cypress: `cypress/e2e/research.cy.ts`, `cypress/e2e/user-flows.cy.ts`, `cypress/e2e/smoke-critical.cy.ts`, `cypress/e2e/working-routes.cy.ts`
Coverage gap:
- no deterministic project-specific assertion for transit classification flow end-to-end

2. Daily Minor Planet
Chapter refs: `3.2`
Classification type: `telescope-minorPlanet`
Primary components:
- `src/components/projects/Telescopes/DailyMinorPlanet.tsx`
- `src/components/projects/Telescopes/ActiveAsteroids.tsx`
- `src/components/projects/(classifications)/PostForm.tsx`
Routes:
- `app/structures/telescope/page.tsx`
Mechanics touched:
- classification, stardust, discovery, anomaly-set progression
Current tests:
- broad route/user-flow coverage only
Coverage gap:
- no explicit asteroid classification regression test

3. Sunspots
Chapter refs: `3.3`
Classification type: `sunspot`
Primary components:
- `src/components/projects/Telescopes/Sunspots.tsx`
- `src/components/projects/Telescopes/Sunspots/SunspotShell.tsx`
- `src/components/projects/(classifications)/PostForm.tsx`
Routes:
- `app/viewports/solar/page.tsx`
- `app/leaderboards/sunspots/page.tsx`
Mechanics touched:
- classification, community counters, leaderboard surfaces
Current tests:
- broad navigation/smoke only
Coverage gap:
- no explicit cooldown/community counter contract test

4. Disk Detective
Chapter refs: `3.4`
Classification type: `DiskDetective`
Primary components:
- `src/components/projects/Telescopes/DiskDetector.tsx`
- `src/components/projects/(classifications)/PostForm.tsx`
Routes:
- `app/structures/telescope/page.tsx`
Mechanics touched:
- classification, interpretation payload shape, discovery rendering
Current tests:
- broad route/smoke only
Coverage gap:
- no payload-shape regression assertion for disk interpretation fields

### Satellite projects

1. Cloudspotting on Mars
Chapter refs: `4.1`
Classification types: `cloud`, `balloon-marsCloudShapes`
Primary components:
- `src/components/projects/Lidar/Clouds.tsx`
- `src/components/projects/Lidar/cloudspottingOnMars.tsx`
- `src/components/projects/Lidar/CloudspottingOnMarsShapes.tsx`
- `src/components/projects/(classifications)/PostForm.tsx`
- `src/components/projects/(classifications)/Annotating/useAnnotatorLogic.tsx`
Routes:
- `app/viewports/satellite/page.tsx`
- `app/setup/satellite/page.tsx`
Mechanics touched:
- classification, mineral deposit trigger path, discovery
Current tests:
- broad navigation/planets/user-flow
Coverage gap:
- no explicit cloud-shape to mineral-trigger regression test

2. Jovian Vortex Hunters (JVH)
Chapter refs: `4.2`
Classification type: `lidar-jovianVortexHunter`
Primary components:
- `src/components/projects/Lidar/JovianVortexHunter.tsx`
- `src/components/deployment/missions/structures/Meteorologists/JVH/JovianVortexHunters.tsx`
- `src/components/projects/(classifications)/PostForm.tsx`
Routes:
- `app/viewports/satellite/page.tsx`
Mechanics touched:
- classification, comments/votes assist mechanics, mineral/deposit related outcomes
Current tests:
- broad user-flow/navigation
Coverage gap:
- no explicit JVH classification + vote flow contract test

3. Planet Four (P4)
Chapter refs: `4.3`
Classification type: `satellite-planetFour`
Primary components:
- `src/components/projects/Satellite/PlanetFour.tsx`
- `src/components/deployment/missions/structures/Astronomers/SatellitePhotos/P4/PlanetFour.tsx`
- `src/components/projects/(classifications)/PostForm.tsx`
Routes:
- `app/viewports/satellite/page.tsx`
Mechanics touched:
- classification, p4 mineral gating, extraction dependency
Current tests:
- broad research/smoke/navigation
Coverage gap:
- no explicit p4Minerals gating + classification path regression test

### Rover projects

1. AI for Mars (AI4M)
Chapter refs: `5.1`
Classification type: `automaton-aiForMars`
Primary components:
- `src/components/projects/Auto/AI4Mars.tsx`
- `src/components/deployment/missions/structures/Astronomers/SatellitePhotos/AI4M/AIForMars.tsx`
- `src/components/projects/(classifications)/PostForm.tsx`
- `src/components/projects/(classifications)/Annotating/useAnnotatorLogic.tsx`
Routes:
- `app/viewports/roover/page.tsx`
- `app/activity/deploy/roover/page.tsx`
Mechanics touched:
- classification, mineral discovery trigger, rover waypoint/research dependencies
Current tests:
- broad user-flow/smoke only
Coverage gap:
- no explicit AI4M classification->deposit creation regression test

2. Rover photo classification surfaces
Chapter refs: rover chapter supporting flows
Classification type: `roverImg`
Primary components:
- `src/components/projects/Auto/Mars-Photos.tsx`
- `src/components/projects/(classifications)/PostForm.tsx`
Routes:
- `app/viewports/roover/page.tsx`
Mechanics touched:
- classification, media handling
Current tests:
- none specific
Coverage gap:
- missing explicit media upload + classify regression test

### Other citizen-science projects

1. Zoodex / Burrowing Owls
Chapter refs: `6.1`
Primary components:
- `src/components/classification/tools/image-classifier.tsx`
Routes:
- `app/scenes/uploads/page.tsx` (adjacent surface)
Mechanics touched:
- upload classification flow (project-specific)
Current tests:
- none specific
Coverage gap:
- missing project-specific e2e coverage

## Shared Infrastructure Components (Cross-Project)

- `src/components/projects/(classifications)/PostForm.tsx`
- `src/components/projects/(classifications)/Annotating/useAnnotatorLogic.tsx`
- `src/components/projects/(classifications)/NextScene.tsx`
- `src/components/classification/telescope/blocks/viewport/db-ops.tsx`
- `src/components/classification/telescope/telescope-viewport.tsx`
- `src/components/research/CompactResearchPanel.tsx`
- `src/hooks/useAchievements.ts`
- `src/hooks/useMilestones.ts`

Any migration touching these files must be validated across all projects listed in this spec.

## Test Cross-Reference

Current automated suites in-repo:

- Cypress e2e:
- `cypress/e2e/smoke-critical.cy.ts`
- `cypress/e2e/working-routes.cy.ts`
- `cypress/e2e/navigation.cy.ts`
- `cypress/e2e/planets.cy.ts`
- `cypress/e2e/research.cy.ts`
- `cypress/e2e/user-flows.cy.ts`
- `cypress/e2e/auth.cy.ts`

- Unit tests:
- `tests/unit/components/layout/MainHeader.test.tsx`
- `tests/unit/hooks/useNPSManagement.test.ts`
- `tests/unit/hooks/usePageData.test.ts`

Regression requirement for migration PRs:

- At minimum, route/smoke/research suites remain green.
- For each touched project mechanic, add or update at least one direct assertion path for its key write/read loop.

## Migration Validation Checklist (Required Before Merge)

1. Functional
- For each touched project, verify classification create/read loop completes and lands on expected follow-up views.
- Verify research gating behavior is unchanged for all touched features.
- Verify discovery/milestone/achievement counters match pre-migration behavior.

2. Visual
- Compare touched screens against pre-change screenshots for layout, typography, color, spacing, and iconography parity.
- Verify loading/empty/error states are visually unchanged.

3. Auth/session
- Confirm migrated flows use HTTP-only cookie auth via server-side Supabase in API routes/server actions.
- Confirm no migrated flow depends on `useSession`.

4. Data consistency
- Confirm payload shape written to `classifications` remains backward compatible with existing readers.
- Confirm no schema migration dependency was introduced.

## Change-Control Rule For Next Passes

Before modifying any project in this matrix:

- Update this spec with touched files/routes/tests.
- Add explicit parity assertions for that project in test scope.
- Only then apply architecture migration changes.

## Workflow for Organizing & Setting Up Anomalies

To supersede the sytizen repository, the following workflow has been established for organizing and setting up anomalies:

1. **Data Collection**:
   - Gather all anomaly-related data from the existing sytizen repository.
   - Ensure data integrity and consistency during migration.

2. **Data Transformation**:
   - Normalize data formats to align with the new schema.
   - Apply necessary transformations to ensure compatibility with the updated backend.

3. **Integration**:
   - Integrate the transformed data into the new system.
   - Validate the integration by running tests to ensure functional and visual parity.

4. **Documentation**:
   - Update the documentation to reflect the new workflow.
   - Include detailed steps for future reference and maintenance.

5. **Testing**:
   - Conduct thorough testing to ensure no regressions in functionality or visuals.
   - Address any issues identified during testing.

6. **Deployment**:
   - Deploy the updated system to production.
   - Monitor the system for any issues post-deployment and address them promptly.

This workflow ensures a smooth transition from the sytizen repository to the new system while maintaining the integrity and functionality of the anomalies setup.
