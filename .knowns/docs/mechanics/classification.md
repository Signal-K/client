---
description: Overview of the classification mechanic in frontend
updatedAt: '2026-02-19T07:56:34.468Z'
title: Classification Mechanic
---
# Classification Mechanic

## Purpose

Allow users to analyze scientific media and submit classifications that drive progression, discoveries, and community outputs.

## Component Areas

- `src/components/classification/`
- `src/components/projects/(classifications)/`
- `src/components/classifications/`
- `src/components/viewports/`

## Primary Routes

- `app/structures/telescope/page.tsx`
- `app/viewports/solar/page.tsx`
- `app/viewports/satellite/page.tsx`
- `app/viewports/roover/page.tsx`
- `app/posts/[id]/page.tsx`

## Core Data Dependencies

- `classifications`
- `deployments`
- `profiles`

## Notes

- Classification count is the base source for stardust.
- Classification diversity and counts feed milestones/achievements.
