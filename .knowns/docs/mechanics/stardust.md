---
description: Overview of the stardust economy mechanic in frontend
updatedAt: '2026-02-19T07:56:35.821Z'
title: Stardust Economy Mechanic
---
# Stardust Economy Mechanic

## Purpose

Represent progression currency derived from gameplay activity and consumed by research upgrades.

## Component Areas

- `src/components/stardust/`
- `app/game/page.tsx`
- `src/hooks/useMilestones.ts`
- `src/hooks/useAchievements.ts`

## Primary Routes

- `app/game/page.tsx`
- `app/research/page.tsx`

## Core Data Dependencies

- `classifications` (earn side)
- `researched` (spend side)

## Notes

- Current base rule: classification count is primary earn signal.
- Remaining spendable balance is derived from researched tech costs.
