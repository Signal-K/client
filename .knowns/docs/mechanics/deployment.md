---
description: Overview of the deployment mechanic in frontend
updatedAt: '2026-02-19T07:56:34.658Z'
title: Deployment Mechanic
---
# Deployment Mechanic

## Purpose

Enable users to deploy structures (telescope/satellite/rover/etc.) that unlock new classification opportunities and progression loops.

## Component Areas

- `src/components/deployment/structures/`
- `src/components/deployment/missions/`
- `src/components/deployment/extraction/`
- `src/components/modals/PlanetSelectorModal.tsx`

## Primary Routes

- `app/activity/deploy/page.tsx`
- `app/structures/telescope/page.tsx`
- `app/structures/balloon/page.tsx`
- `app/structures/cameras/page.tsx`
- `app/structures/seiscam/page.tsx`

## Core Data Dependencies

- `deployments`
- `classifications`
- `researched`

## Notes

- Fast deploy for new users changes unlock timing behavior.
- Deployment state is filtered by already-classified anomaly IDs.
