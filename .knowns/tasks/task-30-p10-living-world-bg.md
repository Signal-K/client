---
id: task-30-p10-living-world-bg
title: "3.0 Phase 10: Living World Background (Phase 1)"
status: todo
priority: medium
phase: "3.0-p10"
specRefs:
  - "specs/living-world"
  - "specs/redesign/3-0-unified-web-client"
createdAt: '2026-03-17T00:00:00Z'
updatedAt: '2026-03-17T00:00:00Z'
---

# 3.0 Phase 10: Living World Background (Phase 1)

## Goal
Make the hub background a living, animated space environment that reflects the user's world and community activity. Not a screensaver — a window into real game state.

## Full Spec
See `.knowns/docs/specs/living-world.md`

## Phase 1 Scope (This Ticket)

### Parallax Star Field
- [ ] Multi-layer CSS parallax: near stars move faster on scroll/gyroscope
- [ ] Different colours/sizes for stars vs planets vs anomaly labels
- [ ] Must not impact frame rate — use `will-change: transform`, low DOM count

### Classified Anomaly Labels
- [ ] Fetch user's classified anomalies (planets, asteroids) and render as background labels
- [ ] Labels show name/ID, positioned in the background space
- [ ] Tappable: navigate to that anomaly's detail page
- [ ] More classifications = more labels = richer background (feedback loop)

### Community Vehicle Flyovers
- [ ] Fetch recent community deployments (other users, public, last 24h)
- [ ] Render as animated vehicles passing through the background (CSS animation paths)
- [ ] Each vehicle has a tooltip: "Sailor @x's satellite scanning [target y]"
- [ ] Tap/pause to show tooltip — does not interrupt user's current action
- [ ] On login: newly deployed community structures since last session appear → brief "new activity" indicator

### Animated Personal Structures
- [ ] Deployed satellite: orbits in background (CSS `animate-orbit`)
- [ ] Rover: crawls slowly across a terrain strip
- [ ] Telescope: sweeps/points
- [ ] Animations are subtle — 10–20% opacity, in background layer

### Performance Rules
- All animations: CSS only (no canvas, no Lottie)
- Lazy load off-screen elements
- Use `IntersectionObserver` to pause animations when hub not visible
- Community data: fetch once on load + 60s polling (no WebSocket in v1)

## Phase 2 (Future — Sprint 7+)
- Surface growth on classified planets
- Solar flares, space weather events → interactive entry points
- See `living-world.md` Phase 2 section

## Acceptance Criteria
- Background parallax renders on hub with at least 2 depth layers
- Classified anomaly labels appear for user's classifications, are tappable
- Community vehicles animate across background with tooltip on tap
- Personal deployed structures animate in background
- No frame rate impact on mid-range mobile (60fps maintained)
- Phase 2 items are NOT in scope
