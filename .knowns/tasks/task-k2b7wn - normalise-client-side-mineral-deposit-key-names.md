---
id: k2b7wn
title: "Normalise client-side mineral deposit key names to snake_case"
status: not-started
priority: low
labels:
  - cleanup
  - naming-convention
  - frontend
  - backward-compat
createdAt: '2026-02-23T12:00:00Z'
updatedAt: '2026-02-23T12:00:00Z'
timeSpent: 0
---

# Normalise client-side mineral deposit key names to snake_case

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Following the `mineralDeposits` → `mineral_deposits` rename and column standardisation
in **migration 20260223000005**, the API routes were updated to use the new column names.
The `mineral-deposits/bulk/route.ts` was also given a backward-compat normalisation layer
that accepts both old (`mineralconfiguration`/`roverName`) and new (`mineral_configuration`/`rover_name`)
key names from incoming request payloads.

However, three client-side callers still send the old key names. These work correctly today
(the backward-compat layer catches them), but they create a confusing mismatch and the
backward-compat shim should eventually be removed.

This ticket tracks updating the three callers to send the canonical snake_case keys.

### Files requiring update

| File | Lines | Old key | New key |
|---|---|---|---|
| `src/components/projects/(classifications)/PostForm.tsx` | 238, 240 | `mineralconfiguration`, `roverName` | `mineral_configuration`, `rover_name` |
| `src/components/projects/(classifications)/Annotating/useAnnotatorLogic.tsx` | 240, 242 | `mineralconfiguration`, `roverName` | `mineral_configuration`, `rover_name` |
| `src/utils/mineralDepositCreation.ts` | 159 | `mineralconfiguration` | `mineral_configuration` |

Note: `useAnnotatorLogic.tsx` lines 555/557 use a different code path (via
`mineralConfiguration` / `roverName` which maps to a different object shape — check
context before changing).

Note: `src/app/api/gameplay/mineral-deposits/route.ts` line 79 reads `body?.roverName`
from incoming request body. This should also be updated to `body?.rover_name` (with
backward-compat fallback `body?.rover_name ?? body?.roverName`) once all callers are updated.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 `PostForm.tsx` sends `mineral_configuration` and `rover_name` to the API
- [ ] #2 `useAnnotatorLogic.tsx` sends `mineral_configuration` and `rover_name` (all affected paths)
- [ ] #3 `mineralDepositCreation.ts` sends `mineral_configuration`
- [ ] #4 `mineral-deposits/route.ts` reads `body?.rover_name` (with optional old-key fallback until shim removal)
- [ ] #5 Backward-compat normalisation shim in `bulk/route.ts` can be simplified/removed
- [ ] #6 All unit tests pass; no new failures
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
### Why backward-compat was added

The `mineral-deposits/bulk/route.ts` uses `jsonb_populate_recordset` which maps JSON
keys to DB column names. Before the rename, the key `mineralconfiguration` matched the
column directly. After the rename to `mineral_configuration`, old clients would silently
produce `NULL` in the `mineral_configuration` column. The normalisation layer was added
as a safety net.

### Grep to verify after changes

```bash
grep -rn 'mineralconfiguration:\|"roverName"' src/
# Expected: 0 matches after this ticket is complete
# (camelCase 'mineralConfiguration' in local TS props is fine — those are component interfaces)
```

### Which path does useAnnotatorLogic.tsx use?

Line 240 path: direct `supabase.from("mineral_deposits").insert(...)` (if not using API route)
Line 555 path: likely via `fetch('/api/gameplay/mineral-deposits', ...)` 

Verify which path actually fires at runtime before updating to avoid silent data loss.
<!-- SECTION:NOTES:END -->

## Spec References

- `task-7a3f1c` (rename mineralDeposits — DONE)
- `supabase/migrations/20260223000005_rename_mineral_deposits.sql`
- `src/app/api/gameplay/mineral-deposits/bulk/route.ts` (backward-compat shim to be removed)
- `two-two-survey-audit-and-ops.md` (schema audit changes summary)
