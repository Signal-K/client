---
id: m8p2na
title: "Fix setup navigation hard refresh auth flicker"
status: completed
priority: high
labels:
  - setup
  - navigation
  - auth
  - routing
  - knowns
specRefs:
  - "specs/mechanics/deployment-spec"
spec: "specs/mechanics/deployment-spec"
specPath: ".knowns/docs/specs/mechanics/deployment-spec.md"
specs:
  - "specs/mechanics/deployment-spec"
references:
  - "specs/mechanics/deployment-spec"
  - ".knowns/docs/specs/mechanics/deployment-spec.md"
createdAt: '2026-02-20T00:00:00Z'
updatedAt: '2026-02-20T13:36:00Z'
timeSpent: 0
---

# Fix setup navigation hard refresh auth flicker

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Clicking setup actions/tabs can trigger full page reloads, briefly routing through auth/home before returning. Setup navigation should remain client-side to avoid session flicker and redirect loops.
Primary spec: specs/mechanics/deployment-spec
Primary spec path: .knowns/docs/specs/mechanics/deployment-spec.md
<!-- SECTION:DESCRIPTION:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
- Spec reference: specs/mechanics/deployment-spec
- Replaced hard navigations with Next.js client routing in setup flows:
  - `src/components/scenes/deploy/Rover/RoverSection.tsx`
  - `src/components/scenes/deploy/Telescope/TelescopeSection.tsx`
  - `src/components/scenes/deploy/solar/SolarHealth.tsx`
- These changes avoid `window.location.href` reload behavior for setup actions and keep auth/session context stable during transitions.
<!-- SECTION:NOTES:END -->


## Spec References

- specs/mechanics/deployment-spec
