#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# rollback.sh — City Plus Pet Shop
# Restores previous build and optionally database.
#
# Run as: cityplus user
# Usage:  bash deploy/rollback.sh [snapshot_path] [--restore-db]
#
# If snapshot_path not given, uses the most recent rollback snapshot.
# --restore-db: also restore DB from most recent pre_deploy_*.dump
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

RESTORE_DB=false
SNAPSHOT=""

for arg in "$@"; do
  if [ "$arg" = "--restore-db" ]; then
    RESTORE_DB=true
  elif [ -z "$SNAPSHOT" ] && [ -d "${arg:-}" ]; then
    SNAPSHOT="$arg"
  fi
done

if [ -z "$SNAPSHOT" ]; then
  SNAPSHOT=$(ls -dt "$BACKUP_DIR"/rollback_* 2>/dev/null | head -1 || echo "")
fi

[ -n "$SNAPSHOT" ] || error "No rollback snapshot found in $BACKUP_DIR"
[ -d "$SNAPSHOT/.next" ] || error "Snapshot has no .next directory: $SNAPSHOT"

echo ""
echo "═══════════════════════════════════════"
echo " ROLLBACK — City Plus Pet Shop"
echo " Snapshot: $SNAPSHOT"
echo " Restore DB: $RESTORE_DB"
echo " $(date '+%Y-%m-%d %H:%M:%S')"
echo "═══════════════════════════════════════"
echo ""

read -r -p "Roll back? [y/N] " CONFIRM
[ "$CONFIRM" = "y" ] || [ "$CONFIRM" = "Y" ] || { warn "Rollback cancelled."; exit 0; }

# ── Optional: Restore DB ─────────────────────────────────────────────────────
if [ "$RESTORE_DB" = true ]; then
  DUMP=$(ls -t "$BACKUP_DIR"/pre_deploy_*.dump 2>/dev/null | head -1 || echo "")
  if [ -z "$DUMP" ]; then
    error "No pre_deploy_*.dump found in $BACKUP_DIR. Cannot restore DB."
  fi
  info "Restoring DB from $DUMP..."
  [ -f "$APP_DIR/.env.production.local" ] && set -a && . "$APP_DIR/.env.production.local" && set +a
  export DB_NAME="${DB_NAME:-cityplus_db}"
  "$APP_DIR/deploy/restore_postgres.sh" "$DUMP"
  info "DB restored"
fi

# ── Restore .next ─────────────────────────────────────────────────────────────
info "Restoring .next build..."
rm -rf "$APP_DIR/.next"
cp -r "$SNAPSHOT/.next" "$APP_DIR/.next"
cp -r "$APP_DIR/public" "$APP_DIR/.next/standalone/public" 2>/dev/null || true
cp -r "$APP_DIR/.next/static" "$APP_DIR/.next/standalone/.next/static" 2>/dev/null || true
info "Build restored"

# ── Reload PM2 ────────────────────────────────────────────────────────────────
info "Reloading PM2..."
export APP_DIR
pm2 startOrReload "$APP_DIR/ecosystem.config.js" --env production --update-env --only "$PM2_APP"
pm2 save
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
  error "App still unhealthy after rollback. MANUAL RECOVERY:"
  echo "  1. pm2 logs $PM2_APP --lines 100"
  echo "  2. Restore DB manually: deploy/restore_postgres.sh \$BACKUP_DIR/pre_deploy_*.dump"
  echo "  3. git checkout <last-good-sha> && npm ci && npm run build && pm2 reload $PM2_APP"
  exit 1
fi

echo ""
warn "NOTE: If this deploy included a database migration, the migration may still"
warn "be applied in the DB. Use --restore-db to restore from backup."
