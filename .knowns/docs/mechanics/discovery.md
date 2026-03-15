---
description: Overview of the discovery mechanic in frontend
updatedAt: '2026-03-17T00:00:00Z'
title: Discovery Mechanic
---
# Discovery Mechanic

## Purpose

Surface discoveries generated from classifications/deployments, including anomalies, milestones, and data-source visualisations.

## Terminology (Confirmed 2026-03-17)

These are the canonical meanings — contextual usage differs:

| Term | Meaning | When to use |
|------|---------|-------------|
| **Signals** | What a structure is actively detecting/finding | HUD context, active detection — "3 signals detected" |
| **Anomalies** | Scientific data awaiting investigation/classification | Pending work — "You have 4 anomalies to classify" |
| **Discoveries** | Confirmed finds post-classification | Achievement context — "Your discoveries: 42" |

## Component Areas

- `src/components/discovery/`
- `src/components/discovery/data-sources/`
- `src/components/discovery/milestones/`
- `lib/discoveries.ts`

## Primary Routes

- `app/planets/[id]/page.tsx`
- `app/posts/[id]/page.tsx`
- `app/extraction/[id]/page.tsx`
- `app/leaderboards/sunspots/page.tsx`

## Core Data Dependencies

- `classifications`
- `profiles`
- gameplay/milestone API responses

## Notes

- Discovery cards and related UI are strongly tied to classification type mapping
- Mineral discovery and extraction are discovery-to-deployment bridge features
- "Discoveries" shown on profile/inventory, never "Anomalies" in achievement contexts
