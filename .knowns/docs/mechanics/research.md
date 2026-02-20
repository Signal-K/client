---
description: Overview of the research mechanic in frontend
updatedAt: '2026-02-19T07:56:35.038Z'
title: Research Mechanic
---
# Research Mechanic

## Purpose

Provide progression gates and upgrades that unlock or improve deployment, extraction, and classification capabilities.

## Component Areas

- `src/components/research/`
- `src/components/research/SkillTree/`
- `src/hooks/useMilestones.ts`
- `app/research/page.tsx`

## Primary Routes

- `app/research/page.tsx`

## Core Data Dependencies

- `researched`
- `classifications` (for spendable stardust derivation)

## Notes

- Upgrade costs are consumed from classification-derived stardust.
- Research state is referenced by extraction and structure pages for access control.
