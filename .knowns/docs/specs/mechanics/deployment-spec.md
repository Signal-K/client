---
description: Specification for deployment mechanic behavior
updatedAt: '2026-02-19T07:56:36.392Z'
title: Deployment Spec
---
# Deployment Spec

## Goal

Users can deploy structures and receive new unlockable gameplay opportunities tied to deployment outputs.

## User Stories

- As a player, I can deploy an eligible structure from deployment routes.
- As a player, I can see deployment status and unlock state per structure type.
- As a player, deployment unlock timing follows the user fast-deploy rule when applicable.

## Acceptance Criteria

- Deploy action persists deployment data and links relevant anomaly/discovery context.
- Deployment UI reflects ready/locked states by prerequisites and unlock windows.
- Already completed classification targets are excluded from active deployment queues.
