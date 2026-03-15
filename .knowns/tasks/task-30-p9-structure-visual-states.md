---
id: task-30-p9-structure-visual-states
title: "3.0 Phase 9: Structure Visual States, Colour System & Guided Deploy"
status: todo
priority: high
phase: "3.0-p9"
specRefs:
  - "specs/redesign/3-0-unified-web-client"
createdAt: '2026-03-17T00:00:00Z'
updatedAt: '2026-03-17T00:00:00Z'
---

# 3.0 Phase 9: Structure Visual States, Colour System & Guided Deploy

## Goal
Structure cards must communicate their state at a glance using colour, animation, and typography. Each structure type owns its own accent colour. Solar is visually distinct. Standby = powered down. First deployment has a guided overlay.

## Confirmed Decisions

### Colour Ownership System
Each structure owns one accent from the palette — colour alone should identify the structure:
| Structure | Accent |
|-----------|--------|
| Telescope | `teal-400` |
| Rover | `amber-400` |
| Satellite | `sky-400` |
| Solar | TBD — community glow, not one of the 3 personal colours |

This applies consistently across: card borders, map icons, HUD indicators, badges, signal animations.

### Deployed Structure Visual States
- **Standby** (deployed, no active signals): **Powered down** — greyscale/dim/cold appearance. Not just a label change — the card looks switched off. Implies the game is waiting, structure is dormant.
- **Active** (deployed with pending anomalies): Full accent colour, soft **ambient glow that breathes slowly** (not aggressive pulsing). "Signals awaiting" label. Does not push the user — they choose their pace.
- **Incoming signal animation:** When new signals arrive, a data wave or scan line sweeps across the card. Not just a badge — make it feel like data is arriving.

### Solar Card
- Same location on hub/map as personal structures (not segregated)
- **Community glow** around the card — visually suggests shared ownership
- CTA: "Join Mission" not "Deploy"
- Always present as joinable (no deployment required)

### Guided Deploy Overlay
- First deployment of each structure type shows a guided overlay
- Per-structure flag: `first_deploy_tutorial_telescope`, `first_deploy_tutorial_satellite`, etc.
- Overlay explains: what deploying does, how to interact with the deploy UI, what happens after

### Personalities
- Structures and rovers have **personalities** — expressed in copy, idle animations, status messages
- Rover: non-living but characterful (lazy? eager? grumpy depending on terrain?)
- Telescope: observant, patient
- Satellite: busy, efficient
- These don't need to be deep in this phase — just personality tokens in status copy

## Tasks

### Colour System
- [ ] Define Tailwind tokens for structure colours (teal-400, amber-400, sky-400)
- [ ] Apply accent colour consistently: card border, map icon, HUD indicator, badge, animations
- [ ] Test readability in both dark and light mode at each accent

### Standby State (Powered Down)
- [ ] Implement `standby` variant on structure cards: greyscale, dim, cold
- [ ] Standby must look clearly "off" not just "quiet"
- [ ] Copy: "Standby — no signals detected" or similar

### Active State (Ambient Glow)
- [ ] Implement `active` variant: full accent colour, slow-breathing ambient glow (`animate-pulse` variant, softer)
- [ ] Badge: "X signals awaiting"
- [ ] No aggressive pulsing — ambient, not urgent

### Incoming Signal Animation
- [ ] Animate card when new signals arrive: data wave / scan line sweep (CSS keyframe)
- [ ] Triggers on: new `linked_anomalies` appearing for a deployed structure
- [ ] After animation settles: card moves to `active` state

### Solar Card
- [ ] Create Solar card variant with community glow
- [ ] CTA: "Join Mission"
- [ ] Show community activity on Solar card (how many sailors joined, current mission)

### Guided Deploy Overlay
- [ ] Audit `InteractiveTutorial.tsx` — does it cover deploy flow? Improve gaps
- [ ] Wire to trigger on first deployment per structure type (check profile flag)
- [ ] Mark flag `first_deploy_tutorial_[type]_complete` after first overlay dismissed/completed

### Personality Copy (Initial Pass)
- [ ] Add personality-flavoured status messages for each structure (min 3 states each)
- [ ] Examples: "Your telescope is scanning the void..." / "Rover is idling on the plateau."

## Acceptance Criteria
- Standby cards look powered-down (greyscale, cold), not just dimly active
- Active cards glow softly (not aggressively) in their accent colour
- Incoming signals animate (scan line or data wave) before settling to active state
- Solar card has community glow, "Join Mission" CTA
- Colour system applied consistently across card, map icon, HUD indicator
- Guided overlay triggers on first deployment per structure type, not after
