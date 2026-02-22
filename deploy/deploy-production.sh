#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# deploy-production.sh — City Plus Pet Shop
# Safe, zero-downtime production deployment
#
# Run as: cityplus user (sudo rights limited via sudoers)
# Usage:  bash /var/www/cityplus/app/deploy/deploy-production.sh
#
# What it does:
#   1. Pre-flight checks
#   2. Auto backup (DB + .next snapshot)
#   3. Pull latest main
#   4. Install dependencies
#   5. Check migration status (abort if failed migrations exist)
#   6. Run prisma migrate deploy
#   7. Build application
#   8. PM2 reload (zero-downtime)
#   9. Health check with retry
#   10. Auto rollback on failure
#   11. Cleanup old backups
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

# ── Configuration ─────────────────────────────────────────────────────────────
APP_DIR="/var/www/cityplus/app"
APP_USER="cityplus"
PM2_APP="cityplus"
DB_NAME="cityplus_db"
BACKUP_DIR="/var/backups/cityplus"
LOG_FILE="/var/log/cityplus/deploy.log"
HEALTH_URL="http://127.0.0.1:3001/api/health"
HEALTH_RETRIES=6
HEALTH_WAIT=8
KEEP_BACKUPS=7

# ── Colors ────────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
info()    { echo -e "${GREEN}[$(date +%H:%M:%S)]${NC} $*" | tee -a "$LOG_FILE"; }
warn()    { echo -e "${YELLOW}[$(date +%H:%M:%S)] WARN:${NC} $*" | tee -a "$LOG_FILE"; }
error()   { echo -e "${RED}[$(date +%H:%M:%S)] ERROR:${NC} $*" | tee -a "$LOG_FILE"; exit 1; }
section() { echo -e "\n${BLUE}══ $* ══${NC}" | tee -a "$LOG_FILE"; }

ROLLBACK_SNAPSHOT=""

# ─────────────────────────────────────────────────────────────────────────────
rollback() {
  warn "Triggering automatic rollback..."
  if [ -n "$ROLLBACK_SNAPSHOT" ] && [ -d "$ROLLBACK_SNAPSHOT/.next" ]; then
    info "Restoring .next from: $ROLLBACK_SNAPSHOT"
    rm -rf "$APP_DIR/.next"
    cp -r "$ROLLBACK_SNAPSHOT/.next" "$APP_DIR/.next"
    pm2 reload "$PM2_APP" --update-env
    sleep 5
    HEALTH=$(curl -sf "$HEALTH_URL" && echo "ok" || echo "fail")
    if [ "$HEALTH" = "ok" ]; then
      info "Rollback succeeded — app restored to previous build"
    else
      error "Rollback failed — app still unhealthy. MANUAL INTERVENTION REQUIRED."
    fi
  else
    error "No rollback snapshot available. MANUAL INTERVENTION REQUIRED."
  fi
  exit 1
}

# ── Trap any unexpected error for auto rollback ───────────────────────────────
trap 'rollback' ERR

# ─────────────────────────────────────────────────────────────────────────────
mkdir -p "$(dirname "$LOG_FILE")"
echo "" >> "$LOG_FILE"

section "PRODUCTION DEPLOY — $(date '+%Y-%m-%d %H:%M:%S')"

# ─────────────────────────────────────────────────────────────────────────────
section "STEP 1 — Pre-flight checks"
# ─────────────────────────────────────────────────────────────────────────────
[ "$(whoami)" = "$APP_USER" ] || error "Must run as $APP_USER (current: $(whoami))"
[ -d "$APP_DIR" ] || error "App directory not found: $APP_DIR"
[ -f "$APP_DIR/.env.production.local" ] || error ".env.production.local missing — deploy aborted"
command -v pm2 >/dev/null 2>&1 || error "pm2 not found"
command -v npx >/dev/null 2>&1 || error "npx not found"

cd "$APP_DIR"
git fetch origin --quiet
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)
if [ "$LOCAL" = "$REMOTE" ]; then
  warn "Already at latest main ($LOCAL). Nothing to deploy."
  exit 0
fi
info "Pre-flight OK. Deploying: ${LOCAL:0:8} → ${REMOTE:0:8}"

# ─────────────────────────────────────────────────────────────────────────────
section "STEP 2 — Database backup"
# ─────────────────────────────────────────────────────────────────────────────
mkdir -p "$BACKUP_DIR"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/pre_deploy_${TIMESTAMP}.dump"

# Uses sudoers rule: cityplus ALL=(postgres) NOPASSWD: /usr/bin/pg_dump -Fc -d cityplus_db -f /var/backups/cityplus/*
sudo -u postgres pg_dump -Fc -d "$DB_NAME" -f "$BACKUP_FILE"

BACKUP_SIZE=$(stat -c%s "$BACKUP_FILE" 2>/dev/null || echo "0")
[ "$BACKUP_SIZE" -gt 1024 ] || error "Backup file suspiciously small ($BACKUP_SIZE bytes)"
info "DB backup: $BACKUP_FILE ($(du -sh "$BACKUP_FILE" | cut -f1))"

# ─────────────────────────────────────────────────────────────────────────────
section "STEP 3 — Build snapshot for rollback"
# ─────────────────────────────────────────────────────────────────────────────
ROLLBACK_SNAPSHOT="$BACKUP_DIR/rollback_${TIMESTAMP}"
mkdir -p "$ROLLBACK_SNAPSHOT"
if [ -d "$APP_DIR/.next" ]; then
  cp -r "$APP_DIR/.next" "$ROLLBACK_SNAPSHOT/.next"
  info "Build snapshot saved: $ROLLBACK_SNAPSHOT"
fi

# ─────────────────────────────────────────────────────────────────────────────
section "STEP 4 — Pull latest code"
# ─────────────────────────────────────────────────────────────────────────────
git checkout main
git pull origin main --ff-only
info "Code updated to: $(git rev-parse --short HEAD) — $(git log -1 --format='%s')"

# ─────────────────────────────────────────────────────────────────────────────
section "STEP 5 — Install dependencies"
# ─────────────────────────────────────────────────────────────────────────────
npm ci --omit=dev
info "Dependencies installed"

# ─────────────────────────────────────────────────────────────────────────────
section "STEP 6 — Migration safety check"
# ─────────────────────────────────────────────────────────────────────────────
MIGRATE_STATUS=$(npx prisma migrate status 2>&1 || true)
if echo "$MIGRATE_STATUS" | grep -q "failed migrations"; then
  error "Failed migrations detected. Run scripts/fix-migration-p3009.sh before deploying."
fi
info "Migration status: clean"

# ─────────────────────────────────────────────────────────────────────────────
section "STEP 7 — Run database migrations"
# ─────────────────────────────────────────────────────────────────────────────
npx prisma migrate deploy
info "Migrations applied"

# ─────────────────────────────────────────────────────────────────────────────
section "STEP 8 — Build application"
# ─────────────────────────────────────────────────────────────────────────────
NODE_OPTIONS=--max-old-space-size=4096 npm run build
info "Build complete"

# ─────────────────────────────────────────────────────────────────────────────
section "STEP 9 — Copy static assets to standalone"
# ─────────────────────────────────────────────────────────────────────────────
# Next.js standalone mode requires these to be copied manually
cp -r "$APP_DIR/public" "$APP_DIR/.next/standalone/public" 2>/dev/null || true
cp -r "$APP_DIR/.next/static" "$APP_DIR/.next/standalone/.next/static" 2>/dev/null || true
info "Static assets copied to standalone output"

# ─────────────────────────────────────────────────────────────────────────────
section "STEP 10 — Reload PM2 (zero-downtime)"
# ─────────────────────────────────────────────────────────────────────────────
pm2 reload "$PM2_APP" --update-env
info "PM2 reloaded"

# ─────────────────────────────────────────────────────────────────────────────
section "STEP 11 — Health check"
# ─────────────────────────────────────────────────────────────────────────────
ATTEMPT=0
HEALTH="fail"
while [ $ATTEMPT -lt $HEALTH_RETRIES ]; do
  sleep $HEALTH_WAIT
  ATTEMPT=$((ATTEMPT + 1))
  RESPONSE=$(curl -sf --max-time 10 "$HEALTH_URL" 2>/dev/null || echo "")
  if echo "$RESPONSE" | grep -q '"status":"ok"'; then
    HEALTH="ok"
    info "Health check passed (attempt $ATTEMPT/$HEALTH_RETRIES)"
    break
  fi
  warn "Health check attempt $ATTEMPT/$HEALTH_RETRIES failed. Waiting ${HEALTH_WAIT}s..."
done

if [ "$HEALTH" != "ok" ]; then
  error "Health check failed after $HEALTH_RETRIES attempts"
fi

# ─────────────────────────────────────────────────────────────────────────────
section "STEP 12 — Cleanup old backups"
# ─────────────────────────────────────────────────────────────────────────────
# Keep last N DB backups
ls -t "$BACKUP_DIR"/pre_deploy_*.dump 2>/dev/null | tail -n "+$((KEEP_BACKUPS + 1))" | xargs -r rm --
# Keep last N rollback snapshots
ls -dt "$BACKUP_DIR"/rollback_* 2>/dev/null | tail -n "+$((KEEP_BACKUPS + 1))" | xargs -r rm -rf --
info "Cleanup: kept last $KEEP_BACKUPS backups/snapshots"

# ─────────────────────────────────────────────────────────────────────────────
# Disable error trap now that deploy succeeded
trap - ERR

echo "" | tee -a "$LOG_FILE"
echo -e "${GREEN}════════════════════════════════════════${NC}" | tee -a "$LOG_FILE"
echo -e "${GREEN} DEPLOY SUCCESSFUL — $(date '+%Y-%m-%d %H:%M:%S')${NC}" | tee -a "$LOG_FILE"
echo -e "${GREEN} Commit: $(git rev-parse --short HEAD)${NC}" | tee -a "$LOG_FILE"
echo -e "${GREEN}════════════════════════════════════════${NC}" | tee -a "$LOG_FILE"
pm2 list
