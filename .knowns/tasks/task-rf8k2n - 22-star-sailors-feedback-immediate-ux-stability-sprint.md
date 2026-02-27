---
id: rf8k2n
title: "2.2 star sailors feedback immediate UX and stability sprint"
status: in_progress
priority: high
labels:
  - migration-2.2
  - ux
  - stability
  - feedback
specRefs:
  - "specs/migration/two-two-migration"
spec: "specs/migration/two-two-migration"
specPath: ".knowns/docs/specs/migration/two-two-migration.md"
references:
  - ".knowns/docs/specs/migration/two-two-survey-audit-and-ops.md"
  - ".knowns/reports/posthog/survey-monitor-2026-02-22T05-32-31-136Z.json"
createdAt: '2026-02-26T18:25:00Z'
updatedAt: '2026-02-26T23:18:00Z'
timeSpent: 0
---

# 2.2 star sailors feedback immediate UX and stability sprint

## Description

Ship high-impact quality improvements from Star Sailors feedback themes: responsive usability, route reliability, clear progression surfaces, and stronger in-game referral visibility.

## Acceptance Criteria

- [x] #1 Broken/high-friction core routes are fixed or redirected
- [x] #2 Achievement and progression UI is usable on mobile and keyboard accessible
- [x] #3 Referral loop is visible in the main gameplay dashboard
- [x] #4 Regression check notes are added after implementation

## Implementation Notes

- Working baseline: survey activity report available, full open-text responses not exported in repo.
- Immediate scope intentionally focuses on web client stability and near-term conversion improvements.
- Completed in this pass:
  - Added `/leaderboards` index route to prevent dead-end links.
  - Added legacy compatibility redirects:
    - `/scenes/desert` -> `/setup/rover`
    - `/scenes/ocean` -> `/setup/satellite`
    - `/scenes/milestones` -> `/game`
  - Added gameplay referral promotion card (`ReferralBoostCard`) to `/game`.
  - Hardened referral submission server action against self/duplicate/invalid codes.
  - Improved achievement modal accessibility/responsiveness (Escape handling, dialog semantics, mobile-safe modal layout).
  - Replaced achievement badge `foreignObject` icon rendering with robust HTML/CSS rendering.
  - Upgraded mission/structure cards with stronger world-like visual treatment.
  - Refreshed referral panel UI in research screen with clearer hierarchy and share action.
  - Updated account page to use the same world-background + `MainHeader` shell as other primary surfaces.
  - Added full static route audit and resolved remaining missing route (`/scenes/milestones` redirect).
  - Runtime validation:
    - `yarn build` passes.
    - `npm run test:unit` passes (125 files passed, 1 skipped).
  - Added referral activation mission prompt in `/game` for non-referred users with analytics and CTA to referral console.
  - `yarn lint` passed.
  - Fixed hook-order bug in `inventory-viewport` by ensuring data-fetch hooks run before early auth-return branch.
  - Rebuilt `/leaderboards` index into full world-shell experience (`MainHeader` + space background + action cards).
  - Fixed invalid nested anchor markup in legacy `Navbar` menu entries for more reliable click/navigation behavior.
  - Added explicit referral CTA in `MainHeader` (`Invite Crew`) and a dedicated `Referral Program` menu item.
  - Upgraded setup route shell consistency by migrating `SetupScaffold` from legacy navbar to shared `MainHeader` + starfield background.
  - Added rover alias routes for typo/variant stability:
    - `/viewports/rover` -> `/viewports/roover`
    - `/activity/deploy/rover` -> `/activity/deploy/roover`
  - Improved referral input UX on `/research` for small screens (stacked form controls, stronger card contrast, safer widths).
  - Added referral milestone tiers and next-goal progress visualization to both dashboard and referral panel.
  - Added in-game ecosystem expansion panel and dedicated `/ecosystem` route to make web-to-Godot roadmap discoverable in-product.
  - Improved achievements modal usability on small screens:
    - safer viewport-height modal bounds
    - clearer guidance callout
    - badge grids that degrade to single-column on narrow widths
    - improved detail drawer max-height behavior
  - Added unit coverage for achievements modal interactions and portal rendering:
    - `tests/unit/components/discovery/achievements/AchievementsModal.test.tsx`
  - Improved research panel responsiveness:
    - mobile-safe stardust header layout
    - wrapped cost chips
    - denser tab trigger sizing for narrow widths
    - section/card spacing refinements for smaller devices
  - Hardened legacy `Tes` navbar interactions:
    - removed legacy nested anchor patterns
    - normalized account dropdown links to current key routes
    - improved stability for routes still using legacy navbar wrapper
  - Migrated high-traffic deploy/viewport pages to the shared game shell to reduce cross-route UI drift and hidden-content issues:
    - `/activity/deploy`
    - `/viewports/roover`
    - `/viewports/solar`
    - `/viewports/satellite`
    - `/viewports/satellite/deploy`
  - Added telescope route compatibility redirects:
    - `/viewports/telescope` -> `/structures/telescope`
    - `/activity/deploy/telescope` -> `/activity/deploy`
  - Added legacy `/app/projects/*` compatibility redirects to canonical structure project routes and updated achievement route metadata to canonical paths.
  - Updated `/structures/telescope` and `/posts/[id]` pages to the shared world shell (`MainHeader` + telescope background) for consistency.
  - Updated `/structures/balloon`, `/structures/balloon/[project]`, and `/structures/telescope/[project]` to shared shell for cross-route consistency.
  - Fixed `/structures/balloon` "Research" CTA routing bug (now routes to `/research`).
  - Updated `/structures/cameras` and `/structures/seiscam` to shared shell for consistency.
  - Fixed `/structures/seiscam` dead-end CTA paths by routing to active mission surfaces and `/research`.
  - Added unit tests for `AchievementsModal` portal and interaction behavior.
  - Migrated remaining mission and planet-heavy surfaces from legacy navbar shell to shared `MainHeader` shell for immediate UX consistency:
    - `/posts/surveyor/[id]`
    - `/planets/[id]`
    - `/planets/paint/[id]`
    - `/structures/seiscam/[project]/[id]/[mission]`
    - `/structures/telescope/[project]/[id]/[mission]`
    - `/structures/balloon/[project]/[id]/[mission]`
  - Updated discovery summary page shell (`NextScene`) to shared world header treatment for consistent nav and route behavior.
  - Added dedicated referral command-center route (`/referrals`) and rewired main referral CTAs to it for stronger growth visibility:
    - header `Invite Crew`
    - header `Referral Program` menu item
    - game referral mission prompt open action
    - leaderboard referral CTA
  - Fixed production build blocker on `/research` by wrapping `useSearchParams` usage in a `Suspense` boundary.
  - Added game-native PostHog micro-surveys for mechanic/playthrough feedback:
    - telescope debrief and rover debrief on `/game`
    - ecosystem/minigame debrief on `/ecosystem`
    - one-time per user/survey dedup via local storage
    - session token propagation via `starsailors_session_token` super property and response payload fields
  - Added PostHog dashboard automation for micro-survey telemetry:
    - `scripts/posthog/create_mechanic_surveys_dashboard.cjs`
    - `scripts/posthog/create_mechanic_surveys_dashboard.sh`
    - dashboard created in PostHog: `https://us.posthog.com/project/199773/dashboard/1312055`
  - Added native macOS menu-bar widget app scaffold for survey pulse telemetry:
    - `apps/mac-widget/StarSailorsPulse/*`
    - generated Xcode project via `xcodegen`
    - expanded app to show both mechanic surveys and standard PostHog surveys
    - added custom app icon asset
    - added WidgetKit extension and signed local install
    - widget registration confirmed via `pluginkit` (`com.starsailors.pulse.widget`)
  - Runtime validation:
    - `yarn lint` passes.
    - `npm run test:unit` passes (`126` files, `1032` tests).
    - `yarn build` passes.
    - `npx vitest run tests/unit/components/layout/Navbar.test.tsx` passes.
    - `npx vitest run tests/unit/components/layout/MainHeader.test.tsx` passes.
