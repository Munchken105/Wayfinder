# Operations Runbook
## Local Dev
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
Smoke test:
```bash
curl -s http://localhost:5000/health
curl -s "http://localhost:5000/api/search?q=computer"
curl -s http://localhost:5000/api/rooms | head
```
## Deploy / Verify / Rollback
```bash
cd /home/wayfinder/WayfinderMain
git fetch origin main
git checkout main
git reset --hard origin/main
WAYFINDER_REBOOT=0 bash scripts/deploy-pi.sh
systemctl is-active nginx wayfinder-backend ngrok
curl -s http://127.0.0.1:5000/health
curl -s -H "ngrok-skip-browser-warning: true" http://127.0.0.1/api/rooms | head
git rev-parse --short HEAD
```
Remote deploy from laptop:
```bash
WAYFINDER_REBOOT=0 ./scripts/redeploy-from-local.sh
```
Rollback:
```bash
cd /home/wayfinder/WayfinderMain
git log --oneline -n 20
git reset --hard <KNOWN_GOOD_SHA>
WAYFINDER_REBOOT=0 bash scripts/deploy-pi.sh
```
## Troubleshooting + DB Ops
```bash
systemctl status wayfinder-backend nginx ngrok --no-pager
systemctl list-unit-files | rg -i ngrok || pgrep -af ngrok
journalctl -u wayfinder-backend -n 200 --no-pager
sudo tail -n 200 /var/log/wayfinder/backend.log
sudo nginx -t
curl -s http://127.0.0.1:4040/api/tunnels
sudo -u postgres pg_dump -Fc wayfinder > /home/wayfinder/backups/wayfinder_$(date +%F_%H%M).dump
sudo -u postgres pg_restore -d wayfinder --clean --if-exists /home/wayfinder/backups/<backup_file>.dump
```
Notes:
- `/health` is backend-root (`:5000`), not proxied under `/api`.
- Ngrok setup was completed on Pi using Wayfinder shared Google sign-in + ngrok guided setup.
- On current Pi, ngrok and nginx auto-start on boot.
- Keep secrets only in `backend/.env` and secret manager.
- If SSH host key changed after reimage: `ssh-keygen -R 2ndFloor`.
