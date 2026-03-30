#!/usr/bin/env bash
# Run on the Raspberry Pi after the repo is at the desired commit (see redeploy-from-local.sh).
# Set WAYFINDER_REBOOT=0 to skip automatic reboot at the end.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REBOOT_AFTER_DEPLOY="${WAYFINDER_REBOOT:-1}"

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

if [[ "$REBOOT_AFTER_DEPLOY" == "1" ]]; then
  echo "Scheduling Pi reboot in 3 seconds..."
  # Schedule reboot asynchronously so SSH caller can return cleanly.
  sudo nohup bash -lc 'sleep 3; reboot' >/dev/null 2>&1 &
else
  echo "WAYFINDER_REBOOT=0, skipping reboot."
fi
