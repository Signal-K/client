---
id: e9f2px
title: "2.2 landing page visual overhaul and ecosystem routing"
status: completed
priority: high
labels:
  - migration-2.2
  - homepage
  - ux
  - ecosystem
  - visual-design
specRefs:
  - "specs/migration/two-two-migration"
spec: "specs/migration/two-two-migration"
specPath: ".knowns/docs/specs/migration/two-two-migration.md"
createdAt: '2026-02-23T10:00:00Z'
updatedAt: '2026-02-23T10:00:00Z'
timeSpent: 0
---

# 2.2 landing page visual overhaul and ecosystem routing

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Overhaul the public-facing landing page (`/apt`) to be visually engaging and
unambiguously direct users to the frontend that best matches their interests.

The three live ecosystem destinations are:
1. **Star Sailors Web Client** (`/auth`) – Full strategy loop, 10+ science projects, text-first, 30–90 min sessions.
2. **Experiment 1 – PlanetHunters** (Godot build, external URL TBC) – Rocket-based game, 3 focused missions, game-first, 10–30 min sessions.
3. **Saily** (`https://thedailysail.starsailors.space`) – Daily puzzle, ~5 min, streak-based, NYT-style.

A fourth project, **Click-A-Coral**, is in early development and should be shown as a "Coming Soon" teaser only.

The current page is flat and text-dense. This task replaces it with a
visually immersive, fully responsive experience where users understand each
project's scope, session format, and experience type at a glance.
Primary spec: specs/migration/two-two-migration
Primary spec path: .knowns/docs/specs/migration/two-two-migration.md
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Page has a clear, full-width hero section with a compelling opening statement and no paragraph walls
- [x] #2 Each of the three live projects has a distinct, colour-coded card with: tagline, 3 experience bullets, session-length pill, and CTA button
- [x] #3 Click-A-Coral appears as a "Coming Soon" teaser section separate from the primary routing area
- [x] #4 Page is fully responsive: stacked single-column on mobile, 3-column grid on desktop
- [x] #5 Each project card accurately describes the experience: Web Client is text-first + broadest scope; Experiment 1 is game-first + 3 focused missions; Saily is daily puzzle + ~5 min sessions
- [x] #6 External links (Saily) open in a new tab and are visually distinguished from internal links
- [x] #7 PostHog `ecosystem_cta_clicked` event fires on all project CTAs with `{ project, destination }` payload
- [x] #8 Page passes a11y: all interactive elements have accessible labels, colour contrast meets WCAG AA
- [x] #9 No debug `console.log` output; zero TypeScript errors; ESLint clean
- [x] #10 Experiment 1 link placeholder is flagged with a TODO comment referencing the URL contract needed
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
**Implemented 2026-02-23 in `src/app/apt/page.tsx` (complete rewrite).**

Structure:
- Sticky nav with logo, section links, Saily pill + Web Client CTA (mobile hamburger with overlay)
- Full-width hero: gradient text headline, subtitle, "Find your path" + "What is Star Sailors?" CTAs
- `#choose` section: `md:grid-cols-3` card grid — teal (Web Client), amber (Experiment 1), sky (Saily)
  - Each card: icon, for-who label, name, tagline, 3-bullet checklist with SVG tick marks, Clock+session pill, CTA button
  - External links (Saily) visually distinguished with `ExternalLink` icon + `target="_blank"`
  - PostHog `ecosystem_cta_clicked` with `{ project, destination }` on all CTAs
- Click-A-Coral teaser at bottom of `#choose` (horizontal strip, disabled CTA)
- `#about` section: mission statement, stat grid (11+ science projects, 3 structures, 3 frontends)
- Footer: copyright, Terms, Privacy, GitHub

Colour coding:
- Web Client: teal-400 (#2dd4bf) — borders, icons, badge, CTA button, gradient accent
- Experiment 1: amber-400 (#fbbf24) — same pattern
- Saily: sky-400 (#38bdf8) — same pattern

Experiment 1 URL: `EXPERIMENT_1_URL` constant set to `/auth` fallback with a prominent TODO comment referencing `task-tdi1lj` (URL contract ticket) at top of file.

TypeScript: 0 errors verified.
<!-- SECTION:NOTES:END -->

## Spec References

- specs/migration/two-two-migration
