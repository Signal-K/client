---
title: "Star Sailors Feedback Action Plan"
date: 2026-02-26
source:
  - ".knowns/reports/posthog/survey-monitor-2026-02-22T05-32-31-136Z.json"
  - ".knowns/docs/specs/migration/two-two-survey-audit-and-ops.md"
---

# Star Sailors Feedback Action Plan (2026-02-26)

## Constraints

- The repo contains survey inventory and activity metrics.
- Raw open-text response exports from PostHog are not available in local files.
- Immediate prioritization uses documented learnings and observed UX/routing defects in client.

## Key Feedback Themes

1. Mobile responsiveness and UI readability need improvement.
2. Navigation and route reliability need hardening.
3. Progression surfaces (achievements, milestones, profile setup) feel hidden or brittle.
4. Referral/invite loop is under-emphasized in core gameplay.
5. Visual tone should feel more world-like and less text-only.

## Immediate Changes Started

1. Referral hardening:
   - Prevent self-referral
   - Prevent duplicate referral submissions
   - Return explicit "code not found" and "already used" errors
2. Referral emphasis:
   - Added a new `ReferralBoostCard` to `/game` with copy/share actions
3. Route reliability:
   - Added `/leaderboards` index page
   - Repointed stale navbar routes from removed scene paths to valid setup/game routes
4. Achievement usability:
   - Added Escape-key close behavior and dialog semantics
   - Improved mobile modal behavior (scroll-safe layout)
   - Replaced badge rendering that depended on SVG `foreignObject`
5. Visual intensity:
   - Added richer gradients/glow styling in mission and structure cards

## Additional Progress (Same-Day Follow-Up)

1. Link stability hardening:
   - Added legacy redirects for `/scenes/desert`, `/scenes/ocean`, and `/scenes/milestones`.
   - Static internal-link audit now reports zero missing app routes (excluding `/assets` and `/api` paths).
2. Referral data integrity:
   - Referral inserts now persist canonical profile referral code casing to prevent mismatched referral-count queries.
   - Added referral continuity from invite URL (`/auth?ref=...`) into profile/research referral inputs.
   - Added referral mission prompt for non-referred users in `/game`, with CTA/copy telemetry.
3. Account surface consistency:
   - Account page now uses the same world-shell treatment (`MainHeader` + starfield background) as primary gameplay surfaces.
4. Research referral panel:
   - Reworked with stronger hierarchy and direct copy/share invite actions.
5. Verification:
   - `yarn lint` passes.
   - `yarn build` passes.
   - `npm run test:unit` passes.
6. Middleware hardening:
   - Replaced Supabase middleware client usage with cookie-based guard for `/game` routes.
   - Removed `/auth` auto-redirect in middleware to avoid stale-cookie redirect loops.

## Longer-Term Creative Mechanics (Web + Godot)

1. Expedition Chain Loop:
   - Web: choose mission objective, configure loadout, stake stardust.
   - Godot minigame: run a timed skill run (for example mining extraction).
   - Web return: convert run output into anomalies/minerals/reputation.
2. Citizen Science Guild Contracts:
   - Faction contracts tied to specific projects (planet hunting, cloud tracking, solar).
   - Weekly shared goals unlock world events and cosmetics.
3. Persistent World Sectors:
   - Sector states advance based on aggregated player outputs from both clients.
   - Changes alter available anomalies and mission difficulty windows.
4. Dual-Client Progression Ledger:
   - Shared progression contract: user id, reward ids, anti-dup keys, cooldown windows.
   - Cross-client telemetry in PostHog for loop completion and retention measurement.

## New Tickets

- `task-rf8k2n`: immediate UX and stability sprint
- `task-fv3m1q`: referral hardening and promotion
- `task-njy7p4`: navigation consistency and route hardening
- `task-kc6w9s`: ecosystem expansion mechanics (web to Godot)
