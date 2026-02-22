---
title: "Community Event Notification Runbook"
---

# Community Event Notification Runbook

Date: 2026-02-22

## Purpose

Trigger a one-off community event push notification using GitHub Actions with safe dry-run validation and auditable report output.

## Workflow

Use `.github/workflows/pipeline.yml` workflow dispatch inputs:

- `run_community_event_notify`: `true`
- `community_event_title`: notification title
- `community_event_message`: notification message
- `community_event_url`: destination path (example: `/game`)
- `community_event_dry_run`: `true` (validation) or `false` (send)

## Dry Run Procedure

1. Run workflow with `run_community_event_notify=true` and `community_event_dry_run=true`.
2. Download artifact `community-event-report`.
3. Verify:
   - `dry_run: true`
   - expected `raw_subscriptions` and `unique_endpoints`
   - message payload values

## Production Send Procedure

1. Re-run workflow with identical payload and `community_event_dry_run=false`.
2. Download `community-event-report`.
3. Verify:
   - `totals.sent` > 0
   - `totals.failed` is acceptable
   - inspect `failures` list for invalid endpoints

## Rollback / Stop

- Stop further sends by leaving `run_community_event_notify=false`.
- Validate future payloads with `community_event_dry_run=true` before sending again.
- If failure rates spike, pause sends and investigate endpoint quality in `push_subscriptions`.

