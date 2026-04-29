# Wayfinder

Kiosk + mobile wayfinding app for Lockwood Library.
- Frontend: `frontend/` (React/Vite)
- Backend: `backend/` (Express/TypeScript)
- DB: PostgreSQL for librarian search
- Production: Nginx + Ngrok on Raspberry Pi
Read `docs/HANDOFF.md` first, then `docs/OPERATIONS.md`.

## Local Setup

```bash
git clone <CANONICAL_REPO_URL>
cd WayfinderMain/backend
npm install
```
Create `backend/.env` with `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`, `DB_NAME`, `PORT`.
```bash
npm run db:init
npm run dev
cd ../frontend
npm install
npm run dev
```
Open `http://localhost:5173`.

## Notes

- Vite proxies `/api/*` to `http://localhost:5000`.
- QR links use `/floors?q=<room>&mode=stairs|elevator`.
- Health check is `http://localhost:5000/health` (not `/api/health`).

## API

`GET /api/search`, `GET /api/nodes`, `GET /api/rooms`, `GET /api/navigation/from/:start/to/:end`, `GET /api/floor/:floorNumber/routes`, `GET /api/config`, `GET /health`

See `docs/PI_DEPLOYMENT.md` for Pi architecture.
