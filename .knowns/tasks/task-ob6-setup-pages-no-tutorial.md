---
id: task-ob6-setup-pages-no-tutorial
title: "Onboarding: setup pages don't invoke tutorial system — first action is unaided"
status: open
priority: medium
createdAt: '2026-04-07T00:00:00Z'
---

# Onboarding: Setup pages don't trigger the interactive tutorial

## Status
**Status:** Open
**Priority:** Medium
**Created:** 2026-04-07

## Context
After `StructureIntroStep`, the user is sent to `/setup/telescope`, `/setup/rover`, or
`/setup/satellite` via `SETUP_MAP`. These setup pages are the first real interaction with station
mechanics, but they render without any tutorial overlay.

`TutorialWrapper` and the step sets exist and are functional — they're just never mounted on
these pages. The user is dropped into a deploy flow with no guidance.

## Objectives
- [ ] Wrap `/setup/telescope` content with `<TutorialWrapper tutorialId="telescope-deploy" steps={TELESCOPE_DEPLOY_STEPS}>`
- [ ] Wrap `/setup/rover` content with `<TutorialWrapper tutorialId="rover-intro" steps={ROVER_INTRO_STEPS}>`
- [ ] Wrap `/setup/satellite` content with `<TutorialWrapper tutorialId="satellite-intro" steps={SATELLITE_INTRO_STEPS}>`
- [ ] Confirm `data-tutorial` attributes exist on the elements targeted by each step (see task-ob2)
- [ ] TutorialId literals must be added to the `TutorialId` union in `useUserPreferences.ts`

## Strategy
- Read the setup page files first to understand their current layout before wrapping
- The wrapper should surround the page's main content area, not the outermost layout shell
- This is blocked by task-ob2 (selectors) and task-ob3 (exports) — complete those first
