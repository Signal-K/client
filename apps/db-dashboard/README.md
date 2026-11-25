# Star Sailors dashboard

A static admin dashboard styled like the PocketBase admin UI. It talks to the
production PocketBase over its REST API and signs in with the same superuser
account, so it does not load the server's bundled admin UI.

- **Metrics**: per-game activity (totals, 24h/7d/30d, 30-day bars) and collection sizes.
- **Missions**: Landnam mission catalog and Minimal progress, Haphazard Martians level stats.
- **Collections**: game switcher plus a read-only record explorer (search, filter, sort, paging).

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static files in dist/
```

The server URL defaults to `https://signal-k-pocketbase.fly.dev` and can be changed on
the login screen or with `VITE_PB_URL`. Game-to-collection mapping lives in `src/games.js`
and must match `backend/collection_namespace.go`. It is read-only: no writes to PocketBase.
