---
id: task-30-p2-landing-page
title: "3.0 Phase 2: /apt Landing Page Rewrite"
status: completed
priority: high
phase: "3.0-p2"
specRefs:
  - "specs/redesign/3-0-unified-web-client"
createdAt: '2026-03-15T00:00:00Z'
updatedAt: '2026-03-17T00:00:00Z'
---

# 3.0 Phase 2: /apt Landing Page Rewrite

## Goal
Convert `/apt/page.tsx` to a Next.js Server Component. Optimize for mobile-first, fast TTI. The page serves guests only — logged-in users are redirected to `/game`.

## Confirmed Decisions
- **No social proof / Active Sailors count** — removed from design
- **Nav links for guests:** "Full Guide" + "Games Ecosystem" (not auth links)
- **Hero copy strategy:** Must explain the game — what it is, how it works, what the user does. Not just a tagline.
- **Structure card order:** Does not imply recommended entry point — user chooses their project
- **No session length indicators** on structure cards — never implemented, not a known data point
- **About Strip ("Play games. Do real science.")** — keep it
- **Structure preview strip** — 3 cards: Telescope / Rover / Satellite

## Tasks
- [x] Remove `"use client"` from `/apt/page.tsx` and `export const dynamic` — now a Server Component
- [x] Enable PPR via `export const experimental_ppr = true`
- [x] Add server-side auth check → `redirect('/game')` if session found
- [x] Move hero section to a Server Component (`HeroSection`)
  - Star texture background (CSS only)
  - Headline: explains the game (what/how/why), NOT a curiosity-bait tagline
  - Primary CTA: "Launch Web Client" → `/auth`
  - Secondary CTA: "See projects" → scroll anchor
  - **Remove `<Suspense>` slot for `ActiveSailorsCount`** (no social proof needed)
- [x] Create `LandingAnalytics` client island — PostHog `landing_page_viewed` event
- [x] Create `LandingMobileMenu` client island — mobile nav toggle
- [x] Update nav: wordmark + "Full Guide" + "Games Ecosystem"
- [x] Remove `VariantSwitcher` from new page (kept in v2–v6 variants only)
- [x] Mobile-first layout — editorial V3 style: single column, numbered rows
- [x] Add OG meta tags via `metadata` export
- [x] Design: V3 editorial style — oversized clamp type, numbered project rows, clean dividers
- [x] Remove session length indicators from structure preview cards
- [ ] Performance: lazy-load image strip section, WebP images (low priority)

## Acceptance Criteria
- Logged-in users are redirected to `/game` server-side (no flash)
- No JS executes on initial load for above-the-fold content
- Lighthouse mobile score ≥ 90
- No social proof / Active Sailors count displayed
- All PostHog events still fire correctly
