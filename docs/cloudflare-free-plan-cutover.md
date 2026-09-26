# Cloudflare Free-plan cutover: budget and runbook (SSC-38)

Budget (Workers Free): 10 ms CPU per request, 50 subrequests per request, no `limits.cpu_ms`. Do not use `wrangler secret put` in deploys; each secret write publishes a Worker version (Error 1102, 2026-09-18).

## Architecture

- `starsailors-api` Worker (`workers/api`): routes `starsailors.space/api/v1/*` and `www.starsailors.space/api/v1/*`. Local Clerk JWT verification, no `nodejs_compat`.
- OpenNext app Worker (root `wrangler.jsonc`): everything else. `/` and `/game` are static shells; middleware handles redirects.
- Hub load: one request to `/api/gameplay/hub/bootstrap`.

## Measurements

Local = docker PocketBase (8095), `wrangler dev`, dev Clerk token. Production cells are filled from Cloudflare observability after real traffic.

| Route | CPU ms | Subrequests | Response | Cold start | Error rate | Source |
|---|---|---|---|---|---|---|
| `GET /api/v1/me` (API Worker) | ~3 warm | 1 PB call (+1 JWKS on cold) | small JSON | 555 ms | 0 | local |
| `GET /api/gameplay/hub/bootstrap` | <250 ms wall (test) | <=8 PB reads, 0 Clerk calls for named accounts | <8 KB | TBD | TBD | unit test |
| `GET /`, `GET /game` | static | 0 | static | n/a | TBD | build (`○`) |
| Production `/api/v1/me` | TBD | TBD | TBD | TBD | TBD | production |
| Production hub bootstrap | TBD | TBD | TBD | TBD | TBD | production |

Record production numbers: Cloudflare dashboard, Workers, `starsailors-api` and the app Worker, Observability (CPU time, subrequests, errors). Zero Error 1102 over a representative session is the pass condition.

## Deploy

- App: push to `main` triggers `deploy-cloudflare.yml`; staging via `deploy-cloudflare-staging.yml`.
- API Worker: `deploy-api-worker.yml` (dispatch, plus push on `workers/api/**` once PR #251 merges). Inputs: `target`, `sync_secrets`.
- Variables: `CLERK_ISSUER`, `CLERK_AUTHORIZED_PARTIES`, `CLERK_AUTHORIZED_PARTIES_STAGING`. Secrets: `POCKETBASE_URL`, `POCKETBASE_ADMIN_EMAIL`, `POCKETBASE_ADMIN_PASSWORD`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.
- Only set `sync_secrets=true` when a secret changed.

## Smoke tests

1. `curl -i https://starsailors.space/api/v1/me` -> 401 `missing_token` (Worker route wins).
2. `curl -I https://starsailors.space/` and `/auth` -> 200.
3. Signed in on production: `/game` loads, network tab shows one `bootstrap` request and `/api/v1/me` returns 200. A 403 `bad_party` means `CLERK_AUTHORIZED_PARTIES` does not match the token `azp`: fix with `gh variable set CLERK_AUTHORIZED_PARTIES` and redeploy the API Worker.
4. Staging API: `https://starsailors-api-staging.liam-55d.workers.dev/api/v1/me` -> 401.

## Rollback

- API Worker: remove its two routes in the Cloudflare dashboard (traffic falls through to the app Worker), or redeploy the previous commit via `deploy-api-worker.yml`.
- App Worker: `wrangler rollback` to the previous version, or redeploy a prior commit.
- Vercel workflows remain until the Vercel dependency is retired; delete them only after the checks above pass in production.

## DNS and Clerk checklist

- [ ] `starsailors.space` and `www` proxied through Cloudflare, routes present.
- [ ] Clerk allowed origins include `https://starsailors.space` and `https://www.starsailors.space`.
- [ ] `staging.starsailors.space` has no Cloudflare DNS record (Vercel, SSC-31); staging is tested via workers.dev.
- [ ] Production 200 for `/api/v1/me` with a real Clerk token.

## Remaining Vercel references

`.github/workflows/deploy-vercel.yml`, `.github/workflows/cutover-vercel-domain.yml`, `Makefile`, `.gitignore`, `.dockerignore`, `public/assets/Items/sw.js`, `src/components/providers/isDevelopmentHost.test.ts`.
