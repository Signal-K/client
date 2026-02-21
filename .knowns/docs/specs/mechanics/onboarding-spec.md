---
description: Specification for onboarding mechanic behavior
updatedAt: '2026-02-19T07:56:37.333Z'
title: Onboarding Spec
---
# Onboarding Spec

## Goal

First-time users can reach first meaningful action quickly with guided setup and clear tutorial steps.

## User Stories

- As a new user, I can select projects/interests and understand what to do next.
- As a new user, I can complete tutorial/setup steps for core structures.
- As a returning user, I am not repeatedly forced through completed onboarding.

## Acceptance Criteria

- Onboarding/tutorial steps are shown conditionally from persistent state.
- Setup routes provide clear continuation back to gameplay surfaces.
- Completion flags are idempotent and prevent repeated forced onboarding.
