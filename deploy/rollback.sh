#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# rollback.sh — City Plus Pet Shop
# Restores the previous .next build without touching the database.
#
# Run as: cityplus user
# Usage:  bash /var/www/cityplus/app/deploy/rollback.sh [snapshot_path]
#
# If snapshot_path not given, uses the most recent rollback snapshot.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

APP_DIR="/var/www/cityplus/app"
PM2_APP="cityplus"
BACKUP_DIR="/var/backups/cityplus"
HEALTH_URL="http://127.0.0.1:3001/api/health"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
info()  { echo -e "${GREEN}[$(date +%H:%M:%S)]${NC} $*"; }
warn()  { echo -e "${YELLOW}[$(date +%H:%M:%S)] WARN:${NC} $*"; }
error() { echo -e "${RED}[$(date +%H:%M:%S)] ERROR:${NC} $*"; exit 1; }

[ "$(whoami)" = "cityplus" ] || error "Must run as cityplus"

# ── Find snapshot ─────────────────────────────────────────────────────────────
if [ -n "${1:-}" ]; then
  SNAPSHOT="$1"
else
  SNAPSHOT=$(ls -dt "$BACKUP_DIR"/rollback_* 2>/dev/null | head -1 || echo "")
fi

[ -n "$SNAPSHOT" ] || error "No rollback snapshot found in $BACKUP_DIR"
[ -d "$SNAPSHOT/.next" ] || error "Snapshot has no .next directory: $SNAPSHOT"

echo ""
echo "═══════════════════════════════════════"
echo " ROLLBACK — City Plus Pet Shop"
echo " Snapshot: $SNAPSHOT"
echo " $(date '+%Y-%m-%d %H:%M:%S')"
echo "═══════════════════════════════════════"
echo ""

# ── Confirm ───────────────────────────────────────────────────────────────────
read -r -p "Roll back to this snapshot? This restores the .next build only (no DB change). [y/N] " CONFIRM
[ "$CONFIRM" = "y" ] || [ "$CONFIRM" = "Y" ] || { warn "Rollback cancelled."; exit 0; }

# ── Restore .next ─────────────────────────────────────────────────────────────
info "Restoring .next build..."
rm -rf "$APP_DIR/.next"
cp -r "$SNAPSHOT/.next" "$APP_DIR/.next"
info "Build restored"

# ── Reload PM2 ────────────────────────────────────────────────────────────────
info "Reloading PM2..."
pm2 reload "$PM2_APP" --update-env
info "PM2 reloaded"

# ── Health check ──────────────────────────────────────────────────────────────
info "Checking health..."
ATTEMPT=0
HEALTH="fail"
while [ $ATTEMPT -lt 5 ]; do
  sleep 6
  ATTEMPT=$((ATTEMPT + 1))
  RESPONSE=$(curl -sf --max-time 10 "$HEALTH_URL" 2>/dev/null || echo "")
  if echo "$RESPONSE" | grep -q '"status":"ok"'; then
    HEALTH="ok"
    break
  fi
  warn "Attempt $ATTEMPT/5 failed..."
done

if [ "$HEALTH" = "ok" ]; then
  info "═══ ROLLBACK SUCCESSFUL — app is healthy ═══"
  info "Snapshot used: $SNAPSHOT"
  pm2 list
else
  error "App still unhealthy after rollback. Check logs: pm2 logs $PM2_APP --lines 100"
fi

echo ""
warn "NOTE: If this deploy included a database migration, the migration is still"
warn "applied in the DB. Rolling back app code is usually sufficient."
warn "Only restore a DB backup during a planned maintenance window if required."
