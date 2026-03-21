---
id: uzm1um
title: "Fix frontend `/game` route slowness"
status: completed
priority: medium
labels:
  - performance
  - bugs
createdAt: '2026-03-07T21:35:56Z'
updatedAt: '2026-03-21T01:42:00Z'
timeSpent: 0
---

# Fix frontend `/game` route slowness

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The frontend is still quite slow after login, the section to select the projects the user is interested in is not well designed and doesn't fit with the rest of the theme/layout. I think that there's a lot going on and either there's too much or it's not well organised, where things/components are essentially not well designed and this is causing performance issues
<!-- SECTION:DESCRIPTION:END -->

## Progress Notes

- `/game` now uses a shared Prisma-backed page-data helper for both SSR and the refresh API path, reducing duplicate route logic on the main hub data path.
- The hub no longer makes extra post-hydration referral fetches for initial render; referral code/count/status are now shipped in the initial game payload.
- The ambient telescope background on the hub now uses `stars-only` mode without fetching anomaly data, and non-base viewports skip the extra ambient background layers.
- Ambient background layers now mount after idle instead of competing with the first hub paint.
- Mobile hub spacing was tightened so the base view no longer relies on vertical scrolling for the primary brief/radar/cards path.
- The project preferences modal was restyled to use the 3.0 token classes (`star-field`, `sunburst-bg`, `sci-fi-panel`, `btn-glow`) and reorganised into a more compact selection grid.
- The public editorial landing now lives on `/`, and `/apt` is reduced to a redirect so the old landing route is no longer part of the main user path.

## Completion Notes

- Verified with `yarn build`
- Verified with `npm run test:unit`
