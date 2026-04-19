---
id: sxdk5w
title: 'MVP Sprint: Onboarding Repair & Tutorial Wiring'
status: done
priority: high
labels:
  - sprint
  - mvp
  - onboarding
createdAt: '2026-04-13T03:07:51.912Z'
updatedAt: '2026-04-13T03:07:51.912Z'
timeSpent: 0
---
# MVP Sprint: Onboarding Repair & Tutorial Wiring

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Sprint to get Star Sailors to a shippable MVP. Focus: fix broken onboarding, wire the tutorial
system, remove alpha signals. Prerequisite for any public launch.

Analysed 2026-04-13. See doc `incomplete-tickets-reference-2026-04-13` for the full ticket archive.
<!-- SECTION:DESCRIPTION:END -->

---

## MVP Analysis — 2026-04-13

### What the game is
Star Sailors is a citizen science PWA where users deploy four "structures" (Telescope, Satellite,
Rover, Solar Observatory) and classify real astronomical data (TESS light curves, Mars terrain,
orbital imagery, SDO sunspot images). The hub (`/game`) is the mission control screen.

### Current state: what works
- **Hub layout** — Two-column grid (left: mission brief + sector radar + structure cards; right:
  referrals + mission log + leaderboard + coral fishtank). Solid structure.
- **StationNav** — Bottom mobile nav with console-button-style press animation. Polished.
- **HUDStrip** — Three live metrics (Signals / Pending / Classifications) with odometer animation.
  Already resolved ticket 9ztpbl — metrics and position were decided in code.
- **AnimatePresence transitions** — Base ↔ viewport transitions are smooth (scale + opacity).
- **LivingWorldBg + TelescopeBackground** — Ambient layers load deferred, no jank.
- **MissionBriefCard** — Contextual CTA adapts to state (boot / progress / alert). Good.
- **Referral system** — Wired and functional.
- **Onboarding flow** — Intro → project-selection (all 5 projects, including asteroid+solar which
  were believed missing but were already in onboarding-data.ts) → structure-intro → /setup/*.
- **API routes** — All write paths migrated to server routes. No client-side mutations.
- **PostHog + Sentry** — Instrumented.

### Current state: what's broken or missing for MVP

#### Critical — blocks first-run experience entirely
| Ticket | Issue | File |
|--------|-------|------|
| task-ob1 | GalaxyZoo `showTutorial` both branches render same component — classification form never shown | `src/components/projects/Telescopes/GalaxyZoo.tsx:247` |
| task-ob2 | All `data-tutorial` highlight selectors in TutorialWrapper point to elements that don't have those attributes — tutorial highlights render at (0,0) | `TutorialWrapper.tsx` + structure/deploy components |
| task-ob3 | TutorialWrapper, TELESCOPE_INTRO_STEPS, ROVER_INTRO_STEPS, SOLAR_INTRO_STEPS defined but never mounted anywhere — tutorial system is dead | Setup pages + viewport wrappers |
| task-ob6 | Setup pages (/setup/telescope, /setup/rover, /setup/satellite) drop users into deploy flow with zero guidance | Depends on ob2+ob3 |

#### High — degrades new user retention
| Ticket | Issue |
|--------|-------|
| task-ob5 | Mid-flow onboarding bounce resets to "Station Arrival" — no step persistence |
| task-30-p1 | One remaining item: dark/light mode visual QA pass (all implementation done) |

#### Quick wins
| Ticket | Issue |
|--------|-------|
| task-ob7 | `v3.0.0-alpha` hardcoded in onboarding footer — one-line delete |

### UX rating (pre-sprint)
| Area | Score | Notes |
|------|-------|-------|
| Visual design | 8/10 | Consistent sci-fi dark theme, good animation, colour system cohesive |
| Mobile layout | 7/10 | Bottom nav works well; structure cards horizontal scroll on mobile is acceptable |
| Desktop layout | 7/10 | Right column is content-dense but not overwhelming |
| Responsiveness | 8/10 | `h-[100dvh]`, `pb-[80px] md:pb-0`, breakpoint-aware grid — solid |
| Onboarding UX | 3/10 | Tutorial system completely dead; GalaxyZoo core mechanic broken; alpha watermark visible |
| First-run clarity | 4/10 | MissionBriefCard helps but no guided tutorial means users deploy blind |
| Performance | 7/10 | Dynamic imports on heavy components, deferred ambient layers, 60s polling interval |
| Consistency | 8/10 | Design tokens applied consistently; Nunito headings, mono data, colour per structure |

**Overall MVP readiness: 5/10.** The hub shell is well-built. The onboarding-to-classification
path is broken. No new user can be guided through their first classification without fixes.

### PWA simulation
Skipped — no additional >500MB install required, but running a full Next.js production build +
PWA install cycle was deferred. The `PWAPrompt` component is present and renders after the game
hub loads. Service worker registration and manifest are assumed to be in place from prior work.

### Design elements needed for MVP

The following UI elements need design decisions before the sprint is complete:

1. **Tutorial overlay style** — `InteractiveTutorial.tsx` renders a highlight cutout + tooltip.
   The visual style exists but has never been seen in production. Needs a design review pass
   once ob2+ob3 are implemented to confirm the overlay doesn't clash with dark backgrounds.

2. **Empty state for structure viewports** — When a user visits a structure tab before deploying,
   what do they see? Currently falls through to the classification content even if nothing is
   deployed. Needs a clear "deploy first" empty state per viewport.

3. **`aaigmw` — Typography and colour token spec** — The design token doc is not written.
   This is a pre-existing gap (assigned @Liam). Not blocking the sprint but needed before
   any further design work starts.

4. **Homepage hero, nav IA, about copy** — Tickets `7kznko`, `uayboz`, `u6zo6x`, `xdbtg8`
   are all design/copy todo items. Not in this sprint — parked in the reference doc.

---

## Sprint Tasks (child tickets)

Ordered by dependency:

1. **task-ob7** — Remove alpha watermark (1 line, no deps) ← start here
2. **task-ob1** — Fix GalaxyZoo showTutorial conditional (no deps, isolated)
3. **task-ob2** — Add data-tutorial attributes to DOM elements (enables ob3+ob6)
4. **task-ob3** — Wire TutorialWrapper into routing (depends on ob2)
5. **task-ob5** — Persist onboarding step to localStorage (no deps)
6. **task-ob6** — Wrap setup pages with TutorialWrapper (depends on ob2+ob3)
7. **task-30-p1** — Visual QA pass on dark/light mode tokens (sign-off gate)

## Questions before implementation

Before starting ob3 and ob6, answers needed:

1. Should the tutorial auto-start on first visit, or require the user to click "Start Tutorial"?
   (TutorialWrapper currently auto-starts based on `hasTutorialCompleted` check)

2. For the GalaxyZoo fix (ob1): should "Return to Task" show a standalone classification panel,
   or should it skip to the step after tutorial completion inside GalaxyZooTutorial? The latter
   is simpler; the former is more correct UX.

3. Is there a mobile-specific design concern for the tutorial overlay highlight cutout?
   375px is tight for a tooltip + highlight simultaneously.
