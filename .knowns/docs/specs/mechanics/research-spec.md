---
description: Specification for research mechanic behavior
updatedAt: '2026-02-19T07:56:36.778Z'
title: Research Spec
---
# Research Spec

## Goal

Users can unlock research upgrades with stardust and see those upgrades affect game capabilities.

## User Stories

- As a player, I can browse available upgrades and their costs.
- As a player, I can unlock an upgrade if I have enough stardust.
- As a player, I can see upgrade effects reflected in dependent mechanics.

## Acceptance Criteria

- Unlock writes a record to `researched` for the acting user.
- Unlock is blocked when stardust is insufficient.
- Dependent features (e.g., extraction access) enforce required research state.
