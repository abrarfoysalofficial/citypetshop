#!/bin/bash
# City Plus Pet Shop — Production Deploy Script
# Run as: sudo -u cityplus ./scripts/deploy-production.sh
# App path: /var/www/cityplus/app
# Domain: https://citypetshopbd.com

set -e
APP_DIR="${APP_DIR:-/var/www/cityplus/app}"
DOMAIN="${DOMAIN:-https://citypetshopbd.com}"
BACKUP_DIR="${BACKUP_DIR:-/var/www/cityplus/backups}"

echo "[deploy] Starting production deploy at $(date -Iseconds)"

cd "$APP_DIR"

# Load env for DB backup (optional)
[ -f .env.production.local ] && set -a && . .env.production.local && set +a

# 1. Backup database
if command -v pg_dump &>/dev/null && [ -n "$DATABASE_URL" ]; then
  DB_NAME=$(echo "$DATABASE_URL" | sed -n 's|.*/\([^?]*\).*|\1|p')
  if [ -n "$DB_NAME" ]; then
    mkdir -p "$BACKUP_DIR"
    BACKUP_FILE="$BACKUP_DIR/pg_${DB_NAME}_$(date +%Y%m%d_%H%M%S).sql"
    echo "[deploy] Backing up DB to $BACKUP_FILE"
    pg_dump "$DATABASE_URL" > "$BACKUP_FILE" 2>/dev/null || true
  fi
fi

# 2. Git pull
echo "[deploy] Git pull"
git pull --ff-only origin main || git pull --ff-only origin master || true

# 3. Install deps
echo "[deploy] npm ci"
npm ci

# 4. Prisma migrate
echo "[deploy] Prisma migrate deploy"
npx prisma generate
npx prisma migrate deploy

# 5. Build
echo "[deploy] Building..."
npm run build

# 6. Copy standalone assets
echo "[deploy] Copying standalone assets"
STANDALONE=".next/standalone"
if [ -d "$STANDALONE" ]; then
  [ -d "public" ] && cp -r public "$STANDALONE/public" || true
  [ -d ".next/static" ] && cp -r .next/static "$STANDALONE/.next/static" || true
else
  echo "[deploy] ERROR: .next/standalone not found. Build may have failed."
  exit 1
fi

# 7. PM2 reload
echo "[deploy] PM2 reload"
pm2 reload city-plus-app --update-env || pm2 reload cityplus --update-env || pm2 start ecosystem.config.cjs --env production --name cityplus

# 8. Health checks
echo "[deploy] Health checks..."
sleep 3

FAIL=0

# Local
if curl -sf -o /dev/null "http://127.0.0.1:3001/" 2>/dev/null; then
  echo "[deploy] OK: http://127.0.0.1:3001/"
else
  echo "[deploy] WARN: http://127.0.0.1:3001/ not responding"
fi

# Public homepage
if curl -sf -o /dev/null "$DOMAIN/" 2>/dev/null; then
  echo "[deploy] OK: $DOMAIN/"
else
  echo "[deploy] WARN: $DOMAIN/ not responding"
fi

# /admin — CRITICAL: must NOT redirect to localhost
ADMIN_LOC=$(curl -sI "$DOMAIN/admin" 2>/dev/null | grep -i "^location:" | tr -d '\r' | cut -d' ' -f2-)
if [ -n "$ADMIN_LOC" ]; then
  if echo "$ADMIN_LOC" | grep -q "localhost\|127.0.0.1"; then
    echo "[deploy] FAIL: /admin redirects to localhost: $ADMIN_LOC"
    FAIL=1
  else
    echo "[deploy] OK: /admin redirect target: $ADMIN_LOC"
  fi
else
  echo "[deploy] OK: /admin (no redirect or 200)"
fi

if [ $FAIL -eq 1 ]; then
  echo "[deploy] DEPLOY FAILED: /admin redirects to localhost. Rollback recommended."
  echo "[deploy] To rollback: pm2 reload cityplus --update-env (previous build)"
  exit 1
fi

echo "[deploy] Deploy complete at $(date -Iseconds)"
