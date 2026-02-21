---
description: Overview of the discovery mechanic in frontend
updatedAt: '2026-02-19T07:56:34.837Z'
title: Discovery Mechanic
---
# Discovery Mechanic

## Purpose

Surface discoveries generated from classifications/deployments, including anomalies, milestones, and data-source visualizations.

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

- Discovery cards and related UI are strongly tied to classification type mapping.
- Mineral discovery and extraction are discovery-to-deployment bridge features.
