---
description: Specification for stardust economy behavior
updatedAt: '2026-02-19T07:56:37.519Z'
title: Stardust Economy Spec
---
# Stardust Economy Spec

## Goal

The stardust economy reliably tracks earned value from classifications and spent value from research unlocks.

## User Stories

- As a player, I can see stardust totals in gameplay UI.
- As a player, stardust spend reduces available upgrade budget.
- As a player, my stardust-based progression remains consistent after refresh/login.

## Acceptance Criteria

- Earn side derives from classification records for the active user.
- Spend side derives from researched tech costs for the active user.
- Displayed available stardust is deterministic from current persisted data.
