---
id: b2m7qe
title: "2.2 ecosystem homepage and routing clarity"
status: completed
priority: high
labels:
  - migration-2.2
  - homepage
  - navigation
  - ecosystem
specRefs:
  - "specs/migration/two-two-migration"
spec: "specs/migration/two-two-migration"
specPath: ".knowns/docs/specs/migration/two-two-migration.md"
specs:
  - "specs/migration/two-two-migration"
references:
  - "specs/migration/two-two-migration"
  - ".knowns/docs/specs/migration/two-two-migration.md"
createdAt: '2026-02-22T13:25:00Z'
updatedAt: '2026-02-22T15:02:00Z'
timeSpent: 0
---

# 2.2 ecosystem homepage and routing clarity

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Update the public homepage to clearly describe each ecosystem project and direct users to the best frontend entry point (web client, Experiment 1, Click-A-Coral status, and Saily status/entrypoint).
Primary spec: specs/migration/two-two-migration
Primary spec path: .knowns/docs/specs/migration/two-two-migration.md
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Homepage includes project-by-project flow summary with current playability state
- [x] #2 Each project card has clear call to action (play now, coming soon, or learn more)
- [x] #3 Copy explains that the main webapp is text-first and where game-first users should start
- [x] #4 Logged-out users can understand the ecosystem within one screen scroll
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
- Spec reference: specs/migration/two-two-migration
- Added ecosystem guide cards to `app/apt/page.tsx` with per-project playability status:
  - Web client: Live
  - PlanetHunters Experiment 1: Live (Subset)
  - Click-A-Coral: In Development
  - Saily: In Development
- Added explicit "Where to start" copy in hero to clarify web-client-first vs game-first entry intent.
- Wired CTA tracking for ecosystem cards via `posthog.capture('ecosystem_cta_clicked', ...)`.
- Reused `#about` anchor for desktop/mobile navigation so "About" now targets ecosystem routing guidance.
- Completed redesign pass with clearer ecosystem routing and explicit external Saily linkage (`https://thedailysail.starsailors.space`).
<!-- SECTION:NOTES:END -->


## Spec References

- specs/migration/two-two-migration
