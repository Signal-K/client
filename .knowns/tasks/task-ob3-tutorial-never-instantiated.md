---
id: task-ob3-tutorial-never-instantiated
title: "Onboarding: TutorialWrapper + step sets defined but never used in routing"
status: open
priority: high
createdAt: '2026-04-07T00:00:00Z'
---

# Onboarding: Tutorial step sets exist but are never instantiated

## Status
**Status:** Open
**Priority:** High
**Created:** 2026-04-07

## Context
`TutorialWrapper.tsx` defines and exports `SATELLITE_INTRO_STEPS` and `ROVER_INTRO_STEPS`, and
defines (but does not export) `TELESCOPE_INTRO_STEPS`, `TELESCOPE_DEPLOY_STEPS`,
`SOLAR_INTRO_STEPS`. `InteractiveTutorial.tsx` also defines `ONBOARDING_STEPS` and
`DEPLOYMENT_STEPS` internally but does not export or use them.

None of these step sets are imported or instantiated anywhere in the app's routing. No page or
layout renders `<TutorialWrapper tutorialId="…" steps={…}>`. The entire interactive tutorial
system is built but dead.

## Objectives
- [ ] Export `TELESCOPE_INTRO_STEPS`, `TELESCOPE_DEPLOY_STEPS`, `SOLAR_INTRO_STEPS` from `TutorialWrapper.tsx`
- [ ] Wrap the telescope structure viewport (or setup page) with `<TutorialWrapper tutorialId="telescope-intro" steps={TELESCOPE_INTRO_STEPS}>`
- [ ] Wrap the rover structure viewport with `<TutorialWrapper tutorialId="rover-intro" steps={ROVER_INTRO_STEPS}>`
- [ ] Wrap the satellite structure viewport with `<TutorialWrapper tutorialId="satellite-intro" steps={SATELLITE_INTRO_STEPS}>`
- [ ] Wrap the deploy sidebar or setup pages with `<TutorialWrapper tutorialId="telescope-deploy" steps={TELESCOPE_DEPLOY_STEPS}>`
- [ ] Ensure `data-tutorial` attributes exist on target elements (see task-ob2)
- [ ] Smoke test: new user flow shows tutorial overlay on first visit, not on second

## Strategy
- Start with telescope setup page (`/setup/telescope`) — it's the most common first-run path
- Add `<TutorialWrapper>` at the page level so it wraps the entire viewport content
- Confirm `TutorialId` type in `useUserPreferences` includes the new IDs
