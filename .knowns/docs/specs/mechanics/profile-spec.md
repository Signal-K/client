---
description: Specification for profile mechanic behavior
updatedAt: '2026-02-19T07:56:37.148Z'
title: Profile Spec
---
# Profile Spec

## Goal

Users can authenticate, complete profile setup, and maintain persistent identity/state across sessions.

## User Stories

- As a user, I can sign in with supported auth options.
- As a user, I can complete required profile fields.
- As an anonymous user, I can convert to a permanent account.

## Acceptance Criteria

- Auth routes initialize session state without blocking core game entry.
- Required profile fields are enforced where gating is intended.
- Anonymous conversion preserves progression data continuity.
