#!/usr/bin/env bash
# Weekly unattended run of scripts/maintain-roster.ts from a dedicated clone.
#
# The controller must run from a clean main checkout that nobody edits while it is active, so this
# uses its own clone rather than your working copy. Example crontab entry (Saturday 22:00 local):
#
#   0 22 * * 6 /path/to/vietprofs/scripts/cron-maintain-roster.sh
#
# Environment:
#   VIETPROFS_MAINT_CLONE  clone to run in (default: ~/git/projects/vietprofs-maintenance)
#   VIETPROFS_MAINT_ARGS   extra controller arguments (default: none, i.e. up to 40 stale entries)
#   VIETPROFS_MAINTENANCE_STATE_DIR  controller state (default: a cron-only directory, so this
#                          clone's checkpoint never mixes with runs started from another checkout)
set -euo pipefail

export PATH="$HOME/.local/bin:/usr/local/bin:/usr/bin:/bin"
clone="${VIETPROFS_MAINT_CLONE:-$HOME/git/projects/vietprofs-maintenance}"
log_dir="${XDG_STATE_HOME:-$HOME/.local/state}/vietprofs-maintenance"
export VIETPROFS_MAINTENANCE_STATE_DIR="${VIETPROFS_MAINTENANCE_STATE_DIR:-$log_dir/cron-state}"
mkdir -p "$log_dir" "$VIETPROFS_MAINTENANCE_STATE_DIR"
exec >>"$log_dir/cron.log" 2>&1
echo "=== $(date -Is) cron-maintain-roster start"

# One run at a time; a paused or long-running controller keeps the lock.
exec 9>"$log_dir/cron.lock"
if ! flock -n 9; then
  echo "another run is active; skipping"
  exit 0
fi

if [ ! -d "$clone/.git" ]; then
  git clone git@github.com:dynaroars/vietprofs.git "$clone"
fi
cd "$clone"
[ -d node_modules ] || npm ci --no-audit --no-fund

# The controller resumes any unfinished checkpoint on its own; only move to fresh main when there
# is nothing to resume, so an interrupted batch keeps the tree it started from.
status_line=$(./scripts/maintain-roster.ts status 2>/dev/null | head -1 || true)
case "$status_line" in
  "No run recorded"*|"Status: complete"*)
    git checkout main
    git pull --ff-only origin main
    npm ci --no-audit --no-fund
    ;;
  *) echo "resuming: $status_line" ;;
esac

# shellcheck disable=SC2086
./scripts/maintain-roster.ts run ${VIETPROFS_MAINT_ARGS:-}
echo "=== $(date -Is) cron-maintain-roster done"
