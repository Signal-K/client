---
id: task-30-p9b-referral-growth
title: "3.0 Phase 9b: Referral System as Primary Growth Mechanic"
status: completed
priority: high
phase: "3.0-p9"
specRefs:
  - "specs/redesign/3-0-unified-web-client"
createdAt: '2026-03-17T00:00:00Z'
updatedAt: '2026-03-21T00:00:00Z'
---

# 3.0 Phase 9b: Referral System as Primary Growth Mechanic

## Goal
Referral and user growth is the primary goal for version 3.0. The Agency Network card already shows a referral code and invite link — this needs to be promoted and made more prominent in the hub.

## Confirmed Decisions
- Referral = primary growth mechanic for 3.0
- Agency Network card is the current home for referral code + invite link
- Cross-game navigation must fire PostHog events (which game did they go to, from where)
- Referral tracking: who referred whom, which source (landing, experiment, direct) brought them in

## Tasks

### Audit Current Referral System
- [x] Review existing referral code generation and tracking (`/ecosystem/` route, Agency Network card)
- [x] Check if referral attribution is wired end-to-end (sign-up with referral code → tracked in DB)
- [ ] Identify gaps: what's not tracked that should be

### Hub Promotion
- [x] Make Agency Network card / referral section more prominent in hub layout
- [x] Add copy that frames referral as part of the game narrative ("Recruit new sailors")
- [x] Consider: referral count shown as a stat ("X sailors recruited")

### Cross-Game Navigation Tracking
- [ ] Every link that navigates user to a different game/experiment fires PostHog `cross_game_navigation` event
  - Props: `destination`, `source_section`, `user_id`
- [ ] Destinations to track: Rocket Missions (Godot), Saily, Click-A-Coral (`coral.starsailors.space`), any future experiments

### Landing → Sign-Up Referral Attribution
- [x] Ensure referral code in URL params is preserved through `/apt` → `/auth` → sign-up flow
- [ ] Store referral source in user profile on sign-up

## Acceptance Criteria
- Referral code visible and actionable in the hub
- Referral attribution tracked end-to-end (referrer → referred user relationship stored)
- All cross-game navigation fires PostHog events with destination prop
- PostHog dashboard shows referral funnel clearly
