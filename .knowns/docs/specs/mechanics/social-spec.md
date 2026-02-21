---
description: Specification for social mechanic behavior
updatedAt: '2026-02-19T07:56:36.964Z'
title: Social Spec
---
# Social Spec

## Goal

Users can interact with other players around discoveries through posts, comments, and activity surfaces.

## User Stories

- As a player, I can open a discovery post and view its context.
- As a player, I can participate in social interactions tied to discoveries.
- As a player, I can view community leaderboards/activity.

## Acceptance Criteria

- Social pages resolve source discovery data by classification ID.
- Missing content states are handled without runtime errors.
- Community views (activity/leaderboard) load and render user-safe fallbacks.
