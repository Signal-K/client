---
id: m8p2na
title: "Fix setup navigation hard refresh auth flicker"
status: in-progress
priority: high
labels:
  - setup
  - navigation
  - auth
  - routing
  - knowns
createdAt: '2026-02-20T00:00:00Z'
updatedAt: '2026-02-20T00:00:00Z'
timeSpent: 0
---

# Fix setup navigation hard refresh auth flicker

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Clicking setup actions/tabs can trigger full page reloads, briefly routing through auth/home before returning. Setup navigation should remain client-side to avoid session flicker and redirect loops.
<!-- SECTION:DESCRIPTION:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
- Replaced hard navigations with Next.js client routing in setup flows:
  - `src/components/scenes/deploy/Rover/RoverSection.tsx`
  - `src/components/scenes/deploy/Telescope/TelescopeSection.tsx`
  - `src/components/scenes/deploy/solar/SolarHealth.tsx`
- These changes avoid `window.location.href` reload behavior for setup actions and keep auth/session context stable during transitions.
<!-- SECTION:NOTES:END -->
