---
description: Overview of the onboarding mechanic in frontend
updatedAt: '2026-02-19T07:56:35.636Z'
title: Onboarding Mechanic
---
# Onboarding Mechanic

## Purpose

Guide first-time users through project selection, tutorials, structure setup, and first successful gameplay loops.

## Component Areas

- `src/components/onboarding/`
- `src/components/onboarding/InteractiveTutorial.tsx`
- `src/components/onboarding/ProjectSelectionViewport.tsx`
- `src/components/onboarding/ProjectPreferencesModal.tsx`

## Primary Routes

- `app/setup/telescope/page.tsx`
- `app/setup/satellite/page.tsx`
- `app/setup/solar/page.tsx`
- `app/setup/rover/page.tsx`
- `app/game/page.tsx`

## Core Data Dependencies

- `classifications` (first-run and progression checks)
- `profiles`
- user preference/tutorial flags

## Notes

- Onboarding flow controls first meaningful action timing.
- Tutorial and preference completion should remain idempotent.
