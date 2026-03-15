---
id: task-30-p4-coral-teaser
title: "3.0 Phase 4: Click-A-Coral Fishtank in Hub"
status: todo
priority: medium
phase: "3.0-p4"
specRefs:
  - "specs/redesign/3-0-unified-web-client"
createdAt: '2026-03-15T00:00:00Z'
updatedAt: '2026-03-17T00:00:00Z'
---

# 3.0 Phase 4: Click-A-Coral Fishtank in Hub

## Goal
Place the Click-A-Coral experience as a decorative fishtank element inside the game hub (`/game`), not on the landing page. It's science-adjacent but not astronomy — it doesn't belong on the main acquisition page. Clicking it explains that Coral is a separate game at `coral.starsailors.space`.

## Confirmed Decisions
- **NOT on the landing page** — removed from `/apt`
- Lives in the game hub as an ambient decorative element (fishtank)
- Clicking opens a message/modal: "The Coral game lives at coral.starsailors.space — it's a different experience, not integrated into Star Sailors"
- Links out to `coral.starsailors.space`
- No "coming soon" — the game exists, it's just separate

## Tasks
- [ ] Create `CoralFishtank` client component in `src/components/game/`
  - Decorative animated fishtank (CSS animation, no Lottie)
  - Idle state: fish swimming, soft ambient animation
  - On click: modal/sheet slides up explaining Click-A-Coral
  - Modal contains: brief description of the Coral project + link to `coral.starsailors.space`
- [ ] Place `CoralFishtank` in the game hub layout (ambient, non-intrusive placement TBD)
- [ ] Remove any Click-A-Coral reference from `/apt/page.tsx`
- [ ] PostHog events: `coral_fishtank_clicked`, `coral_external_link_clicked`

## Acceptance Criteria
- Fishtank visible in game hub without disrupting main flow
- Click → informational modal with external link to coral.starsailors.space
- Modal is dismissable
- PostHog events fire on click and on external link navigation
- No reference to Click-A-Coral remains on `/apt`
