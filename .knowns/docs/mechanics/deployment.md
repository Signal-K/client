---
description: Overview of the deployment mechanic in frontend
updatedAt: '2026-03-17T00:00:00Z'
title: Deployment Mechanic
---
# Deployment Mechanic

## Purpose

Enable users to deploy structures (telescope/satellite/rover/etc.) that unlock new classification opportunities and progression loops.

## Project Selection vs Structure Deployment

**Project selection happens BEFORE structure deployment.**
- User picks their science interests during onboarding (ProjectSelectionViewport)
- Their chosen project determines which structure they deploy first
- Telescope is NOT always the first structure — it depends on what the user wants to do
- Example: user interested in Cloudspotting on Mars → deploy Satellite first

## Deployment Flow

1. User selects a project they want to participate in
2. Project determines which structure is required
3. User navigates to the relevant deploy route
4. System checks if structure is already deployed in past 7 days
5. User selects parameters (mode, target planet, waypoints, etc.)
6. System allocates 4-6 anomalies from the respective anomaly set
7. Creates `linked_anomalies` rows linking user to anomalies
8. Anomalies appear in the respective viewport for classification

## First Deployment

- New users must see a **guided overlay** for their first deployment (not a cold drop)
- `InteractiveTutorial.tsx` provides the interactive scaffold
- Fast Deploy gift: first-time deployments unlock all anomalies immediately (not daily schedule)

## Deployed Structure Visual States

Two distinct visual states required on structure cards:
- **Standby (no active signals):** Muted/greyed glow, "Standby" label — structure deployed but nothing pending
- **Active (pending anomalies):** Pulsing border, "Signals awaiting" label — anomalies ready to classify

## Solar Structure

- Solar is treated differently: user **joins a mission** rather than deploying their own
- Needs a different card visual treatment from Telescope/Rover/Satellite
- Different CTA copy: "Join Mission" not "Deploy"

## Component Areas

- `src/components/deployment/structures/`
- `src/components/deployment/missions/`
- `src/components/deployment/extraction/`
- `src/components/modals/PlanetSelectorModal.tsx`

## Primary Routes

- `app/activity/deploy/page.tsx` — telescope deployment
- `app/activity/deploy/roover/page.tsx` — rover deployment
- `app/viewports/satellite/deploy/page.tsx` — satellite deployment
- `app/structures/telescope/page.tsx` — telescope viewport
- `app/structures/balloon/page.tsx` — satellite viewport
- `app/structures/cameras/page.tsx` — camera/biodome viewport
- `app/structures/seiscam/page.tsx` — seismic viewport

## Core Data Dependencies

- `deployments`
- `linked_anomalies`
- `classifications`
- `researched`

## Notes

- Fast deploy for new users changes unlock timing behaviour
- Deployment state is filtered by already-classified anomaly IDs
- Satellite deployment requires at least one classified planet first
- Rover uses waypoint-based deployment (4-6 waypoints = 4-6 classifications)
