# Ecosystem v0 Release Readiness (Client)

Date: 2026-03-06

## Release Checklist

- [x] Core auth flow loads and routes to gameplay
- [x] Main gameplay route (`/game`) renders with primary cards
- [x] Referral and ecosystem routes (`/referrals`, `/ecosystem`) are reachable
- [x] Build and route manifest generation succeed
- [x] Unit test suite passes
- [x] Lint passes

## Validation Evidence

- `yarn lint`: pass
- `npm run test:unit`: pass (`126` files, `1046` tests)
- `yarn build`: pass (static generation complete; app routes emitted)

## Notes

- Remaining test output warnings are pre-existing (`act(...)` and dialog description warnings) and non-blocking to release build.
