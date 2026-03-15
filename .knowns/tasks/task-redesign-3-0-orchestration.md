---
id: redesign-3-0
title: "Star Sailors 3.0 Redesign Orchestration"
status: in-progress
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
updatedAt: '2026-03-17T12:00:00Z'
timeSpent: 0
---

# Star Sailors 3.0 Redesign Orchestration

## Description
Master task for the 3.0 redesign. Transitions to a server-first, mobile-centric "Game Hub" architecture. `/apt` becomes acquisition-only. `/game` is the hub + dashboard (same thing). New users get a dedicated onboarding route.

## Key Decisions (Updated 2026-03-17 — round 2)
- `/apt` redirects authenticated users to `/game` server-side — no logged-in landing view
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
- [ ] **Phase 2: Landing Page Refactor (`/apt`)** (task-30-p2-landing-page)
    - [ ] Auth redirect (logged-in → `/game`)
    - [ ] Hero copy: explain the game
    - [ ] Remove social proof
    - [ ] Guest nav links
    - [ ] Remove session length indicators from cards
- [ ] **Phase 3: Auth Redirect + Dedicated Onboarding** (task-30-p3-logged-in-landing)
    - [ ] `/apt` server-side redirect for auth users
    - [ ] Create `/onboarding` route
    - [ ] Project selection → structure recommendation
    - [ ] Guided first deployment
- [ ] **Phase 4: Coral Fishtank in Hub** (task-30-p4-coral-teaser)
    - [ ] Remove coral from landing
    - [ ] Add CoralFishtank to game hub
- [ ] **Phase 5: Micro-Survey System** (task-30-p5-micro-surveys)
    - [ ] MicroSurvey component
    - [ ] Replace NPS popup
- [ ] **Phase 6: PostHog + Sentry** (task-30-p6-posthog-sentry)
    - [ ] Cross-game navigation tracking
    - [ ] Full event audit
    - [ ] Sentry error boundaries
- [ ] **Phase 7: Prisma-backed stats** (task-30-p7-prisma-stats)
- [ ] **Phase 8: Hub Layout + Radar Map** (task-30-p8-hub-layout)
    - [ ] No-scroll hub layout
    - [ ] Sector Radar as navigational map
    - [ ] Leaderboard
    - [ ] Profile header dropdown
- [ ] **Phase 9: Structure States + Guided Deploy + Coral + Referral**
    - [ ] task-30-p9-structure-visual-states
    - [ ] task-30-p9b-referral-growth
- [ ] **Phase 10: Living World Background** (task-30-p10-living-world-bg)
- [ ] **Phase 11: Intro Sequence + Onboarding Builds Hub + Viewport Zoom** (task-30-p11-intro-sequence)
- [ ] **Phase 12: Server Actions migration**
- [ ] **Phase 13: Performance audit + polish**

## Acceptance Criteria
- [ ] `/apt` is a Next.js 15+ Server Component with PPR
- [ ] Authenticated users redirected from `/apt` to `/game` server-side
- [ ] New sign-ups land on `/onboarding` with intro sequence + project selection + guided deploy
- [ ] Onboarding shows empty station that populates as choices are made
- [ ] Hero explains the game (not just curiosity-bait)
- [ ] Hub fits within 100dvh — no vertical scrolling
- [ ] Mission Brief always above fold on mobile
- [ ] Sector Radar = star map, navigational, hidden until first deployment
- [ ] Empty map replaced with "What to do today" + Add project prompt
- [ ] Structure cards show Standby (powered down) vs Active (ambient glow) states distinctly
- [ ] Incoming signals animate (data wave)
- [ ] Numbers count up on change (odometer)
- [ ] Persistent HUD strip always visible
- [ ] Structure colour system applied (telescope=teal, rover=amber, satellite=sky)
- [ ] Hub → viewport transition is zoom-in (not hard cut)
- [ ] Solar card has community glow, "Join Mission" CTA
- [ ] Coral fishtank in hub links to coral.starsailors.space
- [ ] Cross-game navigation tracked in PostHog
- [ ] Referral prominent in hub
- [ ] Leaderboard visible in hub
- [ ] Living world background: parallax + anomaly labels + community flyovers
- [ ] All mutations use Server Actions
- [ ] Micro-surveys replace NPS popup
