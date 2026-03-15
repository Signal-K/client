---
id: task-30-p11-intro-sequence
title: "3.0 Phase 11: New User Intro Sequence & Onboarding Builds Hub"
status: todo
priority: high
phase: "3.0-p11"
specRefs:
  - "specs/redesign/3-0-unified-web-client"
createdAt: '2026-03-17T00:00:00Z'
updatedAt: '2026-03-17T00:00:00Z'
---

# 3.0 Phase 11: New User Intro Sequence & Onboarding Builds Hub

## Goal
New users get a brief intro animation before project selection (station powering up), and the onboarding flow shows an empty station schematic that builds itself as the user makes choices — so choices feel spatial and consequential.

## Confirmed Decisions
- **Intro sequence:** brief animation before project selection — station powers up, signals arrive
- **Onboarding model:** Option A — empty station that builds itself
  - User sees a bare station/star map schematic
  - Each choice (e.g. picking Telescope) → telescope icon appears on the map
  - NOT a spotlight on a pre-built environment
  - By end of onboarding, user has a partially populated hub
- Sequence must be brief — not a loading screen, not skippable-required (add skip option)

## Tasks

### Intro Sequence (fires on first visit to `/onboarding`)
- [ ] Create `IntroSequence` component — CSS-animated sequence, no video
- [ ] Steps (brief, < 5 seconds total):
  1. Dark screen — station powers up (lights flicker on, systems activate)
  2. First signals arrive (data wave sweeps across)
  3. Transition to project selection UI
- [ ] Skip button: always visible, skips to project selection immediately
- [ ] One-time: flag `intro_seen` in profile — never shows again after first visit
- [ ] No sound (sound deferred to sprint 7+) — visuals only

### Onboarding "Build the Hub" Model
- [ ] Redesign `/onboarding` page to show an empty station schematic / star map
- [ ] As user selects a project → corresponding structure icon animates in on the map
  - Pick Telescope project → teal telescope icon appears on star map
  - Pick Satellite project → sky satellite icon appears
  - Pick Rover project → amber rover icon appears
- [ ] The schematic starts fully empty (no pre-deployed structures shown)
- [ ] Each addition is animated (fade in + orbit/settle animation)
- [ ] At completion: user sees their partially populated hub → transition to `/game` feels like arriving at something they built
- [ ] This uses the same star map component as the hub (reuse `SectorRadarMap` / star map from task-30-p8)

### Viewport Zoom-In Continuity
- [ ] Implement zoom-in transition when navigating from hub card → structure viewport
- [ ] The hub is "home" — viewports are zoomed-in parts of the same world (Crashlands model)
- [ ] Transition: CSS scale-up / zoom animation, not a hard cut
- [ ] Returning from viewport → zoom-out back to hub
- [ ] Must work with Next.js App Router (no full page reload, use `<Link>` + CSS transition)

## Acceptance Criteria
- First visit to `/onboarding` shows intro sequence (≤ 5s), skip always available
- Subsequent visits skip the intro
- Onboarding schematic starts empty, structures appear as projects are selected
- Structures animate onto the star map matching their accent colour
- Hub → viewport transition feels like zooming in (CSS animation, no flash)
- Viewport → hub feels like zooming out
