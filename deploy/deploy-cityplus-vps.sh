#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# deploy-cityplus-vps.sh — City Plus Pet Shop (cursor_task.md phases A–I)
# Production deploy: backup, build, migrate, restart, health checks.
#
# Run as: abrar (sudo) or cityplus
# Usage:  sudo bash /var/www/cityplus/app/deploy/deploy-cityplus-vps.sh
#
# Prerequisites:
#   - .env.production.local exists with DATABASE_URL, NEXTAUTH_*, etc.
#   - PM2 app "cityplus" (or city-plus-app) already started once
#   - OLS reverse proxy configured for citypetshopbd.com → 127.0.0.1:3001
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

# ── Configuration (matches cursor_task.md) ───────────────────────────────────
APP_DIR="/var/www/cityplus/app"
APP_USER="cityplus"
ADMIN_USER="abrar"
PM2_APP="cityplus"                    # ecosystem.config.cjs uses "cityplus"
BACKUP_DIR="/backups/cityplus"
RELEASES_DIR="/var/www/cityplus/releases"
LOG_FILE="/var/log/cityplus/deploy.log"
HEALTH_URL="http://127.0.0.1:3001/api/health"
DOMAIN="https://citypetshopbd.com"

# ── Helpers ───────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
info()    { echo -e "${GREEN}[$(date +%H:%M:%S)]${NC} $*" | tee -a "$LOG_FILE"; }
warn()    { echo -e "${YELLOW}[$(date +%H:%M:%S)] WARN:${NC} $*" | tee -a "$LOG_FILE"; }
error()   { echo -e "${RED}[$(date +%H:%M:%S)] ERROR:${NC} $*" | tee -a "$LOG_FILE"; exit 1; }
section() { echo -e "\n${BLUE}══ $* ══${NC}" | tee -a "$LOG_FILE"; }

# Ensure log dir exists
sudo mkdir -p "$(dirname "$LOG_FILE")" 2>/dev/null || true
sudo touch "$LOG_FILE" 2>/dev/null || true
sudo chown "$APP_USER:$APP_USER" "$LOG_FILE" 2>/dev/null || true

# ─────────────────────────────────────────────────────────────────────────────
section "PHASE A — SAFETY PRECHECK"
# ─────────────────────────────────────────────────────────────────────────────
info "Current user: $(whoami)"
info "Working directory: $(pwd)"
[ -d "$APP_DIR" ] || error "App directory not found: $APP_DIR"
info "App dir contents:"
ls -la "$APP_DIR" | head -20 | tee -a "$LOG_FILE"

section "Disk + Memory"
df -h | tee -a "$LOG_FILE"
free -h | tee -a "$LOG_FILE"

section "Node/npm"
node -v | tee -a "$LOG_FILE"
npm -v | tee -a "$LOG_FILE"

section "PM2 status"
sudo -u "$APP_USER" pm2 status 2>/dev/null | tee -a "$LOG_FILE" || warn "PM2 not running yet"
sudo -u "$APP_USER" pm2 info "$PM2_APP" 2>/dev/null | head -30 | tee -a "$LOG_FILE" || true
sudo -u "$APP_USER" pm2 logs "$PM2_APP" --lines 30 --nostream 2>/dev/null | tail -40 | tee -a "$LOG_FILE" || true

# ─────────────────────────────────────────────────────────────────────────────
section "PHASE B — BACKUP (MUST DO)"
# ─────────────────────────────────────────────────────────────────────────────
sudo mkdir -p "$BACKUP_DIR"
sudo chown "$ADMIN_USER:$ADMIN_USER" "$BACKUP_DIR"

# Load env for DATABASE_URL
if [ ! -f "$APP_DIR/.env.production.local" ]; then
  error ".env.production.local not found at $APP_DIR"
fi
set -a
# shellcheck source=/dev/null
source "$APP_DIR/.env.production.local"
set +a

# Mask password in logs
echo "$DATABASE_URL" | sed 's|//[^:]*:[^@]*@|//***:***@|' | tee -a "$LOG_FILE" || true

DB_BACKUP="$BACKUP_DIR/cityplus_db_$(date +%Y%m%d_%H%M%S).dump"
info "Backing up database to $DB_BACKUP"
pg_dump "$DATABASE_URL" -F c -f "$DB_BACKUP" || error "pg_dump failed"
[ -s "$DB_BACKUP" ] || error "Backup file empty or missing"
info "DB backup OK: $(du -sh "$DB_BACKUP" | cut -f1)"

# App backup for rollback
sudo -u "$APP_USER" mkdir -p "$RELEASES_DIR"
APP_BACKUP="$RELEASES_DIR/app_backup_$(date +%Y%m%d_%H%M%S).tgz"
info "Backing up app to $APP_BACKUP"
sudo -u "$APP_USER" bash -lc "cd $APP_DIR && tar -czf '$APP_BACKUP' \
  --exclude=node_modules \
  --exclude=.git \
  --exclude=.next/cache \
  ." || error "App backup failed"
info "App backup OK: $(du -sh "$APP_BACKUP" | cut -f1)"

# ─────────────────────────────────────────────────────────────────────────────
section "PHASE C — GET LATEST CODE"
# ─────────────────────────────────────────────────────────────────────────────
cd "$APP_DIR"
git status | tee -a "$LOG_FILE"
git pull --rebase || error "git pull failed"
info "Latest commit: $(git log -1 --oneline)"

# ─────────────────────────────────────────────────────────────────────────────
section "PHASE D — INSTALL + BUILD (STANDALONE)"
# ─────────────────────────────────────────────────────────────────────────────
sudo -u "$APP_USER" bash -lc "cd $APP_DIR && npm ci" || error "npm ci failed"

sudo -u "$APP_USER" bash -lc "cd $APP_DIR && npm run build" || error "Build failed"

# Verify standalone output
[ -d "$APP_DIR/.next/standalone" ] || error "Standalone output not found"
[ -f "$APP_DIR/.next/standalone/.next/BUILD_ID" ] || error "BUILD_ID not found"
info "Standalone structure OK"

# Copy assets into standalone (MUST)
sudo -u "$APP_USER" bash -lc "cd $APP_DIR && rm -rf .next/standalone/public && cp -r public .next/standalone/"
sudo -u "$APP_USER" bash -lc "cd $APP_DIR && rm -rf .next/standalone/.next/static && cp -r .next/static .next/standalone/.next/"
info "Assets copied to standalone"

# ─────────────────────────────────────────────────────────────────────────────
section "PHASE E — PRISMA PROD MIGRATION"
# ─────────────────────────────────────────────────────────────────────────────
sudo -u "$APP_USER" bash -lc "set -a; source $APP_DIR/.env.production.local; set +a; cd $APP_DIR; npx prisma generate" || error "prisma generate failed"
sudo -u "$APP_USER" bash -lc "set -a; source $APP_DIR/.env.production.local; set +a; cd $APP_DIR; npx prisma migrate deploy" || error "prisma migrate deploy failed — STOP. Do NOT force reset."
info "Prisma migrations applied"

# ─────────────────────────────────────────────────────────────────────────────
section "PHASE F — RESTART SERVICE (PM2 + OLS)"
# ─────────────────────────────────────────────────────────────────────────────
sudo -u "$APP_USER" bash -lc "cd $APP_DIR && pm2 restart $PM2_APP --update-env" || error "PM2 restart failed"
sudo -u "$APP_USER" pm2 save
info "PM2 restarted and saved"

# Verify local port
sleep 3
ss -lntp | grep 3001 || warn "Port 3001 not yet listening"
curl -sf -o /dev/null -w "%{http_code}" "$HEALTH_URL" && info "Health OK" || warn "Health check failed (may need a few more seconds)"
curl -sI "$HEALTH_URL" | head -5 | tee -a "$LOG_FILE"
curl -sI "http://127.0.0.1:3001/" | head -5 | tee -a "$LOG_FILE"
curl -sI "http://127.0.0.1:3001/admin" | head -5 | tee -a "$LOG_FILE"

# Restart OLS
sudo systemctl restart lsws || warn "lsws restart failed"
sleep 2
sudo systemctl status lsws --no-pager -n 20 | tee -a "$LOG_FILE" || true

# ─────────────────────────────────────────────────────────────────────────────
section "PHASE G — END-TO-END CHECKS (CRITICAL)"
# ─────────────────────────────────────────────────────────────────────────────
info "Public site checks:"
curl -sI "$DOMAIN/" | head -10 | tee -a "$LOG_FILE"
curl -sI "$DOMAIN/admin" | head -10 | tee -a "$LOG_FILE"
curl -sI "$DOMAIN/admin/login" | head -10 | tee -a "$LOG_FILE"

# Check for BAD redirect to localhost
LOC=$(curl -sI "$DOMAIN/admin" 2>/dev/null | grep -i "^location:" | head -1)
if echo "$LOC" | grep -qi "localhost\|127\.0\.0\.1"; then
  error "BAD: Redirect points to localhost! Check middleware, NEXTAUTH_URL, OLS proxy headers."
fi
info "No localhost redirect detected — OK"

# ─────────────────────────────────────────────────────────────────────────────
section "DEPLOYMENT REPORT"
# ─────────────────────────────────────────────────────────────────────────────
echo "" | tee -a "$LOG_FILE"
echo "═══════════════════════════════════════════════════════════" | tee -a "$LOG_FILE"
echo " DEPLOY SUCCESSFUL — $(date '+%Y-%m-%d %H:%M:%S')" | tee -a "$LOG_FILE"
echo " Commit: $(cd $APP_DIR && git rev-parse --short HEAD)" | tee -a "$LOG_FILE"
echo " DB backup: $DB_BACKUP" | tee -a "$LOG_FILE"
echo " App backup: $APP_BACKUP" | tee -a "$LOG_FILE"
echo "═══════════════════════════════════════════════════════════" | tee -a "$LOG_FILE"
sudo -u "$APP_USER" pm2 list | tee -a "$LOG_FILE"
