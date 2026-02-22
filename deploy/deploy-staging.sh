#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# deploy-staging.sh — City Plus Pet Shop
# Auto-deploy on develop branch push (via GitHub Actions)
#
# Run as: cityplus_staging user
# Usage:  bash /var/www/cityplus-staging/app/deploy/deploy-staging.sh
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

APP_DIR="/var/www/cityplus-staging/app"
APP_USER="cityplus_staging"
PM2_APP="cityplus-staging"
DB_NAME="cityplus_staging"
LOG_FILE="/var/log/cityplus-staging/deploy.log"
HEALTH_URL="http://127.0.0.1:3002/api/health"
HEALTH_RETRIES=5
HEALTH_WAIT=8

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
info()    { echo -e "${GREEN}[$(date +%H:%M:%S)]${NC} $*" | tee -a "$LOG_FILE"; }
warn()    { echo -e "${YELLOW}[$(date +%H:%M:%S)] WARN:${NC} $*" | tee -a "$LOG_FILE"; }
error()   { echo -e "${RED}[$(date +%H:%M:%S)] ERROR:${NC} $*" | tee -a "$LOG_FILE"; exit 1; }
section() { echo -e "\n${BLUE}══ $* ══${NC}" | tee -a "$LOG_FILE"; }

mkdir -p "$(dirname "$LOG_FILE")"
echo "" >> "$LOG_FILE"

section "STAGING DEPLOY — $(date '+%Y-%m-%d %H:%M:%S')"

# Pre-flight
[ "$(whoami)" = "$APP_USER" ] || error "Must run as $APP_USER"
[ -d "$APP_DIR" ] || error "App dir missing: $APP_DIR"
[ -f "$APP_DIR/.env.staging.local" ] || error ".env.staging.local missing"

cd "$APP_DIR"
git fetch origin --quiet
git checkout develop
git pull origin develop --ff-only
info "Code: $(git rev-parse --short HEAD) — $(git log -1 --format='%s')"

section "STEP 1 — Install dependencies"
npm ci --omit=dev

section "STEP 2 — Run migrations"
npx prisma migrate deploy

section "STEP 3 — Build"
NODE_OPTIONS=--max-old-space-size=2048 npm run build

section "STEP 4 — Copy static assets"
cp -r "$APP_DIR/public" "$APP_DIR/.next/standalone/public" 2>/dev/null || true
cp -r "$APP_DIR/.next/static" "$APP_DIR/.next/standalone/.next/static" 2>/dev/null || true

section "STEP 5 — Reload PM2"
pm2 reload "$PM2_APP" --update-env || pm2 start "$APP_DIR/deploy/ecosystem.staging.cjs"
pm2 save

section "STEP 6 — Health check"
ATTEMPT=0
HEALTH="fail"
while [ $ATTEMPT -lt $HEALTH_RETRIES ]; do
  sleep $HEALTH_WAIT
  ATTEMPT=$((ATTEMPT + 1))
  RESPONSE=$(curl -sf --max-time 10 "$HEALTH_URL" 2>/dev/null || echo "")
  if echo "$RESPONSE" | grep -q '"status":"ok"'; then
    HEALTH="ok"
    info "Health check passed (attempt $ATTEMPT)"
    break
  fi
  warn "Attempt $ATTEMPT/$HEALTH_RETRIES failed..."
done

if [ "$HEALTH" != "ok" ]; then
  pm2 logs "$PM2_APP" --lines 50 --nostream >> "$LOG_FILE" 2>&1 || true
  error "Staging health check failed. Check logs: $LOG_FILE"
fi

echo "" | tee -a "$LOG_FILE"
echo -e "${GREEN}══ STAGING DEPLOY SUCCESS — $(git rev-parse --short HEAD) ══${NC}" | tee -a "$LOG_FILE"
