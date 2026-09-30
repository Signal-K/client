# AGENTS

## Navigation commit policy

This repository follows the mandatory commit policy for every repository under `~/Navigation`.

- Commit only after a coherent ticket outcome or acceptance slice is implemented and verified. Do not create checkpoint, progress, one-file, or speculative commits. One achieved outcome is one commit by default.
- A coding request authorizes the final task commit unless the user explicitly says not to commit. Do not pause solely for routine commit confirmation once the outcome is complete.
- Before committing, inspect `git status --short`, run appropriate checks, stage the complete task from this repository root with `git add .`, then review `git diff --cached` and `git status --short`. Do not hand-pick only a small subset of task files.
- Preserve unrelated user-owned work. Exclude only clearly unrelated changes, secrets, generated caches/build output, or files explicitly excluded by the user, and disclose exclusions in the handoff and handoff.
- Every commit subject must use exactly `🚀🐺 ↝ [KES-299 ATL-999]: Commit message`.
  - Choose two different emoji for each commit. Do not use flags or smiley/human-face reaction emoji; object, symbol, nature, and animal emoji such as `🐺` are allowed.
  - Use the exact `↝` arrow and spacing.
  - Put all ticket keys worked on in one bracket pair, separated by single spaces. Include the active ticket key; related external keys may follow.
  - Describe the achieved outcome concisely after `: `.
- Never bypass the commit-message hook with `--no-verify`.

## Keep the server light (permanent rule)

Star Sailors must stay as light as possible on servers and PocketBase. This applies to every change, not just performance tickets.

- Budget reads per request. Prefer the fewest PocketBase reads that answer the question, and never download rows just to count them (use `totalItems` with `perPage=1`, or skip totals when they are unused: `skipTotal`).
- Request only the fields you need (`fields=`), page results, and cap list sizes.
- Share one client request between components (dedupe in-flight, short TTL, invalidate on writes) instead of each component fetching on its own. Do not add polling; if a poll is unavoidable, make it visibility-gated, at least 2 minutes apart, and cacheable.
- Cache public, read-mostly data at the edge (`Cache-Control` with `s-maxage`). Keep per-player data `private, no-store` and invalidate client caches on writes.
- New read endpoints go in the Free-plan API Worker (`workers/api`: 10ms CPU, 50 subrequests, no `nodejs_compat`) when they fit; a route that cannot stay within a handful of reads should be redesigned rather than ported as-is.
- Do not add a new request, query, timer or dependency without saying what it costs and why it is worth it.
