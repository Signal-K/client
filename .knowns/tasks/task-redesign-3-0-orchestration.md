---
id: redesign-3-0
title: "Star Sailors 3.0 Redesign Orchestration"
status: completed
priority: high
labels:
  - redesign
  - ux
  - architecture
  - mobile-first
specRefs:
  - "specs/redesign/3-0-unified-web-client"
spec: "specs/redesign/3-0-unified-web-client"
specPath: ".knowns/docs/specs/redesign/3-0-unified-web-client.md"
createdAt: '2026-03-15T12:00:00Z'
updatedAt: '2026-03-21T13:10:00Z'
timeSpent: 0
---

# Star Sailors 3.0 Redesign Orchestration

## Description
Master task for the 3.0 redesign. Transitions to a server-first, mobile-centric "Game Hub" architecture. `/` is now the acquisition landing route, `/apt` only redirects to `/`, and `/game` is the hub + dashboard (same thing). New users get a dedicated onboarding route.

## Key Decisions (Updated 2026-03-17 — round 2)
- `/` redirects authenticated users to `/game` server-side — no logged-in landing view
- `/game` IS the hub AND the dashboard — they are the same thing
- New sign-ups land on `/onboarding` (dedicated route), not `/game` directly
- Project selection drives which structure to deploy first (not always Telescope)
- No social proof / Active Sailors count on landing page
- Hero must explain the game (what/how/why), not just be curiosity bait
- Guest nav: "Full Guide" + "Games Ecosystem" links
- No session length indicators on structure cards (never implemented)
- Sector Radar = navigational map, hidden until first deployment
- Mission Brief Card always above fold on mobile
- No vertical scrolling on main hub view
- Profile/stardust/level in header dropdown
- Referral = primary growth mechanic for 3.0
- Leaderboard in hub
- Sound design: deferred to sprint 7+ (≈ 2026-04-28)
- Power-user UI modes (0/1-5/many): deferred to sprint 7+
- Coral: fishtank in hub → links to coral.starsailors.space (not on landing)
- Staggered section reveals (not grouped)
- Signals = structure detecting; Anomalies = awaiting investigation; Discoveries = confirmed finds
- **Glass-morphism confirmed** as primary card aesthetic
- **Structure colour ownership:** Telescope=teal, Rover=amber, Satellite=sky (applies everywhere)
- **Standby = powered down** (greyscale/cold, not just dim)
- **Active = ambient glow** (soft breathing, not aggressive pulsing)
- **Incoming signals animate** (data wave / scan line)
- **Numbers count up** (odometer style) on change
- **Persistent HUD strip** with signals/anomaly counts (2–3 metrics, always visible)
- **Sector Radar = star map** (zone of space, zoomable), not concentric rings
- **Empty map state** = "What do you want to do today?" prompt + Add project button
- **Hub perspective** = operator inside station looking out (enclosed, warm)
- **Structures and rovers have personalities** (expressed in copy and idle animations)
- **Viewport transitions = zoom-in** (Crashlands model, hub is home)
- **Solar = community glow**, same area of map, always joinable
- **Intro sequence** for new users (station powers up, brief)
- **Onboarding = empty station builds itself** as choices are made
- **Living world background** = parallax + classified anomaly labels + community flyovers
- **Experiment 1** (Planet Hunters standalone Godot game) is separate — integration tracked in specs/experiment-1

## Sub-tasks
- [x] **Phase 1: Architecture & Design Tokens** — COMPLETE
    - [x] Audit existing `/apt` and login flows
    - [x] Update `tailwind.config.ts` with 3.0 theme
    - [ ] Visual QA of dark/light mode tokens
- [x] **Phase 2: Landing Page Refactor (`/`)** (task-30-p2-landing-page) — COMPLETE
    - [x] Auth redirect (logged-in → `/game`)
    - [x] Hero copy: explain the game
    - [x] Remove social proof
    - [x] Guest nav links
    - [x] Remove session length indicators from cards
- [x] **Phase 3: Auth Redirect + Dedicated Onboarding** (task-30-p3-logged-in-landing) — COMPLETE
    - [x] `/apt` server-side redirect for auth users
    - [x] Create `/onboarding` route
    - [x] Project selection → structure recommendation
    - [x] Guided first deployment
    - [x] PostHog events wired
- [x] **Phase 4: Coral Fishtank in Hub** (task-30-p4-coral-teaser) — COMPLETE
    - [x] Remove coral from landing
    - [x] Add CoralFishtank to game hub
- [x] **Phase 5: Micro-Survey System** (task-30-p5-micro-surveys) — COMPLETE
    - [x] MicroSurvey component (MechanicPulseSurvey)
    - [x] Replace NPS popup
    - [x] PostHog events wired
- [x] **Phase 6: PostHog + Sentry** (task-30-p6-posthog-sentry) — COMPLETE (core events)
    - [x] Cross-game navigation tracking
    - [x] Landing page event audit (data-track delegation)
    - [x] Hub events: game_hub_viewed, structure_tab_switched, apt_logged_in_redirect
    - [x] Auth events: login_completed
    - [x] Onboarding events: started/project_selected/completed
    - [x] ErrorBoundary wrapping game tabs
    - [x] classification_submitted / structure_deployed events
- [x] **Phase 7: Prisma-backed stats** (task-30-p7-prisma-stats) — COMPLETE
- [x] **Phase 8: Hub Layout + Radar Map** (task-30-p8-hub-layout) — COMPLETE
    - [x] No-scroll hub layout (100dvh, overflow-hidden)
    - [x] Mission Brief always above fold
    - [x] Sector Radar hidden until first deployment, empty state prompt
    - [x] Structure cards as primary navigation (tap → viewport)
    - [x] Persistent HUD strip (signals/anomalies/classifications, odometer animation)
    - [x] Add project button
    - [x] Leaderboard (HubLeaderboard inline component)
    - [x] Profile header dropdown (already in CommandHeader)
- [x] **Phase 9: Structure States + Guided Deploy + Coral + Referral** — COMPLETE
    - [x] task-30-p9-structure-visual-states: StructureCard with standby/active/incoming states, scan-line animation, personality copy, Solar community glow, GuidedDeployOverlay
    - [x] task-30-p9b-referral-growth: Agency Network promoted to top of right column, referral attribution already wired end-to-end (FinishProfile + research page)
- [x] **Phase 10: Living World Background** (task-30-p10-living-world-bg) — COMPLETE: StarField (3-layer CSS), AnomalyLabels (tappable), CommunityVehicles (60s poll + tooltip), PersonalStructures (orbit/crawl/sweep), LivingWorldBg compositor, /api/community-activity route
- [x] **Phase 11: Intro Sequence + Onboarding Builds Hub + Viewport Zoom** (task-30-p11-intro-sequence) — COMPLETE: IntroSequence (CSS-only, 3 phases, skip, one-time via intro-seen TutorialId), OnboardingSchematic (empty star map, structure animates in on project select), viewport zoom-in/out via framer-motion scale transitions
- [x] **Phase 12: Server Actions migration** — COMPLETE: `classification_submitted` PostHog event added to both submit paths in `useAnnotatorLogic`; `structure_deployed` event added to telescope (`TelescopeViewportRange`), satellite (`DeploySatellite`), and rover (`deploy/roover/page`) deploy call sites. All write paths already used server actions — no new migrations needed.
- [x] **Phase 13: Performance audit + polish** — COMPLETE: deferred 5 heavy right-column/overlay components to `dynamic()` imports (AgencyNetworkCard, CoralFishtank, HubLeaderboard, GuidedDeployOverlay, LivingWorldBg); CommunityVehicles polling pauses on `visibilitychange`; OdometerNumber fixed-width `min-w-[2ch]` prevents layout shift; `as any` TutorialId casts replaced with typed `as TutorialId`; `TutorialId` import added to GameClient

## Acceptance Criteria
- [x] `/` is a Next.js 15+ Server Component with PPR
- [x] Authenticated users redirected from `/` to `/game` server-side
- [x] New sign-ups land on `/onboarding` with intro sequence + project selection + guided deploy
- [x] Onboarding shows empty station that populates as choices are made
- [x] Hero explains the game (not just curiosity-bait)
- [x] Hub fits within 100dvh — no vertical scrolling
- [x] Mission Brief always above fold on mobile
- [x] Sector Radar = star map, navigational, hidden until first deployment
- [x] Empty map replaced with "What to do today" + Add project prompt
- [x] Structure cards show Standby (powered down) vs Active (ambient glow) states distinctly
- [x] Incoming signals animate (data wave)
- [x] Numbers count up on change (odometer)
- [x] Persistent HUD strip always visible
- [x] Structure colour system applied (telescope=teal, rover=amber, satellite=sky)
- [x] Hub → viewport transition is zoom-in (not hard cut)
- [x] Solar card has community glow, "Join Mission" CTA
- [x] Coral fishtank in hub links to coral.starsailors.space
- [x] Cross-game navigation tracked in PostHog
- [x] Referral prominent in hub
- [x] Leaderboard visible in hub
- [x] Living world background: parallax + anomaly labels + community flyovers
- [x] All mutations use Server Actions
- [x] Micro-surveys replace NPS popup
