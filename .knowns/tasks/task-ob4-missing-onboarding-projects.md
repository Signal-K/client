---
id: task-ob4-missing-onboarding-projects
title: "Onboarding: Solar Monitoring and Asteroid Hunting absent from project selection"
status: open
priority: medium
createdAt: '2026-04-07T00:00:00Z'
---

# Onboarding: Only 3 of 5 projects shown in selection step

## Status
**Status:** Open
**Priority:** Medium
**Created:** 2026-04-07

## Context
`src/components/onboarding/onboarding-data.ts` exports `PROJECTS` with 3 entries:
- planet-hunting → Telescope
- rover-training → Rover
- cloud-tracking → Satellite

`SETUP_MAP` already has entries for `"asteroid-hunting"` (→ `/setup/telescope`) and
`"solar-monitoring"` (→ `/setup/solar`), but neither has a corresponding `PROJECTS` entry so
they never appear in the selection UI.

`ProjectType` in `useUserPreferences` needs to be checked to confirm it includes the new IDs.

## Objectives
- [ ] Add "Asteroid Hunting" entry to `PROJECTS` in `onboarding-data.ts`:
  - `id: "asteroid-hunting"`, icon: `Telescope` (or `Target`), color: orange/amber, structure: `"Telescope"`, description referencing the Daily Minor Planet / asteroid detection mission
- [ ] Add "Solar Monitoring" entry to `PROJECTS`:
  - `id: "solar-monitoring"`, icon: `Sun` or `Zap`, color: yellow, structure: `"Solar Observatory"`, description referencing sunspot classification
- [ ] Confirm `ProjectType` union in `useUserPreferences.ts` includes `"asteroid-hunting"` and `"solar-monitoring"`
- [ ] Update `SETUP_MAP` if needed (entries already exist, verify they're correct)

## Strategy
- Keep the same shape as existing PROJECTS entries (id, name, icon, color, bg, border, glow, structure, description)
- Asteroid Hunting and Solar Monitoring are separate missions; don't merge with planet-hunting
