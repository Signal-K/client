---
id: uayboz
title: Sketch the 3.0 navigation and top-level IA
status: done
priority: medium
labels:
  - sketch
  - design
createdAt: '2026-03-26T02:31:51.002Z'
updatedAt: '2026-03-26T09:18:05.891Z'
timeSpent: 0
---
# Sketch the 3.0 navigation and top-level IA

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The 3.0 navigation structure needs a sketch. What's in the nav, how is it organised, and how does it handle logged-in vs logged-out states?
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Navigation sketch complete
- [ ] #2 Logged-in and logged-out states covered
<!-- AC:END -->

## Navigation IA Sketch

### Top-level routes

```
/           → Landing (logged-out gate — redirects to /game if session exists)
/auth       → Sign in / create account
/game       → Mission hub (requires auth)
/onboarding → First-run flow (requires auth, redirects away if completed)
/about      → About / mission page (public)
/referrals  → Referral page (auth)
/leaderboards → Public leaderboards
/posts      → Community posts (auth)
```

### Logged-out nav (homepage `/`)

```
┌──────────────────────────────────────────────────────┐
│  ★ STAR SAILORS          [About]   [Sign in →]       │
└──────────────────────────────────────────────────────┘
```

- Logo left: `★ STAR SAILORS` in Syne Mono
- `About` → `/about` (ghost link, `text-muted-foreground`)
- `Sign in →` → `/auth` (primary button with glow)
- No hamburger on mobile — just logo + sign-in button (About moves to footer)
- No product links in the nav — the three product cards are on the hero page below the fold

### Logged-in nav (game hub `/game`)

The hub uses `CommandHeader` which is its own fixed top bar — not a shared nav component.

```
┌──────────────────────────────────────────────────────┐
│  [agency ID]    ★ STAR SAILORS    [🔔]  [◯ profile]  │
└──────────────────────────────────────────────────────┘
```

- Agency ID left (username or truncated UUID)
- Logo center
- Alerts icon + profile avatar right
- No route links — navigation is the bottom StationNav (SCOPE / SAT / ROVER / SOLAR / HOME)

### Bottom navigation (in-game, mobile-first)

```
┌─────────────────────────────────────────┐
│  [🔭 SCOPE] [🛰 SAT] [★ HOME] [🚗 ROVER] [☀ SOLAR] │
└─────────────────────────────────────────┘
```

- HOME (★) is the center anchor — slightly larger, round button
- Console-button physical press animation on tap (already implemented)
- Alert LED above each button when signals pending
- Hidden on desktop — right-column and sidebar handle navigation on lg+

### IA decisions

1. **No global nav in the game** — the hub IS the nav. Structure tabs are the navigation system.
2. **About and public routes** share a minimal logged-out nav — consistent logo + CTA only.
3. **No breadcrumbs** — routes are shallow; back navigation via ViewportHeader `← back` button.
4. **Onboarding is a full-screen takeover** — no nav visible during onboarding flow.
5. **Mobile-first**: everything works in bottom nav; right column and sidebars are desktop-only enhancements.

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
kanban: s5j08d
<!-- SECTION:NOTES:END -->

