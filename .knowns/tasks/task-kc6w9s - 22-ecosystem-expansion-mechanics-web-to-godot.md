---
id: kc6w9s
title: "2.2 ecosystem expansion mechanics web to godot"
status: in_progress
priority: medium
labels:
  - migration-2.2
  - ecosystem
  - mechanics
  - godot
  - roadmap
specRefs:
  - "specs/migration/two-two-migration"
spec: "specs/migration/two-two-migration"
specPath: ".knowns/docs/specs/migration/two-two-migration.md"
createdAt: '2026-02-26T18:25:00Z'
updatedAt: '2026-02-26T21:02:00Z'
timeSpent: 0
---

# 2.2 ecosystem expansion mechanics web to godot

## Description

Design and prioritize cross-surface mechanics that connect the text-first web client with focused Godot minigames for citizen science projects (for example mining/prospecting loops for Planet Hunters).

## Acceptance Criteria

- [x] #1 Shared progression contract is proposed (identity, inventory, rewards, cooldowns)
- [x] #2 At least three minigame-ready mechanic loops are specified with web integration points
- [x] #3 Rollout sequencing is defined (pilot game, telemetry, progression rewards)
- [x] #4 PostHog event schema is proposed for cross-client evaluation

## Implementation Notes

- Spec added:
  - `.knowns/docs/specs/migration/ecosystem-expansion-mechanics-web-godot.md`
- Includes:
  - unified identity + reward ledger contract
  - idempotency/cooldown rules
  - three concrete loop designs
  - rollout phases
  - PostHog cross-client event schema
- Implemented first in-game bridge surface:
  - Added `EcosystemMissionsCard` to `/game` dashboard to connect active web loops with upcoming Godot mission direction.
  - File: `src/features/game/components/EcosystemMissionsCard.tsx`
  - Mounted in: `src/app/game/page.tsx`
- Added dedicated ecosystem hub route for player-facing expansion context:
  - `src/app/ecosystem/page.tsx`
  - wired into account dropdown via `MainHeader` (`Ecosystem Hub`)
- Added unit coverage:
  - `tests/unit/features/game/EcosystemMissionsCard.test.tsx`
- Validation:
  - `yarn lint` passes
  - `npm run test:unit` passes (`125` files, `1029` tests)
