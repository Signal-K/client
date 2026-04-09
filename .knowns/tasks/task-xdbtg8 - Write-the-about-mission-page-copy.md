---
id: xdbtg8
title: Write the about / mission page copy
status: done
priority: medium
labels:
  - writing
createdAt: '2026-03-26T02:31:51.301Z'
updatedAt: '2026-03-26T09:18:06.203Z'
timeSpent: 0
---
# Write the about / mission page copy

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The about page explains why Star Sailors exists. Write the copy — mission statement, how it works, and why citizen science gaming matters.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Mission statement written
- [ ] #2 Full page copy drafted
<!-- AC:END -->

## About / Mission Page — Full Copy Draft

---

### Mission statement (one sentence, for og:description, meta, and page header)

> **Star Sailors puts real NASA telescope data in the hands of anyone willing to play.**

---

### Page copy

#### Section 1 — What we are

`MICRO LABEL: 01 / MISSION`

**Science needs more hands than scientists have.**

There are more telescope observations, orbital images, and solar readings than any team of
researchers can process alone. That's been true since the 1990s. It's more true today.

Star Sailors is built on a simple bet: if we make the analysis feel like a game, more people will
do it — and the science will move faster.

---

#### Section 2 — How it works

`MICRO LABEL: 02 / HOW IT WORKS`

**You run a space station.**

When you join Star Sailors, you're given a station. You deploy structures — a telescope, a
satellite, a rover, a solar observatory — and those structures pull in real data from NASA's TESS
satellite, ESA orbital missions, and SDO solar imagery.

Your job is to classify what you find. Smooth galaxy or spiral? Sunspot or artifact? Cloud pattern
or geological feature?

Each classification goes into a database that real astronomers use. Your name can end up in a
research paper. That's not a metaphor.

---

#### Section 3 — The three experiences

`MICRO LABEL: 03 / PLAY`

**Pick your mission.**

- **Star Sailors** — The full game loop. Deploy four structures, run missions across multiple
  science domains, earn Stardust, climb the leaderboard. Strategy + science.

- **Experiment 1** — Rocket missions. Fly to real TESS targets, scan them with live light-curve
  data. Focused, fast, game-first.

- **Saily** — One anomaly per day. Annotate it. Submit. Come back tomorrow. For the streak
  chasers.

---

#### Section 4 — Why it matters

`MICRO LABEL: 04 / WHY`

**Citizen scientists have already found things astronomers missed.**

The original Galaxy Zoo project had volunteers discover a class of galaxy — the Voorwerp — that
wasn't in any catalogue. Planet hunters using TESS data have flagged exoplanet candidates that
automated pipelines skipped.

The pattern is consistent: humans notice things algorithms don't. Pattern recognition, intuition,
the feeling that something is slightly off — these are not bugs. They're the point.

We built Star Sailors to give that capability to as many people as possible, wrapped in something
that doesn't feel like homework.

---

#### Section 5 — CTA

`MICRO LABEL: 05 / START`

**Your station is ready.**

[Launch Star Sailors →] `/auth`

---

### Page structure notes (for developer)

- Numbered section labels: `uppercase text-[10px] tracking-widest text-muted-foreground/60`
- Section headings: `text-2xl` Syne Mono
- Body: `text-base text-muted-foreground` max-width ~65ch for readability
- Background: `star-field` at low opacity + dark bg (same as onboarding)
- No images required — the copy works without illustration

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
kanban: vgwltf
<!-- SECTION:NOTES:END -->

