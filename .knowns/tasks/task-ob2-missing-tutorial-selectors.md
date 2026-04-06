---
id: task-ob2-missing-tutorial-selectors
title: "Onboarding: data-tutorial selectors referenced in TutorialWrapper steps don't exist in DOM"
status: open
priority: high
createdAt: '2026-04-07T00:00:00Z'
---

# Onboarding: data-tutorial selectors don't exist in rendered components

## Status
**Status:** Open
**Priority:** High
**Created:** 2026-04-07

## Context
`TutorialWrapper.tsx` defines step sets (TELESCOPE_INTRO_STEPS, TELESCOPE_DEPLOY_STEPS,
SATELLITE_INTRO_STEPS, ROVER_INTRO_STEPS, SOLAR_INTRO_STEPS) with `highlightSelector` values
like `[data-tutorial='deploy-telescope']`, `[data-tutorial='project-options']`,
`[data-tutorial='confirm-deploy']`, `[data-tutorial='deploy-rover']`,
`[data-tutorial='participate-solar']`, etc.

`InteractiveTutorial.tsx` uses `document.querySelector(step.highlightSelector)` to position the
highlight cutout. When the selector matches nothing, the highlight silently renders at (0,0) —
the tutorial runs but the pointer never points at anything real.

A grep for these specific values finds them only in `TutorialWrapper.tsx` itself, not in any
structure/deploy component.

## Objectives
- [ ] Audit all `highlightSelector` values in every step set in `TutorialWrapper.tsx`
- [ ] Add the matching `data-tutorial="…"` attributes to the actual rendered elements:
  - `[data-tutorial='deploy-telescope']` → the "Deploy Telescope" button in TelescopeSection / TelescopeDeploySidebar
  - `[data-tutorial='project-options']` → the project option cards in the deploy sidebar
  - `[data-tutorial='confirm-deploy']` → the confirm/deploy button in DeploySidebar
  - `[data-tutorial='deploy-rover']` → the rover deploy button in RoverSection
  - `[data-tutorial='participate-solar']` → the participate button in SolarHealth
  - `[data-tutorial='planet-nav-next']` → the next-planet nav button for satellite tutorial
  - `[data-tutorial='deploy-satellite']` → the satellite deploy button

## Strategy
- Add `data-tutorial` attributes alongside existing `data-*` attributes in each component
- Do NOT restructure component logic — attribute additions only
- After adding, manually verify in browser that the highlight cutout correctly frames each element
