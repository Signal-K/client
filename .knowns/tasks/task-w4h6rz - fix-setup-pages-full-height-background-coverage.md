---
id: w4h6rz
title: "Fix setup pages full-height background coverage"
status: in-progress
priority: high
labels:
  - setup
  - ui
  - layout
  - backgrounds
  - knowns
createdAt: '2026-02-20T00:00:00Z'
updatedAt: '2026-02-20T00:00:00Z'
timeSpent: 0
---

# Fix setup pages full-height background coverage

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
All setup pages (rover, solar, telescope, satellite) should fill the viewport under the fixed navbar. Backgrounds currently collapse to content height in some tutorial and scene states.
<!-- SECTION:DESCRIPTION:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
- Updated setup page containers to use dynamic viewport height:
  - `app/setup/rover/page.tsx`
  - `app/setup/solar/page.tsx`
  - `app/setup/telescope/page.tsx`
  - `app/setup/satellite/page.tsx`
- Ensured wrapped setup scene containers retain full-height behavior:
  - `src/components/onboarding/TutorialWrapper.tsx`
  - `src/components/scenes/deploy/solar/SolarHealth.tsx`
  - `src/components/scenes/deploy/Telescope/TelescopeSection.tsx`
  - `src/components/scenes/deploy/satellite/DeploySatellite.tsx`
<!-- SECTION:NOTES:END -->
