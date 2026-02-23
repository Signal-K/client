```markdown
---
id: lp7v3x
title: "Landing page variant demo suite"
status: completed
priority: medium
labels:
  - landing-page
  - ux
  - demo
  - design-spike
specRefs:
  - "specs/migration/two-two-migration"
specPath: ".knowns/docs/specs/migration/two-two-migration.md"
createdAt: '2026-02-23T14:00:00Z'
updatedAt: '2026-02-23T14:00:00Z'
timeSpent: 0
---

# Landing page variant demo suite

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create a set of 6 distinct `/apt` landing page variants so that design directions can be
demoed side-by-side and user/stakeholder feedback can be gathered before picking a
production design.

Each variant is accessible at its own route (`/apt`, `/apt/v2`–`/apt/v6`). A shared
floating VariantSwitcher component is rendered on every page, allowing one-click
navigation between all variants without returning to a menu.

Variants:
1. **V1** (`/apt`) — Light mode, full-bleed hero photo, 3-column cards with imagery
2. **V2** (`/apt/v2`) — Dark mode (restored), teal/amber/sky neon glow cards, no photography
3. **V3** (`/apt/v3`) — Editorial / magazine. Giant typography, extreme whitespace, minimal chrome
4. **V4** (`/apt/v4`) — Cinematic. Full-viewport scroll sections, one per project, background fills
5. **V5** (`/apt/v5`) — Interactive. Three massive routable panels; "Which explorer are you?" quiz feel
6. **V6** (`/apt/v6`) — Warm / welcoming. Cream background, generous rounding, friendly copy
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Six distinct routes exist, each rendering a visually differentiated landing page
- [x] #2 A floating VariantSwitcher is visible on every variant, highlighting the active one
- [x] #3 The VariantSwitcher links work correctly between all variants
- [x] #4 All variants are server-safe (no runtime errors, `force-dynamic` exported where needed)
- [x] #5 All variants preserve PostHog `ecosystem_cta_clicked` tracking with correct project/destination payloads
- [x] #6 All variants are responsive (mobile single-column or equivalent), no horizontal overflow
- [x] #7 Zero TypeScript errors across all variant files
- [x] #8 V2 faithfully restores the dark version from the previous iteration
- [x] #9 V3–V6 each have a clearly distinct visual identity — not just colour swaps
- [x] #10 VariantSwitcher is extracted as a shared component, not duplicated per page
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
**Implemented 2026-02-23.**

Files created:
- `src/components/landing/VariantSwitcher.tsx` — shared fixed bottom-center floating pill nav; uses `usePathname()` to highlight active variant
- `src/app/apt/page.tsx` — V1 (Light mode — updated to import VariantSwitcher)
- `src/app/apt/v2/page.tsx` — V2 (Dark, restored from previous dark-mode iteration)
- `src/app/apt/v3/page.tsx` — V3 (Editorial magazine style: oversized type, rows, extreme whitespace)
- `src/app/apt/v4/page.tsx` — V4 (Cinematic: full-viewport scroll sections, one per project, `next/image` backgrounds)
- `src/app/apt/v5/page.tsx` — V5 (Interactive: 3 expandable panels, hover-to-reveal content, direct routing)
- `src/app/apt/v6/page.tsx` — V6 (Warm: cream/stone-50 background, emoji accents, rounded-3xl, friendly copy)

All 7 files: 0 TypeScript errors.
<!-- SECTION:NOTES:END -->

## Spec References

- specs/migration/two-two-migration
```
