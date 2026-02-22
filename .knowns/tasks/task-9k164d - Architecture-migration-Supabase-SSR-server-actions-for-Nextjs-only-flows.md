---
id: 9k164d
title: 'Architecture migration: Supabase SSR + server actions for Next.js-only flows'
status: done
priority: high
labels:
  - architecture
  - ssr
  - server-actions
specRefs:
  - "specs/migration/two-two-migration"
spec: "specs/migration/two-two-migration"
specPath: ".knowns/docs/specs/migration/two-two-migration.md"
specs:
  - "specs/migration/two-two-migration"
references:
  - "specs/migration/two-two-migration"
  - ".knowns/docs/specs/migration/two-two-migration.md"
createdAt: '2026-02-19T08:12:39.891Z'
updatedAt: '2026-02-19T09:58:19Z'
timeSpent: 286
---
# Architecture migration: Supabase SSR + server actions for Next.js-only flows

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Replace auth-helpers-react session usage in migrated Next.js app-only flows with server-side Supabase + server actions using HTTP-only cookies.
Primary spec: specs/migration/two-two-migration
Primary spec path: .knowns/docs/specs/migration/two-two-migration.md
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Migrated flow removes @supabase/auth-helpers-react and useSession
- [x] #2 Server actions perform writes for migrated flow
- [x] #3 Cache revalidation implemented for migrated writes
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Added Supabase SSR server client utility via @supabase/ssr and replaced route helper to use cookie-based SSR auth. Removed useSession from migrated hooks/components: useMilestones, useAchievements, CompactResearchPanel, SkillTreeSection, SkillTreeView, TelescopeViewport.

Blocking step added: create compatibility specsheet before further migration changes.

Added specsheet: specs/migration/minigame-compatibility-matrix-and-parity-contract. Migrated primary social writes to server actions in src/components/social/actions.ts and removed useSession/useSupabaseClient from SimplePostSingle and CommentForm.

Profile/setup batch migrated from auth-helpers to SSR/server actions: src/components/profile/setup/ProfileSetup.tsx, src/components/profile/setup/FinishProfile.tsx, src/components/profile/setup/Referrals.tsx, src/components/profile/setup/GettingStartedViewport.tsx, app/research/page.tsx. Added server actions file src/components/profile/setup/actions.ts and API routes app/api/gameplay/profile/getting-started/route.ts + app/api/gameplay/profile/referral-status/route.ts. Writes now server-side with revalidation.

Deploy/profile follow-up batch migrated core deploy write operations into authenticated API routes: app/api/gameplay/deploy/telescope/route.ts, app/api/gameplay/deploy/rover/route.ts, app/api/gameplay/deploy/satellite/route.ts, and app/api/gameplay/profile/ensure/route.ts. Updated src/components/scenes/deploy/Telescope/TelescopeActions.ts, src/components/scenes/deploy/TelescopeViewportRange.tsx, app/activity/deploy/roover/page.tsx, src/components/scenes/deploy/satellite/DeploySatellite.tsx, app/activity/deploy/page.tsx, and app/viewports/satellite/deploy/page.tsx to use server routes for write paths.

Deploy read-flow follow-up migrated status/awaiting/telescope viewport reads to API routes. Added app/api/gameplay/deploy/status/route.ts and app/api/gameplay/deploy/awaiting/route.ts; updated src/hooks/useDeploymentStatus.ts, src/components/deployment/allLinked.tsx, and src/components/scenes/deploy/Telescope/TelescopeSection.tsx to fetch server-authenticated data.

Rover deploy setup initialization migrated off client Supabase reads via app/api/gameplay/deploy/rover/setup/route.ts and app/activity/deploy/roover/page.tsx now loading via server-authenticated API fetch.

Shared layout/header/nav partial migration away from auth-helper hooks: added browser auth utility/hook (lib/supabase/browser.ts, src/hooks/useAuthUser.ts), moved alerts/profile-code reads to API routes (app/api/gameplay/alerts/route.ts, app/api/gameplay/profile/code/route.ts), and updated MainHeader, Tes, AlertsDropdown, and AnonymousUserPrompt to avoid useSession/useSupabaseClient.

Follow-up auth-helper removal batch completed for additional high-impact surfaces: MissionDropdown now uses server-side weekly progress API, auth pages/components (LoginModal, EnhancedAuth, ConvertAnonymousAccount) use browser auth utility instead of auth-helper hooks, and top-level app routing pages (app/page.tsx, app/game/page.tsx) now use useAuthUser rather than session context hooks.

Continued auth-helper removal for entry and header surfaces: app/auth/page.tsx, app/auth/register/page.tsx, app/activity/deploy/page.tsx, app/viewports/satellite/deploy/page.tsx, app/activity/deploy/roover/page.tsx, src/components/game/GameHeader.tsx, and src/components/layout/Navbar.tsx migrated to use useAuthUser/browser client.

Completed import-level auth-helper retirement across app/src by introducing src/lib/auth/session-context.tsx compatibility hooks and replacing all @supabase/auth-helpers-react imports with local equivalents; also removed @supabase/auth-helpers-nextjs createPagesBrowserClient usage from layout providers.

Finalization batch updated root hooks/tests and middleware off auth-helpers package APIs: hooks/usePageData.ts, hooks/useNPSManagement.ts, tests/unit/hooks/useNPSManagement.test.ts, and middleware.ts now use local auth compatibility / @supabase/ssr. Removed deprecated auth-helper direct dependencies from package.json.

Additional write-path modernization: extraction completion and NPS survey submission moved to authenticated API routes (app/api/gameplay/extraction/[id]/route.ts and app/api/gameplay/nps/route.ts), with client components updated accordingly.

Continued write-path migration for deploy/social surveyor surfaces: added API routes for satellite quick deploy, solar mission participation, and surveyor comment creation; updated ActivityHeader, SolarHealth, SurveyorPostCard, and CalculatorSurveyor to submit writes server-side.

Follow-up sweep migrated additional client mutation paths to authenticated API routes: social votes/comments for PostSingle/TestPostCard/PostWithGen, planet preferred-comment mutation, zoodex upload+entry persistence, and skill unlock writes. Added route handlers at app/api/gameplay/social/comments, app/api/gameplay/social/votes (POST), app/api/gameplay/planet/comments/preferred, app/api/gameplay/zoodex/entries, app/api/gameplay/skills/unlock, and app/api/gameplay/classifications/configuration. Updated PHVote/DMPVote/JVHVote/CoMVote/AI4MVote/P4Vote and cloud/planet configuration save surfaces to use the shared configuration API write path.

Next migration wave completed for remaining direct client mutations in active components: moved rover return-home, satellite unlock/recall cleanup, satellite planet-survey classification submission, PostForm/Annotator inventory+linked-anomaly+mineral-deposit+classification-point writes, SolarTab event/probe/classification writes, notification subscription/rejection writes, and Mars photo anomaly/mineral creation to API routes. Added new API handlers under app/api/gameplay for linked-anomalies, mineral-deposits (+bulk), inventory/use, profile/classification-points, deploy/rover/return, solar actions, notifications subscribe/reject, and anomalies writes. Write-audit now shows no active `.insert/.update/.delete/.upsert` calls in TSX components besides one commented line in ProfileSetup.

Stability/testing closure: disabled service worker registration in Cypress/test runs within RootLayoutClient, added explicit `/planets/edit` route to avoid dynamic-id fallback instability, cleaned leftover migration artifacts (`DMPVote` stray literals and ProfileSetup commented insert block), and re-ran full validation. Final status: `npx tsc --noEmit`, `npm run test:unit`, and full Cypress headless suite all pass.
<!-- SECTION:NOTES:END -->


## Spec References

- specs/migration/two-two-migration
