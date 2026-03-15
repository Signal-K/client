---
id: task-30-p3-logged-in-landing
title: "3.0 Phase 3: Auth Redirect + Dedicated Onboarding Route"
status: todo
priority: high
phase: "3.0-p3"
specRefs:
  - "specs/redesign/3-0-unified-web-client"
createdAt: '2026-03-15T00:00:00Z'
updatedAt: '2026-03-17T00:00:00Z'
---

# 3.0 Phase 3: Auth Redirect + Dedicated Onboarding Route

## Goal
Authenticated users should never see the marketing landing. `/apt` is acquisition-only. New sign-ups land on a dedicated onboarding route, not `/game` directly.

## Confirmed Decisions
- `/apt` redirects authenticated users to `/game` server-side
- `/game` IS the hub/dashboard — they are the same thing
- New users after sign-up land on a **dedicated onboarding route** (e.g. `/onboarding`)
- Onboarding includes: project preference selection, then guided first deployment
- "Resume your mission" CTA takes users to the view showing available structures/entities
- Dashboard = hub = `/game` — no separate "dashboard" route

## Tasks

### Auth Redirect
- [ ] In `/apt/page.tsx` Server Component: check auth session (Supabase SSR)
- [ ] If authenticated: `redirect('/game')` — no dashboard view on `/apt`
- [ ] Add PostHog event: `apt_logged_in_redirect` (for measuring how many existing users hit /apt)

### Dedicated Onboarding Route
- [ ] Create `/onboarding/page.tsx` — dedicated route for brand new users post-signup
- [ ] Auth flow: after sign-up completion, redirect to `/onboarding` (not `/game`)
- [ ] Onboarding flow steps:
  1. Project preference selection (`ProjectSelectionViewport` component)
  2. Based on selection → which structure to deploy first
  3. Guided overlay for first deployment (see task-30-p8-guided-deploy)
  4. First classification → redirect to `/game`
- [ ] Mark onboarding complete in user profile (idempotent flag)
- [ ] Returning users who have completed onboarding: skip `/onboarding` → `/game`
- [ ] Add PostHog events: `onboarding_started`, `onboarding_project_selected`, `onboarding_completed`

### Hub Entry Point
- [ ] "Resume your mission" CTA on hub cards → the view showing entities available to investigate
- [ ] Ensure `/game` hub shows the right entry state for users with 0 deployed structures (dashboard with deploy CTA, not blank)

## Acceptance Criteria
- Authenticated users never see marketing hero on `/apt`
- New users land on `/onboarding` post-signup, not `/game`
- Onboarding route is skipped for users with completed onboarding flag
- Auth check is server-side (no client flash)
- Project selection drives which structure is recommended first
