---
description: Overview of the onboarding mechanic in frontend
updatedAt: '2026-03-17T00:00:00Z'
title: Onboarding Mechanic
---
# Onboarding Mechanic

## Purpose

Guide first-time users through project selection, tutorials, structure setup, and first successful gameplay loops.

## Confirmed Flow (3.0)

1. User completes sign-up → redirected to **`/onboarding`** (dedicated route, not `/game`)
2. Project preference selection — user picks which science projects interest them
3. **Project selection drives structure choice** — the first structure to deploy is determined by their project preferences, NOT always the Telescope
4. Guided overlay walks user through their first deployment
5. First classification completed → redirect to `/game` (hub)
6. Returning users with `onboarding_complete` flag skip `/onboarding` entirely → `/game`

## Component Areas

- `src/components/onboarding/`
- `src/components/onboarding/InteractiveTutorial.tsx` — reusable tutorial scaffold
- `src/components/onboarding/ProjectSelectionViewport.tsx` — project preference picker
- `src/components/onboarding/ProjectPreferencesModal.tsx` — in-game preference modal (returning users)

## Primary Routes

- `app/onboarding/page.tsx` — **dedicated onboarding route** (to be created)
- `app/setup/telescope/page.tsx` — telescope deployment guide
- `app/setup/satellite/page.tsx` — satellite deployment guide
- `app/setup/solar/page.tsx` — solar participation guide
- `app/setup/rover/page.tsx` — rover deployment guide
- `app/game/page.tsx` — destination after onboarding complete

## Guided Overlay

- First deployment must have a **guided overlay** (not a cold drop)
- `InteractiveTutorial.tsx` provides the scaffold — verify it exists and improve if needed
- Steps: element highlighting, tooltip positioning (top/bottom/left/right/center), action-based progression

## Core Data Dependencies

- `classifications` (first-run and progression checks)
- `profiles` (onboarding_complete flag, tutorial_complete flag)
- user preference/tutorial flags

## Notes

- Project preference selection happens BEFORE structure deployment (user chooses what science they want to do)
- Onboarding flow and preference completion must remain idempotent
- Three distinct UI modes based on classification count (0 / 1–5 / power user): **deferred to sprint 7+**
- Sound design during onboarding: **deferred to sprint 7+**
