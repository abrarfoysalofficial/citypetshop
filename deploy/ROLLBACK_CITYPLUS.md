# Rollback Plan — City Plus Pet Shop (cursor_task Phase I)

If the site breaks after deploy, follow these steps.

---

## 1. Stop PM2 app

```bash
sudo -u cityplus pm2 stop cityplus
```

## 2. Restore last good backup from releases

```bash
# List available backups (newest first)
ls -lt /var/www/cityplus/releases/app_backup_*.tgz

# Pick the backup from BEFORE the failed deploy, e.g.:
BACKUP="/var/www/cityplus/releases/app_backup_20260222_120000.tgz"

# Extract to temp, then replace app (excluding .env)
cd /var/www/cityplus
sudo -u cityplus mkdir -p app_rollback
sudo -u cityplus tar -xzf "$BACKUP" -C app_rollback

# Backup current .env (keep it!)
sudo -u cityplus cp app/.env.production.local app_rollback/.env.production.local 2>/dev/null || true

# Swap
sudo -u cityplus rm -rf app_failed
sudo -u cityplus mv app app_failed
sudo -u cityplus mv app_rollback app
```

## 3. Re-run build + Prisma + PM2

```bash
cd /var/www/cityplus/app

# Load env
set -a
source .env.production.local
set +a

# Regenerate Prisma client
npx prisma generate

# Build (if needed — backup may already have .next)
npm run build

# Copy standalone assets
rm -rf .next/standalone/public && cp -r public .next/standalone/
rm -rf .next/standalone/.next/static && cp -r .next/static .next/standalone/.next/

# Start PM2
sudo -u cityplus pm2 start ecosystem.config.cjs --env production
sudo -u cityplus pm2 save
```

## 4. Restore database (only if migration broke it)

```bash
# List DB backups
ls -lt /backups/cityplus/cityplus_db_*.dump

# Restore (replace with actual backup path)
pg_restore -d "$DATABASE_URL" --clean --if-exists /backups/cityplus/cityplus_db_YYYYMMDD_HHMMSS.dump
```

## 5. Verify

```bash
curl -sf http://127.0.0.1:3001/api/health
curl -sI https://citypetshopbd.com/
curl -sI https://citypetshopbd.com/admin
```

---

## Quick one-liner (if backup path known)

```bash
BACKUP="/var/www/cityplus/releases/app_backup_20260222_120000.tgz"
cd /var/www/cityplus && sudo -u cityplus pm2 stop cityplus && \
sudo -u cityplus tar -xzf "$BACKUP" -C /tmp/app_rollback && \
sudo -u cityplus cp app/.env.production.local /tmp/app_rollback/ 2>/dev/null; \
sudo -u cityplus rm -rf app && sudo -u cityplus mv /tmp/app_rollback app && \
cd app && sudo -u cityplus bash -c 'source .env.production.local; npx prisma generate' && \
sudo -u cityplus npm run build && \
sudo -u cityplus bash -c 'rm -rf .next/standalone/public; cp -r public .next/standalone/; cp -r .next/static .next/standalone/.next/' && \
sudo -u cityplus pm2 start ecosystem.config.cjs --env production && sudo -u cityplus pm2 save
```
