# Task: Asset & Animation Performance Audit

## Status
**Status:** Backlog
**Priority:** Low
**Created:** 2026-04-02
**Context:** Visual flair is important, but heavy DOM-based animations can lag on older mobile devices.

## Objectives
- [ ] Optimize `LivingWorldBg.tsx` for high entity counts.
- [ ] Convert heavy SVG/DOM animations to `<canvas>` where appropriate.
- [ ] Audit image sizes and formats (WebP migration).

## Strategy
- Profile the `LivingWorldBg` with 100+ entities to identify bottlenecks.
- Benchmark a Canvas-based starfield vs the current CSS-based one.
- Implement lazy loading or lower-quality assets for low-power devices.
