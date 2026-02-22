---
title: "Component And Page Consolidation Audit"
---

# Component And Page Consolidation Audit

Date: 2026-02-22

## Scope

Preserve gameplay mechanics and progression loops while reducing filesystem sprawl and route coupling.

## Completed In This Pass

1. Route coupling cleanup:
   - Removed route-to-route imports from structure pages.
   - Replaced with explicit auth redirect/guard behavior.
2. Feature migration:
   - Game dashboard components moved to `src/features/game/components/*`.
   - Setup scaffold moved to `src/features/setup/components/SetupScaffold.tsx`.
   - Push notification prompt moved to `src/features/notifications/components/PushNotificationPrompt.tsx`.

## Merge/Consolidation Candidates (Next Pass)

1. Deploy shells:
   - `app/activity/deploy/page.tsx`
   - `app/viewports/satellite/deploy/page.tsx`
   Shared visual shell and navbar behavior can be extracted into one feature wrapper.

2. Rover shells:
   - `app/viewports/roover/page.tsx`
   - `app/activity/deploy/roover/page.tsx`
   Candidate for shared route shell + mode-specific subview.

3. Legacy structure pages:
   - `app/structures/balloon/page.tsx`
   - `app/structures/cameras/page.tsx`
   Both contain large inline page UIs that should move into feature components.

## Product Integrity Check

- Deploy -> identify/classify -> visit/interact loops remain intact.
- Stardust/reward/progression mechanics were not modified.
- Chapter/process flows were not removed.

