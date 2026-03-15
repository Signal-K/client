# Spec: Star Sailors 3.0 Unified Web Client

## Status: Active
## Priority: High
## Owner: Engineering
## Updated: 2026-03-17

---

## Overview

Star Sailors 3.0 is a comprehensive redesign of the web client. The primary objective is a single conversion event: **Sign Up / Launch Web Client**. The redesign transitions from a static marketing landing page to a unified, mobile-first, portrait-mode "Game Hub" that evokes curiosity and pulls users into the game as fast as possible.

The web client is the central entry point to the Star Sailors universe. Users can either enter here (meeting characters, building their world, deploying structures) or from a standalone experiment (minigame), which can live standalone or connect to the larger narrative.

---

## 1. Vision & Brand

| Attribute      | Definition |
|----------------|------------|
| **Primary CTA** | Sign Up / Launch Web Client |
| **Emotion**    | Curiosity — pull users in, don't explain |
| **Persona**    | Minimalist + Playful + High-Tech Sci-Fi |
| **Visual feel** | Portrait-mode game, star textures, sunbursts, abstract sci-fi patterns |
| **Palette**    | Teal-400 / Amber-400 / Sky-400 (retained). No new core brand colour needed. |
| **Typography** | Slightly curly but not too decorative (see: Nunito / DM Sans). Technical mono for data. |
| **Dark mode**  | Full dark/light mode toggle. No high-contrast AAA required but WCAG AA minimum. |

---

## 2. Audience & Flow

### Target Users
- **Entry level:** Casual gamers with mild science curiosity
- **Core users:** Citizen science enthusiasts who want depth
- **Power users:** Researchers using data outputs

### Golden Path (New User)
1. Land on `/apt` (guest) → Hero explains the game: how it works, what the user does, the point
2. Browse structure/project preview strip → understand the options
3. Sign up via primary CTA → **Dedicated onboarding route** (not `/game`)
4. Project preference selection → picks science projects they want to do
5. Project drives which structure to deploy first (Telescope is not always first)
6. Guided overlay walks user through first deployment
7. Start classifying → first science contribution made

### Logged-In Return Path
- **`/apt` redirects to `/game` for authenticated users** — `/apt` is acquisition-only
- `/game` IS the hub/dashboard (they are the same thing)
- "Resume" CTA points user to the view showing deployable/active structures for investigation

### Guest Accounts
- Guest accounts are not coming back. Auth is always required to make a science contribution.

### Experiment → Web Client Bridge
- The web client IS the full version of the game (not "deep version of experiments")
- Standalone experiments (Rocket Missions, Saily, etc.) are separate products in the ecosystem
- Movements from web client → other games/experiments should fire a PostHog event tracking the destination

---

## 3. Technical Architecture

### Framework
- **Next.js 15+**, React 19
- **Partial Prerendering (PPR)** on `/apt` landing page — static shell, dynamic user slot
- **Server Components** for all data-fetching (Prisma stats, structure lists)
- **Server Actions** for all mutations (structure deployments, project joins, survey responses)
- Zero `"use client"` unless unavoidable (animation triggers, interactive maps)

### Data
- **Prisma** for active user counts, discovery metrics, structure data
- No hardcoded stats — all db-backed with revalidation
- CMS not needed; admin views via Prisma + Next.js admin route (future)

### Analytics
- **PostHog** event tracking on all CTAs, page views, card interactions
- **Micro-surveys** (see section 7) — not PostHog NPS widget, custom inline components
- **Sentry** error boundaries on all major page sections

---

## 4. Page Architecture

### `/apt` — Landing Page

#### Guest View
```
[Nav] — Wordmark + "Full Guide" link + "Games Ecosystem" link
[Hero] — Explains the game: what it is, how it works, what the user does
        Primary CTA: "Launch Web Client" → /auth
        NO social proof / active users count
[Structure Preview Strip] — 3 cards (Telescope / Rover / Satellite)
                            Order does not imply recommended entry point — user chooses
                            Cards should NOT show session length indicators (not implemented)
[About Strip] — "Play games. Do real science." (keep)
[Footer CTA Band] — "Ready to explore?"
```

**Hero copy strategy:** Must explain the game. Not a question, not just a tagline. Users need to understand:
- What they're doing (classifying real scientific data)
- Why it matters (contributes to actual research)
- How it's gamified (structures, stardust, progression)

#### Logged-In View
- **Redirect to `/game`** — authenticated users should never see the acquisition landing
- Server-side auth check → `redirect('/game')` if session found
- `/apt` is acquisition-only

### `/game` — Game Hub (Centralized Navigation)
- **This IS the dashboard** — `/game` and "dashboard" and "hub" are the same thing
- **Primary navigation:** Tapping a structure card in the hub navigates directly to that structure's viewport. Bottom nav bar is secondary (also works, but cards are the primary path).
- Bottom navigation bar: Telescope / Rover / Satellite / Inventory / Solar
- PPR: server-render structure list, client-hydrate interactive tabs
- Mobile-first portrait layout — **no vertical scrolling required** to fit main content
- **Mission Brief Card** must always be visible above fold on mobile
- **Sector Radar / Star Map** (confirmed: star map / zone of space):
  - Implemented as a star map showing a zone of space where the user's deployed structures exist
  - NOT concentric rings — users may have hundreds of planets, rings don't scale
  - Tap a structure → navigate to its viewport or deploy route
  - Zoom in on the map → secondary view for a specific entity/location
  - Structures animate subtly on the map (satellites orbit, rover moves, telescope points)
  - **Hidden until at least one structure is deployed**
  - When 0 structures: show a "What do you want to do today?" prompt with clickable entities/options, plus an "Add project" button
- Profile/level/stardust lives in the **header dropdown** (not on the main view)

#### Persistent HUD Strip
A minimal persistent strip at the top/bottom of the hub view (always visible) showing:
- Active signals detected (from `linked_anomalies` table)
- Pending anomalies to classify
- Other key metrics tied to user actions (TBD during implementation)
- Does NOT clutter — keep it to 2–3 numbers max

#### Add Project Button
- Users can add new projects after onboarding via an explicit "Add" button on the hub
- This opens the project selection view (same as used in onboarding) without restarting onboarding
- Required because early-game users may not have chosen all available projects during onboarding

#### Hub Layout Constraints
- No vertical scrolling on the main hub view — all key info must fit within the viewport
- Mission brief always above fold
- Vertical stacking preferred; **some horizontal scrolling within sections is acceptable** (e.g. a horizontal strip of structure cards) but must not be overabundant
- Deployed structure cards adapt as user progresses (more structures = different layout)
- Power-user layout adaptation (4 structures + hundreds of classifications): **deferred to sprint 7+**

---

## 5. Visual Language

### Textures & Backgrounds
- **Star field:** CSS `radial-gradient` points with parallax — used as living background for hub (see Living World spec)
- **Sunburst:** Behind hero CTA, behind active structure cards
- **Sci-fi grid:** Used as card backgrounds, data panels
- **Glass morphism: CONFIRMED** — card overlays with `backdrop-blur` + subtle border. This is the primary card aesthetic throughout.

### Structure Colour System (Confirmed)
Each structure type owns one accent colour across the entire UI — colour alone should identify the structure:
| Structure | Accent |
|-----------|--------|
| Telescope | `teal-400` |
| Rover | `amber-400` |
| Satellite | `sky-400` |
| Solar | Shared/community — distinct glow, TBD (not one of the 3 personal colours) |

This system applies to: card borders, map icons, HUD indicators, signal animations, badges.

### Hub Perspective (Confirmed)
- The user is **the operator** — hub feels like you're inside a space station looking out
- Warm, enclosed feel — you are in the station, not viewing it from space
- Multiple hub views (e.g. exterior overview) are **deferred to sprint 7+**
- Future: image generation for hub environment backgrounds

### Characters & Personalities
- **Rovers have personalities** — they are non-living but characterful agents
- **Structures have personalities** — a telescope "feels" different from a rover
- Future (V4+): construction on other planets with astronaut characters; potential alien characters once SETI citizen science is integrated
- These personalities should be present in copy, idle animations, and status messages

### Motion & Micro-interactions
- Card hover: slight `scale(1.02)` + border glow
- CTA button: pulse on idle > 3s
- Loading states: animated star-dot spinners (not generic spinners)
- Structure deploy: orbit animation (planet orbiting)
- Progress bars on classification streaks
- **Incoming signals must animate** — not just a static badge. A data wave or scan line sweeping across the card when signals arrive.
- **Numbers count up** (odometer/ticker style) when values change — stardust, signal count, discoveries. Feels rewarding.
- **No visible reloads** — use Next.js fast component loading, no full-page transitions
- Section reveals: **staggered** (each section fades up independently), not grouped
- **Sound design: deferred to sprint 7+** (≈ 2026-04-28)

### Viewport → Hub Continuity (Confirmed: Crashlands model)
- Tapping into a structure viewport should feel like **zooming in** to the hub world, not leaving it
- The hub is "home" — viewports are part of the same persistent world
- Visual continuity: shared background, colour language, and transition style between hub and viewports
- Route transition: zoom-in animation rather than a hard cut or fade

### Typography
- **Display/Headings:** Nunito (curly but clean, good on mobile)
- **Body:** Inter or DM Sans
- **Data/Code:** `font-mono` (existing)
- Load via `next/font` (local or Google, tree-shaken)

---

## 6. Project Cards & Information Architecture

### Structure (current: `/game` StructureCard)
Priority order for card info:
1. Structure type + icon (immediate recognition)
2. Active project names (what science is happening here)
3. Gameplay style badge (Classify / Survey / Deploy)
4. ~~Session length indicator~~ — **REMOVED** (never implemented, not a known data point)

#### Deployed Structure Visual States (Confirmed)
- **Standby (deployed, no active signals):** Powered down — greyscale/dim/cold. Implies the game is waiting, not the user. Users see this and understand their structure exists but there's nothing to do right now.
- **Active (deployed with pending anomalies):** Soft ambient glow (not aggressive pulsing). Breathes slowly. Colour = structure's accent colour. "Signals awaiting" label. Does not aggressively push the user.
- **Incoming signal animation:** When new signals arrive, animate them — a data wave / scan line sweeps across the card. Not just a badge update.

#### Solar Structure (Confirmed)
- Solar is treated differently: user joins a mission rather than deploying their own
- **Same area** as personal structures on the map/hub — not segregated
- **Different visual treatment:** a community glow around the card (distinct from personal structure glows, shared feel)
- CTA copy: "Join Mission" not "Deploy"
- Does not require deployment — always present as a joinable mission

### Scalability
Cards use CSS grid auto-fill — adding a 5th, 6th, 10th card is automatic.

### Click-A-Coral (Revised)
- **NOT on the landing page** — moved to in-game hub
- In `/game`: a fishtank decoration element in the hub
- Clicking the fishtank shows a message: "The Coral game lives at a different frontend — coral.starsailors.space"
- Links to `coral.starsailors.space`
- PostHog event: `coral_fishtank_clicked`

---

## 7. Living World Background
See full spec: `.knowns/docs/specs/living-world.md`

The hub background is a persistent, animated space environment — not a static wallpaper. It communicates the state of the world at a glance and makes the game feel alive even when the user is idle.

### Core Elements
- **Parallax star field** with different colours/sizes for different object types
- **Classified anomaly labels** visible in the background (your planets, asteroids with their names)
- **Community vehicles** — other users' satellites, rovers, structures pass through your view
  - Tap/pause on a passing vehicle to see what's happening ("Sailor [x]'s satellite is scanning [planet y]")
  - Newly deployed community structures appear when you return after an absence
- **Animated structures** — your deployed satellite orbits, rover moves, telescope sweeps

### Future Phases (Sprint 7+)
- Things growing on planet surfaces (vegetation, structures, events)
- Solar flares and space weather events visible in background
- These events become interactive → pathway to new mechanics
- Image generation for hub environment backgrounds

### Full Spec
See `.knowns/docs/specs/living-world.md` for implementation detail.

---

## 8. Onboarding Visual Experience (Confirmed)

### Intro Sequence
New users get a brief intro animation before project selection:
- Station powering up sequence (lights flickering on, systems coming online)
- First signals arriving (data wave sweeping across)
- Sets the scene before any UI choices are required
- Keep it brief — must not block the user or feel like a loading screen

### "Building the Hub" Model (Option A confirmed)
- Onboarding shows an **empty station schematic** that builds itself as the user makes choices
- User picks Telescope project → telescope icon appears on the star map
- Each choice feels spatial and consequential — you are building something
- By the time onboarding completes, the user has a partially populated hub
- This is NOT a spotlight on a pre-built environment — the station starts empty

---

## 9. Micro-Surveys

### Design Principles
- Integrated into game flow — look like UI elements, not forms
- Single-question, max 3 options, dismissable
- Triggered by events (completed classification, deployed structure, first login)
- Data stored via Server Action → Prisma
- PostHog receives the same event for cross-referencing

### Survey Triggers (initial set)
| Trigger | Question |
|---------|----------|
| First classification submitted | "What drew you to this project?" [Science / Game / Both] |
| Structure deployed | "How'd that feel?" [Easy / Confusing / Need help] |
| 5th classification in session | "Would you try a standalone experiment for this?" [Yes / Maybe / I prefer this] |
| Return visit after 3+ days | "What brings you back?" [Progress / Science / Curiosity] |

---

## 10. Language & Terminology

Current terms to simplify in UI copy (not in code):
| Technical | User-facing |
|-----------|------------|
| Anomalies | Things that need to be investigated (pending classification) |
| Signals | What a structure is actively detecting/finding |
| Discoveries | Confirmed finds post-classification (achievement context) |
| Mechanics | How it works |
| Ecosystem | Universe / World |
| Classification | Observation / Scan |
| Deploy structure | Set up your [Telescope / Rover] |

### Contextual Usage
- **Signals** = structure is finding something (HUD, active detection, "3 signals detected")
- **Anomalies** = things awaiting investigation ("You have 4 anomalies to classify")
- **Discoveries** = what the user has confirmed/found ("Your discoveries: 42")
- Brand name is just "Star Sailors" — no tagline below the wordmark

---

## 11. Growth & Social Features

### Referral System
- **Referral is the primary growth mechanic for 3.0**
- Agency Network card in hub shows referral code + invite link
- Every cross-game navigation (web client → experiment/other game) fires PostHog event with destination
- Referral tracking: who came from whom, which experiment drove them here

### Leaderboard
- A leaderboard IS part of the 3.0 layout
- Location: within the hub (specific placement TBD in hub design phase)
- Primary axis: classification count or stardust (TBD)

### Community Activity
- Activity feed is behind a slide-in sheet on `/game` (current)
- Making community activity more prominent: **open question, deferred**

---

## 12. Deferred Features (Sprint 7+, ≈ 2026-04-28)

| Feature | Sprint | Notes |
|---------|--------|-------|
| Sound design | 7+ | No sound in sprints 1–6 |
| UI power-user modes (0 / 1–5 / many classifications) | 7+ | Three distinct layout modes |
| Activity feed prominence rethink | 7+ | Low priority now |
| Multiple hub views (exterior / overview) | 7+ | Currently: operator inside station |
| Image generation for hub environments | 7+ | — |
| Living world: surface growth, space weather events | 7+ | Phase 2 of living-world spec |
| V4 space stations, astronaut characters | V4 | Many months away |
| SETI citizen science integration | V4+ | Alien characters are far-future |

---

## 13. SEO & Social

- OG image per experiment (generated via `@vercel/og` or static per project)
- Meta description focuses on "play" first, "science" second
- Keywords: citizen science game, space game, real science game, exoplanet game
- Each project card shareable with its own OG image

---

## 14. Performance Targets

- `/apt` TTI: < 1.5s on 3G (hero + CTA above fold, defer everything else)
- LCP: hero image / headline < 2.5s
- No client JS on initial landing page render (PPR + Server Components)
- WebP for all photos, SVG for icons, no Lottie (too heavy) — CSS animations only

---

## 15. Components to Create / Update

| Component | Action | Notes |
|-----------|--------|-------|
| `src/app/apt/page.tsx` | Rewrite | Server Component + PPR + redirect logged-in users |
| `src/app/game/page.tsx` | Refactor | Server shell + client islands, hub = dashboard |
| `src/app/onboarding/page.tsx` | Create | Dedicated onboarding route for new sign-ups |
| `src/components/landing/HeroSection` | Create | Explains game: what/how/why, no social proof |
| `src/components/landing/StructurePreviewCard` | Create | Guest-facing structure teaser, no session length |
| `src/components/survey/MicroSurvey` | Create | In-game feedback widget |
| `src/components/layout/ViewportShell` | Update | Already exists, needs 3.0 tokens |
| `src/components/game/CoralFishtank` | Create | Decorative fishtank in hub → coral.starsailors.space |
| `src/components/game/SectorRadarMap` | Create | Navigational map (tap to go to structure) |
| `src/components/game/Leaderboard` | Create | In-hub leaderboard |
| `tailwind.config.ts` | Update | New font, animation tokens |
| `src/styles/globals.css` | Update | Nunito font, new CSS vars |

---

## 16. Phase Plan

| Phase | Focus | Ticket IDs |
|-------|-------|------------|
| 1 | Design tokens, fonts, theme | task-30-p1-* |
| 2 | `/apt` landing page rewrite + auth redirect | task-30-p2-* |
| 3 | Auth redirect + dedicated onboarding route | task-30-p3-* |
| 4 | Hub layout: no-scroll, radar, mission brief | task-30-p4-hub-* |
| 5 | Micro-survey system | task-30-p5-* |
| 6 | PostHog expansion + Sentry + cross-game tracking | task-30-p6-* |
| 7 | Prisma-backed stats | task-30-p7-* |
| 8 | Structure visual states + guided deploy overlay | task-30-p8-* |
| 9 | Coral fishtank + leaderboard + referral growth | task-30-p9-* |
| 10 | Server Actions migration | task-30-p10-* |
| 11 | Performance audit + polish | task-30-p11-* |
