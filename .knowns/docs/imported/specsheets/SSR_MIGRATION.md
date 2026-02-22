---
title: "SSR Migration Plan"
---

# SSR Migration Plan

## Goal
Move all database reads/writes to server-side execution (SSR/server routes/server actions) and remove client-side direct DB queries.

## Current State
- Prisma is now the server-side DB layer.
- `app/api/*` CRUD/query usage of `supabase.from(...)` has been migrated to Prisma-backed SQL.
- Remaining client-side DB query surfaces currently detected by `yarn ssr:check`: `65` files.

## Rules
- No direct DB queries in client components/hooks.
- Client components should call:
  - server routes under `app/api/*`, or
  - server actions from server components.
- Prisma is only used on the server.
- Supabase client remains for auth/session and storage where needed.

## Execution Phases
1. Convert high-traffic hooks/pages first (`hooks/usePageData.ts`, inventory, planets, telescope views).
2. Replace client `supabase.from(...)` flows with dedicated Prisma-backed API routes.
3. Move page-level data loading into server components where possible.
4. Keep interactivity in client components with hydrated props + mutation-only API calls.

## Guardrail
Run:

```bash
yarn ssr:check
```

This fails if client files still contain direct DB query patterns (`useSupabaseClient/getSupabaseBrowserClient` + `.from(...)`).
