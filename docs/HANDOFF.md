# Wayfinder Handoff

Read in order: `../README.md` -> `PI_DEPLOYMENT.md` -> `OPERATIONS.md`.

## System Snapshot

- Kiosk selects room, backend computes route, QR opens phone deep link.
- Frontend routes: `/`, `/floors`, `/mobile` (`/floors` is current QR target).
- Backend API runs on `:5000`.
- Navigation graph lives in `backend/src/server.ts`.
- Search data lives in PostgreSQL via `backend/src/db/init.sql`.

## Source of Truth

`nginx-default`, `wayfinder-backend.service`, `scripts/deploy-pi.sh`, `scripts/redeploy-from-local.sh`, `backend/src/db/init.sql`

## Critical Risks

- `/api/navigation/from/:start/to/:end` ignores `:start`.
- Nginx proxies `/api` only; `/health` is backend-root.
- `db:init` is destructive reset.
- Rollback is manual.
- Kiosk OS/browser autostart config is not in this repo.

## Ownership to Confirm

- Canonical repo URL and branch policy.
- Pi, Ngrok, and Tailscale owners.
- Secret manager + credential rotation owner.
- Backup location + retention policy.
