# Spec: Living World Background

## Status: Active
## Priority: Medium (Sprint 4–6 for Phase 1, Sprint 7+ for Phase 2)
## Owner: Engineering / Design
## Updated: 2026-03-17

---

## Overview

The Star Sailors hub is not a static dashboard. The background is a persistent, animated space environment that communicates the state of the world at a glance and makes the game feel alive even when the user is idle. Inspired by Crashlands' persistent world and the community activity model of games like Pixel Starships.

---

## Phase 1 — Core Living World (Sprint 4–6)

### Parallax Star Field
- Multi-layer parallax background: near stars move faster than distant stars on scroll/tilt
- Different colours and sizes for different object types (stars, planets, classified anomalies)
- Deployed structures visible as labelled icons in the background world

### Classified Anomaly Labels
- User's classified planets, asteroids, and other anomalies appear in the background with their names/IDs
- Clicking a labelled anomaly → navigates to that planet/anomaly detail page
- Creates a sense of "your universe" — the more you classify, the more populated the background becomes

### Community Vehicle Flyovers
- Other users' satellites, rovers, and structures pass through the user's view
- Each vehicle is labelled with the sailor's name and current activity (e.g. "Sailor @foo's satellite scanning Europa candidate #4421")
- User can **tap/pause** a passing vehicle to see a tooltip with what's happening
- **Newly deployed community structures appear on your first login after they were deployed** — the world updates to reflect community activity since your last session
- Community flyovers are ambient, not interruptive — they don't pause the user's current action

### Animated Deployed Structures
- Your deployed satellite orbits slowly in the background
- Rover is shown crawling across a terrain surface (its deployed planet)
- Telescope points/sweeps
- These animations are **subtle** — present but not distracting from main UI
- Later: manually controllable interactions (user can direct rover, point telescope)

### Implementation Notes
- All background animations must use CSS (no Lottie, no canvas for v1)
- Parallax: achieved with CSS transforms + scroll/gyroscope events
- Community data: lightweight polling or WebSocket subscription to show recent deployments
- Performance constraint: background must not tank frame rate — use `will-change: transform`, lazy load off-screen elements

---

## Phase 2 — Richer World Events (Sprint 7+)

### Surface Events
- Things growing on classified planet surfaces (vegetation, structures, geological activity)
- Represents the passage of time and ongoing science missions

### Space Weather Events
- Solar flares visible in the background
- Meteor showers passing through the sector
- These events become **interactive pathways** — tapping a solar flare might prompt "classify this solar event" (links to a Solar project)
- Space weather events are not just cosmetic — they are entry points to mechanics

### Image Generation
- Hub environment backgrounds generated from classification data (what planets look like based on their known stats)
- Future: AI-generated planet imagery for classified exoplanets

---

## Data Sources

| Element | Source |
|---------|--------|
| User's classified anomalies | `classifications` + `anomalies` tables |
| User's deployed structures | `deployments` + `linked_anomalies` |
| Community vehicle positions | `deployments` from other users (recent, public) |
| Planet surface states | `classifications` + `profiles` |

---

## Key Design Principles
- The background should feel like a **window into space**, not a screensaver
- Community activity makes the world feel populated and shared
- More classifications = richer, more populated background (direct feedback loop)
- Must not compete visually with foreground UI elements — use opacity, blur, and low contrast
