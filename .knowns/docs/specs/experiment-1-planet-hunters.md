# Spec: Experiment 1 — Planet Hunters Standalone

## Status: Active (Standalone, future integration planned)
## Priority: Reference / Long-term planning
## Owner: Engineering
## Updated: 2026-03-17

---

## What It Is

Experiment 1 is a **standalone Godot-based browser game** — a fast-feedback prototype separate from the main Star Sailors web client. It is NOT integrated into the main client currently.

**Concept:** A resource management game where players launch missions to real astronomical targets (asteroids and TESS exoplanet candidates), mine minerals, level up their base, and gradually encounter citizen science mechanics like light-curve scanning and target classification.

**Purpose of the experiment format:**
- Test specific gameplay loops, mechanics, and UX ideas with real players quickly
- Validate economy balance, mission flow, tutorial pacing, player engagement with citizen science
- Build fast feedback loop before committing to full implementation in the main game

---

## What "Experiments" Are (Ecosystem Context)

Experiments are self-contained, rapidly built game prototypes:
- Standalone Godot projects wrapped in a lightweight web shell
- Designed to test a specific mechanic or loop
- Operate independently of the main Star Sailors native app
- Examples: Experiment 1 (Planet Hunters mining game), Rocket Missions, Saily (daily puzzle)

---

## Experiment 1 — Short-Term (Standalone)

### Core Loop
1. Player launches missions to real asteroid / TESS exoplanet candidates
2. Mine minerals from targets
3. Level up base / unlock new capabilities
4. Gradually encounter citizen science: light-curve scanning, target classification

### Key Things to Validate
- Economy balance (how many minerals per mission, upgrade costs)
- Mission flow and pacing
- Tutorial pacing for the science layer
- Player engagement with the citizen science mechanics

### Player Data
- Operates independently (own backend or minimal Supabase tables)
- Discoveries, classifications, mineral data are local to the experiment for now

---

## Long-Term — Integration into Main Game

Successful mechanics proven out in Experiment 1 are intended to be ported into the main Star Sailors web client:

| Experiment 1 Mechanic | Main Game Target |
|----------------------|-----------------|
| Mineral economies | Expand existing mineral deposit system |
| Contractor systems | New mission type in deployment flow |
| Rocket progression | New structure type (launch pad?) |
| Discovery consensus | Cross-user classification agreement system |
| Light-curve scanning UI | Improve Planet Hunters telescope viewport |

### Shared Backend (Long-Term Goal)
- Both share Supabase infrastructure
- Player discoveries, classifications, and cross-pollination of asteroid/planet data flow across the whole Star Sailors ecosystem
- A user who classifies a TESS exoplanet in Experiment 1 could see it appear in their Star Sailors hub

---

## Web Client Integration Points (Current)

### Cross-Game Navigation Tracking
- Any link from Star Sailors web client → Experiment 1 fires PostHog `cross_game_navigation` event with `destination: "experiment-1"`
- Referral attribution preserved through the navigation

### Hub Reference
- Experiment 1 is listed in the "Games Ecosystem" page (linked from the guest nav)
- NOT prominently featured on the main landing hero (web client is the main game)
- NOT integrated into the hub as a structure card (separate game, not a structure)

---

## Future (V4+ / Several Months Away)

- Construction on other planets with astronaut characters
- Alien characters (far-future, once SETI citizen science is integrated)
- Full backend sharing and discovery cross-pollination
- Possibly a "Base" view in the main hub that bridges with Experiment 1's base-building loop

---

## Notes
- This spec is for reference and long-term planning
- Implementation of Experiment 1 itself is outside the scope of the main client `.knowns/` task system
- Create tasks here only for the **integration points** (cross-game nav tracking, ecosystem page listing)
