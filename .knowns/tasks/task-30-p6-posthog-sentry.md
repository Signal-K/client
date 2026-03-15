---
id: task-30-p6-posthog-sentry
title: "3.0 Phase 6: PostHog Expansion & Sentry Boundaries"
status: todo
priority: medium
phase: "3.0-p6"
specRefs:
  - "specs/redesign/3-0-unified-web-client"
createdAt: '2026-03-15T00:00:00Z'
updatedAt: '2026-03-17T00:00:00Z'
---

# 3.0 Phase 6: PostHog Expansion & Sentry Boundaries

## Goal
Track all key user actions. Cross-game navigation tracking is a priority (referral is the primary growth mechanic). Add Sentry error boundaries on key sections.

## PostHog Events Audit
Ensure these events are captured (add where missing):

### Landing Page
- [ ] `landing_page_viewed` (exists)
- [ ] `hero_cta_clicked` (primary: Launch Web Client)
- [ ] `structure_preview_card_clicked` (which structure, destination)
- [ ] `guide_link_clicked` (nav "Full Guide" link)
- [ ] `ecosystem_link_clicked` (nav "Games Ecosystem" link)
- [ ] `apt_logged_in_redirect` (auth user hits /apt, gets redirected — measure acquisition leak)
- [ ] ~~`active_sailors_count_seen`~~ — REMOVED (no social proof on landing)
- [ ] ~~`coral_teaser_started` / `coral_teaser_completed`~~ — REMOVED (coral moved to hub fishtank)

### Game Hub
- [ ] `game_hub_viewed` (tab, userId)
- [ ] `structure_tab_switched` (from, to)
- [ ] `classification_submitted` (project, structureType)
- [ ] `structure_deployed` (type)
- [ ] `first_classification_ever` (userId) — trigger onboarding survey

### Cross-Game Navigation (Primary Growth Tracking)
- [ ] `cross_game_navigation` — fires whenever user navigates from web client to any other game/experiment
  - Props: `destination` (e.g. "rocket-missions", "saily", "coral"), `source_section` (where in the hub they clicked from)
- [ ] `coral_fishtank_clicked` — in-hub fishtank click
- [ ] `coral_external_link_clicked` — navigates to coral.starsailors.space

### Auth & Onboarding Flow
- [ ] `signup_started` / `signup_completed`
- [ ] `login_completed`
- [ ] `onboarding_started` / `onboarding_project_selected` / `onboarding_completed`
- [ ] `onboarding_step_completed` (step number)

## Sentry Error Boundaries
- [ ] Wrap each major game tab in `<ErrorBoundary>` with fallback UI
- [ ] Wrap landing page sections
- [ ] Add `Sentry.setUser` on auth state change

## Acceptance Criteria
- PostHog dashboard shows all events firing without duplicates
- No uncaught errors in game tabs crash the full page
