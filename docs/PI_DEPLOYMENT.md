# Raspberry Pi Deployment

## Architecture
Traffic path:
1. Ngrok (public HTTPS)
2. Nginx on `:80` (serves `/var/www`)
3. `/api/*` proxied to backend on `http://localhost:5000`
4. Express backend handles navigation/search
5. PostgreSQL stores librarian search data
Important: navigation graph is in `backend/src/server.ts`, not PostgreSQL.

## Canonical Paths
- Repo: `/home/wayfinder/WayfinderMain`
- Nginx config: `/etc/nginx/sites-available/default` (from repo `nginx-default`)
- Backend unit: `/etc/systemd/system/wayfinder-backend.service` (from repo template)
- Frontend deploy dir: `/var/www`
- Logs: `/var/log/wayfinder/backend.log`, `/var/log/nginx/error.log`, `/var/log/nginx/access.log`

## Deploy

```bash
cd /home/wayfinder/WayfinderMain
git fetch origin main
git checkout main
git reset --hard origin/main
WAYFINDER_REBOOT=0 bash scripts/deploy-pi.sh
```
`scripts/deploy-pi.sh` builds backend/frontend, copies frontend to `/var/www`, restarts backend, and reboots unless `WAYFINDER_REBOOT=0`.

## Verify

```bash
systemctl is-active nginx
systemctl is-active wayfinder-backend
systemctl is-active ngrok
curl -s http://127.0.0.1:5000/health
curl -s -H "ngrok-skip-browser-warning: true" http://127.0.0.1/api/rooms | head
curl -s -H "ngrok-skip-browser-warning: true" http://127.0.0.1:5000/api/config
```
Expected: services `active`, health JSON, rooms JSON, ngrok `publicUrl` when tunnel is up.

## Known Caveats

- Nginx template proxies `/api` only; `/health` is backend-root on `:5000`.
- QR handoff uses `/floors?q=<room>&mode=stairs|elevator`.
- Keep secrets only in `backend/.env` and secret manager; never in docs.
