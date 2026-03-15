---
id: task-30-p8-hub-layout
title: "3.0 Phase 8: Hub Layout Constraints, Star Map & HUD Strip"
status: todo
priority: high
phase: "3.0-p8"
specRefs:
  - "specs/redesign/3-0-unified-web-client"
createdAt: '2026-03-17T00:00:00Z'
updatedAt: '2026-03-17T00:00:00Z'
---

# 3.0 Phase 8: Hub Layout Constraints, Star Map & HUD Strip

## Goal
The game hub (`/game`) must fit all primary content within the viewport — no vertical scrolling. Sector Radar becomes a navigational star map. A persistent HUD strip shows live signal/anomaly data. Structure cards are the primary navigation path.

## Confirmed Decisions
- **No vertical scrolling** on main hub view — everything within 100dvh
- **Mission Brief Card** always above fold on mobile
- **Sector Radar = star map (zone of space):** not concentric rings, not a station schematic
  - Users may have hundreds of planets — concentric rings don't scale
  - Tap structure on map → navigate to its viewport or deploy route
  - Zoom in on a location → secondary detail view
  - Structures animate on map: satellite orbits, rover crawls, telescope sweeps (subtly)
  - Hidden until first deployment; when empty: "What do you want to do today?" prompt
- **Structure cards = primary navigation** — tapping a card navigates to that viewport
  - Bottom nav bar is secondary/redundant for this path
- **Persistent HUD strip** — always visible strip showing:
  - Active signals (from `linked_anomalies`)
  - Pending anomalies to classify
  - Other key user-action metrics (max 2–3 numbers)
- **Add project button** — allows adding projects post-onboarding without restarting flow
- **Profile dropdown (header):** stardust balance, level/XP, settings, sign out
- **Vertical stacking preferred;** some horizontal scrolling within sections is OK (not overabundant)

## Tasks

### Layout Audit & Redesign
- [ ] Audit current `/game` layout for vertical overflow on mobile (390×844px)
- [ ] Redesign grid to fit within 100dvh — no scroll required
- [ ] Prioritise above-fold: Mission Brief > Active Structures > HUD strip > Radar > Log
- [ ] Structure cards are tappable → navigate to that structure's viewport directly
- [ ] Remove or demote bottom nav bar (still present but secondary)

### Star Map (replaces old SectorRadar)
- [ ] Design star map component: zone of space, not concentric rings
- [ ] Show user's deployed structures as positioned icons with labels
- [ ] Structures animate: satellite orbits, rover moves, telescope sweeps (CSS only)
- [ ] Tap structure → navigate to viewport or deploy route
- [ ] Zoom in → secondary entity detail view
- [ ] Hide until at least 1 structure deployed
- [ ] Empty state: "What do you want to do today?" prompt with clickable entity options
- [ ] Show deployed structure state (standby = dim, active = glowing) on map icons

### Persistent HUD Strip
- [ ] Create slim HUD strip component (top or bottom of hub, always visible)
- [ ] Data: active signals count (`linked_anomalies` query), pending anomalies, (TBD: other metrics)
- [ ] Numbers count up (odometer animation) when values change
- [ ] Keep to 2–3 metrics max — no clutter

### Add Project Button
- [ ] "Add project" button on hub (accessible at any time post-onboarding)
- [ ] Opens project selection view (same component as onboarding step 1)
- [ ] Does not restart onboarding — just opens project picker

### Profile Header Dropdown
- [ ] Header profile button → dropdown: stardust balance, level/XP, settings, sign out
- [ ] Keep header minimal

### Leaderboard
- [ ] Add leaderboard component to hub (placement TBD during design)
- [ ] Primary metric TBD: classification count or stardust
- [ ] Show top N + current user's rank

## Acceptance Criteria
- Hub fits within 100dvh on mobile without scrolling
- Mission Brief always above fold
- Star map renders deployed structures with animation, navigates on tap
- Star map hidden for 0-deployment users, replaced with day-start prompt
- HUD strip always visible with live data
- Numbers count up on change
- Tapping a structure card navigates to its viewport
- Add project button works independently of onboarding
