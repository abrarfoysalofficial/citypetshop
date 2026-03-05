# Operations Runbook — City Pet Shop BD

**Domain:** https://citypetshop.bd  
**Stack:** Next.js, PM2, PostgreSQL, CloudPanel/Nginx  
**App Port:** 3000

---

## Daily Operations

### Health Checks

```bash
# App health (env + DB)
curl -sf http://127.0.0.1:3000/api/health | jq .

# DB-only probe
curl -sf http://127.0.0.1:3000/api/health/db | jq .

# Via HTTPS (through proxy)
curl -sf https://citypetshop.bd/api/health | jq .status
```

Expected: `"ok"`, `database: "connected"`.

### Logs

```bash
# PM2 app logs
pm2 logs cityplus --lines 100

# PostgreSQL
sudo systemctl status postgresql
sudo -u postgres psql -c "SELECT 1"
```

---

## Deploy (Updates)

```bash
cd /home/citypetshop/htdocs/citypetshop.bd

# 1. Backup DB (recommended)
sudo -u postgres pg_dump cityplus_db > /var/backups/cityplus/pre_$(date +%Y%m%d).dump

# 2. Pull code
git fetch origin && git reset --hard origin/main

# 3. Install, migrate, build
npm ci
npx prisma generate
npx prisma migrate deploy
NODE_OPTIONS=--max-old-space-size=4096 npm run build

# 4. Copy assets
cp -r public .next/standalone/public 2>/dev/null || true
cp -r .next/static .next/standalone/.next/static 2>/dev/null || true

# 5. Restart
pm2 startOrReload ecosystem.config.js --env production --update-env --only cityplus
pm2 save

# 6. Verify
curl -sf http://127.0.0.1:3000/api/health | jq .
```

---

## Rollback

```bash
cd /home/citypetshop/htdocs/citypetshop.bd

# 1. Revert code
git log -1 --oneline   # note current
git checkout <last-good-commit>

# 2. Reinstall, build
npm ci
NODE_OPTIONS=--max-old-space-size=4096 npm run build
cp -r public .next/standalone/public 2>/dev/null || true
cp -r .next/static .next/standalone/.next/static 2>/dev/null || true

# 3. Restart
pm2 startOrReload ecosystem.config.js --env production --only cityplus
pm2 save

# 4. DB rollback (if migration was applied)
# Restore from backup: see DB_MIGRATION_RUNBOOK.md
```

---

## Incident Response

### 502 Bad Gateway

1. Check PM2: `pm2 status` — app must be `online`
2. Restart: `pm2 restart cityplus`
3. Check logs: `pm2 logs cityplus --err --lines 50`
4. Check Nginx: `sudo nginx -t` and proxy config

### 503 / Database Disconnected

1. Check PostgreSQL: `sudo systemctl status postgresql`
2. Test connection: `psql -h 127.0.0.1 -U cityplus_app -d cityplus_db -c "SELECT 1"`
3. Check DATABASE_URL in `.env.production.local`
4. Restart app: `pm2 restart cityplus`

### Admin Login Loop / Session Not Persisting

1. Ensure Nginx passes: `X-Forwarded-Proto`, `X-Forwarded-Host`, `Host`
2. Verify env: `NEXTAUTH_URL=https://citypetshop.bd`, `AUTH_TRUST_HOST=true`, `NEXTAUTH_SECRET` (32+ chars)
3. Use HTTPS only — cookies are secure

### High CPU / Memory

1. `pm2 monit` — inspect process
2. Check DB connections: `SELECT count(*) FROM pg_stat_activity;`
3. Restart: `pm2 restart cityplus`

---

## Admin Reset

```bash
cd /home/citypetshop/htdocs/citypetshop.bd
ADMIN_EMAIL=admin@citypetshop.bd ADMIN_PASSWORD='NewSecurePassword123!' npx tsx scripts/admin-reset.ts
```

---

## Contact

- Log locations: PM2 logs, Nginx error log
- DB backup: `/var/backups/cityplus/` (create if missing)
