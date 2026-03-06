#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# deploy-production.sh — City Plus Pet Shop
# Safe, zero-downtime production deployment
#
# Run as: cityplus user (sudo rights limited via sudoers)
# Usage:  bash /var/www/cityplus/app/deploy/deploy-production.sh
#
# Runtime: systemd -> pm2-cityplus.service -> PM2 -> Next.js standalone
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

# ── Configuration ─────────────────────────────────────────────────────────────
APP_DIR="/var/www/cityplus/app"
APP_USER="cityplus"
PM2_APP="cityplus"
DB_NAME="cityplus_db"
BACKUP_DIR="/var/backups/cityplus"
LOG_FILE="/var/log/cityplus/deploy.log"
HEALTH_URL="http://127.0.0.1:3000/api/health"
HEALTH_RETRIES=6
HEALTH_WAIT=8
KEEP_BACKUPS=7
DEPLOY_BRANCH="${DEPLOY_BRANCH:-origin/main}"

# ── Colors ────────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
info()    { echo -e "${GREEN}[$(date +%H:%M:%S)]${NC} $*" | tee -a "$LOG_FILE"; }
warn()    { echo -e "${YELLOW}[$(date +%H:%M:%S)] WARN:${NC} $*" | tee -a "$LOG_FILE"; }
error()   { echo -e "${RED}[$(date +%H:%M:%S)] ERROR:${NC} $*" | tee -a "$LOG_FILE"; exit 1; }
section() { echo -e "\n${BLUE}══ $* ══${NC}" | tee -a "$LOG_FILE"; }

ROLLBACK_SNAPSHOT=""
LAST_GOOD_SHA=""

# ─────────────────────────────────────────────────────────────────────────────
rollback() {
  warn "Triggering automatic rollback..."
  if [ -n "$ROLLBACK_SNAPSHOT" ] && [ -d "$ROLLBACK_SNAPSHOT/.next" ]; then
    info "Restoring .next from: $ROLLBACK_SNAPSHOT"
    rm -rf "$APP_DIR/.next"
    cp -r "$ROLLBACK_SNAPSHOT/.next" "$APP_DIR/.next"
    cp -r "$APP_DIR/public" "$APP_DIR/.next/standalone/public" 2>/dev/null || true
    cp -r "$APP_DIR/.next/static" "$APP_DIR/.next/standalone/.next/static" 2>/dev/null || true
    pm2 startOrReload "$APP_DIR/ecosystem.config.js" --env production --update-env --only "$PM2_APP"
    sleep 5
    HEALTH=$(curl -sf "$HEALTH_URL" 2>/dev/null | grep -q '"status":"ok"' && echo "ok" || echo "fail")
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

# ── Log directory: must exist and be writable before any logging ──────────────
LOG_DIR="$(dirname "$LOG_FILE")"
if ! mkdir -p "$LOG_DIR" 2>/dev/null; then
  echo "ERROR: Cannot create $LOG_DIR. Run as root: mkdir -p $LOG_DIR && chown $APP_USER:$APP_USER $LOG_DIR" >&2
  exit 1
fi
if ! touch "$LOG_FILE" 2>/dev/null; then
  echo "ERROR: Cannot write to $LOG_FILE. Run: sudo chown $APP_USER:$APP_USER $LOG_DIR" >&2
  exit 1
fi

# ── Trap any unexpected error for auto rollback ───────────────────────────────
trap 'rollback' ERR

# ─────────────────────────────────────────────────────────────────────────────
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
REMOTE=$(git rev-parse "$DEPLOY_BRANCH" 2>/dev/null || git rev-parse origin/main)
if [ "$LOCAL" = "$REMOTE" ]; then
  warn "Already at latest ($DEPLOY_BRANCH) ($LOCAL). Nothing to deploy."
  exit 0
fi
LAST_GOOD_SHA="$LOCAL"
info "Pre-flight OK. Deploying: ${LOCAL:0:8} → ${REMOTE:0:8}"

# ─────────────────────────────────────────────────────────────────────────────
section "STEP 2 — Database backup (before migration/build)"
# ─────────────────────────────────────────────────────────────────────────────
mkdir -p "$BACKUP_DIR"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/pre_deploy_${TIMESTAMP}.dump"

# Load env for DATABASE_URL (never print secrets)
set +u
[ -f "$APP_DIR/.env.production.local" ] && set -a && . "$APP_DIR/.env.production.local" && set +a
set -u
export BACKUP_DIR DB_NAME

"$APP_DIR/deploy/backup_postgres.sh" "$BACKUP_FILE"
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
git checkout main 2>/dev/null || git checkout -b main origin/main 2>/dev/null || true
git reset --hard "$REMOTE"
info "Code updated to: $(git rev-parse --short HEAD)"

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
  error "Failed migrations detected. Fix before deploying."
fi
info "Migration status: clean"

# ─────────────────────────────────────────────────────────────────────────────
section "STEP 7 — Run database migrations"
# ─────────────────────────────────────────────────────────────────────────────
npx prisma migrate deploy
info "Migrations applied"

# ─────────────────────────────────────────────────────────────────────────────
section "STEP 8 — Generate Prisma client"
# ─────────────────────────────────────────────────────────────────────────────
npx prisma generate
info "Prisma client generated"

# ─────────────────────────────────────────────────────────────────────────────
section "STEP 9 — Build application"
# ─────────────────────────────────────────────────────────────────────────────
NODE_OPTIONS=--max-old-space-size=4096 npm run build
info "Build complete"

# ─────────────────────────────────────────────────────────────────────────────
section "STEP 10 — Copy static assets to standalone"
# ─────────────────────────────────────────────────────────────────────────────
cp -r "$APP_DIR/public" "$APP_DIR/.next/standalone/public" 2>/dev/null || true
cp -r "$APP_DIR/.next/static" "$APP_DIR/.next/standalone/.next/static" 2>/dev/null || true
info "Static assets copied to standalone output"

# ─────────────────────────────────────────────────────────────────────────────
section "STEP 11 — PM2 startOrReload (zero-downtime)"
# ─────────────────────────────────────────────────────────────────────────────
export APP_DIR
pm2 startOrReload "$APP_DIR/ecosystem.config.js" --env production --update-env --only "$PM2_APP"
pm2 save
info "PM2 reloaded"

# ─────────────────────────────────────────────────────────────────────────────
section "STEP 12 — Health check"
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
  error "Health check failed after $HEALTH_RETRIES attempts. Rollback triggered."
fi

# ─────────────────────────────────────────────────────────────────────────────
section "STEP 13 — Cleanup old backups"
# ─────────────────────────────────────────────────────────────────────────────
ls -t "$BACKUP_DIR"/pre_deploy_*.dump 2>/dev/null | tail -n "+$((KEEP_BACKUPS + 1))" | xargs -r rm --
ls -dt "$BACKUP_DIR"/rollback_* 2>/dev/null | tail -n "+$((KEEP_BACKUPS + 1))" | xargs -r rm -rf --
info "Cleanup: kept last $KEEP_BACKUPS backups/snapshots"

# ─────────────────────────────────────────────────────────────────────────────
# Disable error trap now that deploy succeeded
trap - ERR

# ── Deploy marker (no secrets) ────────────────────────────────────────────────
DEPLOY_SHA=$(git rev-parse --short HEAD)
echo "" | tee -a "$LOG_FILE"
echo -e "${GREEN}════════════════════════════════════════${NC}" | tee -a "$LOG_FILE"
echo -e "${GREEN} DEPLOY SUCCESSFUL — $(date '+%Y-%m-%d %H:%M:%S')${NC}" | tee -a "$LOG_FILE"
echo -e "${GREEN} Commit: $DEPLOY_SHA | LastGoodSHA: $LAST_GOOD_SHA${NC}" | tee -a "$LOG_FILE"
echo -e "${GREEN}════════════════════════════════════════${NC}" | tee -a "$LOG_FILE"
echo "deploy_ok|$(date -Iseconds)|$DEPLOY_SHA|$LAST_GOOD_SHA" >> "$LOG_FILE"
pm2 list
