# Anomaly Setup Workflow v0 (Client)

Date: 2026-03-06

## Goal

Define a repeatable workflow in this repo for organizing and preparing anomaly records, replacing ad-hoc setup from external tooling.

## Workflow

1. Prepare anomaly payloads with required keys: `id`, `content`, `anomalytype`, `anomalySet`.
2. Validate payload shape locally before import (reject rows missing required keys).
3. Link anomalies to users through `linked_anomalies` with a dated import batch tag.
4. Verify route surfaces:
   - `/api/gameplay/page-data`
   - `/api/gameplay/linked-anomalies`
5. Run regression checks:
   - `yarn lint`
   - `npm run test:unit`
   - `yarn build`
6. Ship with a short change log and imported row count.

## Operational Notes

- Keep imports idempotent where possible (stable IDs + dedup checks).
- Prefer API-backed flows over direct table edits from client code paths.
- Record batch metadata so anomalies can be audited or replayed safely.
