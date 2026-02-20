---
description: Specification for classification mechanic behavior
updatedAt: '2026-02-19T07:56:36.196Z'
title: Classification Spec
---
# Classification Spec

## Goal

Users can submit valid classifications across supported projects and see them reflected in progression/discovery systems.

## User Stories

- As a player, I can open a classification viewport from supported routes.
- As a player, I can submit a classification and get immediate UI feedback.
- As a player, my submitted classification contributes to stardust, milestones, and discovery feeds.

## Acceptance Criteria

- A successful submission writes to `classifications` with a valid `classificationtype`.
- Submission errors are surfaced with user-visible messaging.
- New records are reflected in game/discovery panels without requiring hard refresh.
