---
title: "Filesystem Organization (Next.js + Feature Components)"
---

# Filesystem Organization (Next.js + Feature Components)

Date: 2026-02-22

## Goal

Keep Next.js route contracts in `app/` while organizing implementation code by product feature under `src/features/`.

## Structure

- `app/`
  - Route handlers, route pages, layout files, API routes only.
  - No importing other route files (`app/**/page.tsx`).
- `src/features/`
  - Feature-owned components, hooks, and view models.
  - Current migrated slices:
    - `src/features/game/components/*`
    - `src/features/setup/components/SetupScaffold.tsx`
    - `src/features/notifications/components/PushNotificationPrompt.tsx`
- `src/components/`
  - Shared UI primitives and cross-feature reusable elements.
  - Over time, feature-specific leaves should move into `src/features/*`.

## Rules

1. Route files in `app/` may import from `src/features/*` and shared `src/components/ui/*`.
2. Route files must not import other route files.
3. Feature modules should avoid cross-feature imports unless explicitly shared.
4. Keep gameplay invariants unchanged:
   - deploy -> classify/identify -> visit/interact loops
   - contribution/classification mechanics
   - stardust/reward progression

## Consolidation Candidates

1. Deploy shells:
   - `app/activity/deploy/page.tsx`
   - `app/viewports/satellite/deploy/page.tsx`
   These likely share a common scaffold pattern.
2. Rover shells:
   - `app/viewports/roover/page.tsx`
   - `app/activity/deploy/roover/page.tsx`
   Candidate for shared layout wrapper + mode-specific content.
3. Legacy structure pages with heavy inline UI:
   - `app/structures/balloon/page.tsx`
   - `app/structures/cameras/page.tsx`
   Candidate to extract into feature components and slim route files.

