---
description: Overview of the profile mechanic in frontend
updatedAt: '2026-02-19T07:56:35.441Z'
title: Profile Mechanic
---
# Profile Mechanic

## Purpose

Manage authentication, account identity, setup completion, and user-level personalization.

## Component Areas

- `src/components/profile/auth/`
- `src/components/profile/setup/`
- `src/components/profile/setup/ProfileSetupRequired.tsx`
- `lib/supabase.ts`

## Primary Routes

- `app/auth/page.tsx`
- `app/auth/register/page.tsx`
- `app/account/page.tsx`

## Core Data Dependencies

- `profiles`
- auth session state
- local preference state (`useUserPreferences`)

## Notes

- Anonymous users can convert to permanent accounts.
- Profile completeness gates specific gameplay and social capabilities.
