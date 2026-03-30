#!/usr/bin/env bash
# From your laptop: SSH to the Pi, fast-forward the repo to origin, then run deploy-pi.sh.
# Requires Tailscale (or network) so host 2ndFloor resolves, and SSH access as wayfinder.
#
# Usage:
#   ./scripts/redeploy-from-local.sh
# Optional:
#   WAYFINDER_SSH=user@host WAYFINDER_BRANCH=main WAYFINDER_REMOTE_ROOT=/path/to/WayfinderMain ./scripts/redeploy-from-local.sh
#   PUSH_FIRST=1 ./scripts/redeploy-from-local.sh   # git push current branch before remote pull
#   WAYFINDER_REBOOT=0 ./scripts/redeploy-from-local.sh   # deploy without reboot
set -euo pipefail

SSH_HOST="${WAYFINDER_SSH:-wayfinder@2ndFloor}"
REMOTE_ROOT="${WAYFINDER_REMOTE_ROOT:-/home/wayfinder/WayfinderMain}"
BRANCH="${WAYFINDER_BRANCH:-main}"
REBOOT_AFTER_DEPLOY="${WAYFINDER_REBOOT:-1}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

if [[ "${PUSH_FIRST:-}" == "1" ]]; then
  cd "$REPO_ROOT"
  git push origin "$(git branch --show-current)"
fi

ssh "$SSH_HOST" "cd '$REMOTE_ROOT' && git fetch origin '$BRANCH' && git reset --hard origin/$BRANCH && WAYFINDER_REBOOT='$REBOOT_AFTER_DEPLOY' bash scripts/deploy-pi.sh"
