---
id: task-30-p6-posthog-sentry
title: "3.0 Phase 6: PostHog Expansion & Sentry Boundaries"
status: completed
priority: medium
phase: "3.0-p6"
specRefs:
  - "specs/redesign/3-0-unified-web-client"
createdAt: '2026-03-15T00:00:00Z'
updatedAt: '2026-03-21T00:00:00Z'
---

# 3.0 Phase 6: PostHog Expansion & Sentry Boundaries

## Goal
Track all key user actions. Cross-game navigation tracking is a priority (referral is the primary growth mechanic). Add Sentry error boundaries on key sections.

### Landing Page
- [x] `landing_page_viewed` (exists)
- [x] `hero_cta_clicked` (primary: Launch Web Client) — data-track delegation
- [x] `structure_preview_card_clicked` (which structure, destination) — data-track delegation
- [x] `guide_link_clicked` (nav "Full Guide" link) — data-track delegation
- [x] `ecosystem_link_clicked` (nav "Games Ecosystem" link) — data-track delegation
- [x] `apt_logged_in_redirect` — fires in GameClient when `?from=apt` param present

### Game Hub
- [x] `game_hub_viewed` (userId) — fires on mount in GameClient
- [x] `structure_tab_switched` (from, to) — fires in handleViewChange
- [x] `classification_submitted` (project, structureType) — wired in annotation submit paths
- [x] `structure_deployed` (type) — wired in telescope / satellite / rover deploy flows
- [x] `first_classification_ever` (userId) — wired on successful first submit via research summary pre-check

### Cross-Game Navigation (Primary Growth Tracking)
- [x] `coral_fishtank_clicked` — in CoralFishtank component
- [x] `coral_external_link_clicked` — in CoralFishtank component
- [ ] `cross_game_navigation` — needs wiring on Saily/Experiment-1 links in hub

### Auth & Onboarding Flow
- [x] `login_completed` — fires in auth page on user detection
- [x] `onboarding_started` / `onboarding_project_selected` / `onboarding_completed` — wired in onboarding page
- [ ] `signup_started` / `signup_completed` — requires Supabase auth event hook

## Sentry Error Boundaries
- [x] Wrap each major game tab in `<ErrorBoundary>` with fallback UI — done in GameClient viewport
- [ ] Wrap landing page sections — low priority, Next.js error.tsx handles page-level
- [ ] `Sentry.setUser` on auth state change — DEFERRED: Sentry not installed

## Acceptance Criteria
- PostHog dashboard shows all events firing without duplicates
- No uncaught errors in game tabs crash the full page
