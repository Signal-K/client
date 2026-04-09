---
title: Incomplete Tickets Reference — 2026-04-13
createdAt: '2026-04-13T03:05:09.307Z'
updatedAt: '2026-04-13T03:05:09.307Z'
description: >-
  Snapshot of all open/todo/in-progress tickets as of 2026-04-13. Revisit before
  next sprint planning.
tags:
  - archive
  - tickets
  - sprint-planning
revisitBy: '2026-04-20'
---

# Incomplete Tickets — Snapshot 2026-04-13

All tickets that were **not completed** as of 2026-04-13. This document exists so they are not lost
between sprints. Revisit this before the next sprint planning session.

---

## In-Progress

### `task-30-p1-design-tokens` · HIGH
**3.0 Phase 1: Design Tokens, Fonts & Theme**

One item remains: manual QA pass to verify dark/light mode tokens look correct visually.
All implementation tasks are checked off — this is a sign-off gate only.

**Blocked by:** Liam doing a visual review pass.

---

## Engineering — Onboarding Bugs (all HIGH or MEDIUM)

These were created 2026-04-07 as a batch. They are engineering-ready with full context.

### `task-ob1-galaxyzoo-branch-bug` · HIGH
**GalaxyZoo: both `showTutorial` branches render `<GalaxyZooTutorial>` — form never shown**
- File: `src/components/projects/Telescopes/GalaxyZoo.tsx` lines 247–251
- Fix: split the conditional so `showTutorial=false` renders the standalone classification form
- Strategy: extract classification form or compose from shared component

### `task-ob2-missing-tutorial-selectors` · HIGH
**`data-tutorial` attributes referenced in TutorialWrapper don't exist in the DOM**
- File: `TutorialWrapper.tsx` — all `highlightSelector` values point to elements that have no matching attribute
- Fix: add `data-tutorial="…"` attributes to real rendered elements in TelescopeSection, DeploySidebar, RoverSection, SolarHealth, satellite nav
- Prerequisite for: ob3, ob6

### `task-ob3-tutorial-never-instantiated` · HIGH
**TutorialWrapper and all step sets are defined but never mounted anywhere in the app**
- The full tutorial system (TutorialWrapper, TELESCOPE_INTRO_STEPS, ROVER_INTRO_STEPS, etc.) is built but dead
- Fix: export the unexported step sets, wrap telescope/rover/satellite/solar setup pages with `<TutorialWrapper>`
- Depends on: ob2

### ~~`task-ob4-missing-onboarding-projects`~~ · CLOSED 2026-04-13
**Already shipped** — `onboarding-data.ts` already contains all 5 projects including
asteroid-hunting and solar-monitoring. Ticket marked done.

### `task-ob5-no-reentry-path` · MEDIUM
**Mid-flow onboarding bounce resets to "Station Arrival" (no step persistence)**
- File: `src/app/onboarding/page.tsx`
- Fix: persist `ss_onboarding_step` and `ss_onboarding_project` to localStorage; restore on mount if `!hasCompletedOnboarding`

### `task-ob6-setup-pages-no-tutorial` · MEDIUM
**Setup pages (/setup/telescope, /setup/rover, /setup/satellite) have no tutorial overlay**
- Depends on: ob2 (selectors), ob3 (exports)
- Fix: wrap each setup page content with the appropriate `<TutorialWrapper>`

### `task-ob7-alpha-watermark` · LOW
**Hardcoded `v3.0.0-alpha` string renders in onboarding footer**
- File: `src/app/onboarding/page.tsx` line 150
- Fix: delete the `<span>` entirely — one-liner

---

## Design / Copy (all TODO, not engineering-blocked)

### ~~`9ztpbl`~~ · CLOSED 2026-04-13
**Already implemented** — `HUDStrip.tsx` shows Signals / Pending / Classifications in a top
strip. Decision was made in code. Ticket marked done.

### `aaigmw` · HIGH · assigned @Liam
**Document typography and colour tokens for the 3.0 redesign**
- Fonts at which weights, hex colour palette (teal/amber/sky + neutrals), spacing scale, dark/light variants
- Needs to be a short markdown spec so developers can build from it

### `7kznko` · MEDIUM
**Sketch the 3.0 homepage hero section**
- Headline, visual treatment, primary CTA
- Input for: landing page pass

### `uayboz` · MEDIUM
**Sketch the 3.0 navigation and top-level IA**
- What's in the nav; logged-in vs logged-out states

### `u6zo6x` · MEDIUM
**Write homepage headline and subhead variants (3–5 options)**
- Citizen science gaming angle

### `xdbtg8` · MEDIUM
**Write the about / mission page copy**
- Mission statement, how it works, why citizen science gaming matters

---

## Notes

- 7 corrupted task files were skipped by `knowns task list` — run `knowns task validate <id>` on them
- `knowns` is on v0.11.4; v0.18.3 is available — `brew upgrade knowns`
