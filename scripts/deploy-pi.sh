#!/usr/bin/env bash
# Run on the Raspberry Pi after the repo is at the desired commit (see redeploy-from-local.sh).
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT/backend"
npm install
npm run build

cd "$ROOT/frontend"
npm install
npm run build

sudo rm -rf /var/www/*
sudo cp -r "$ROOT/frontend/dist/"* /var/www/

sudo systemctl restart wayfinder-backend
echo "Wayfinder Pi deploy finished (frontend → /var/www, backend restarted)."
