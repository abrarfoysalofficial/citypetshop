# CloudPanel Deployment Guide — City Pet Shop BD

**Purpose:** 100% copy-paste guide to remove the old live site and deploy the new one on CloudPanel.

**Brand:** City Pet Shop BD · **Domain:** https://citypetshop.bd  
**Site user:** citypetshop · **Root:** `/home/citypetshop/htdocs/citypetshop.bd`  
*(If your path is `/home/cloudpanel/htdocs/citypetshop.bd`, replace `citypetshop` with `cloudpanel` in all commands.)*  
**Repo:** https://github.com/abrarfoysalofficial/citypetshop.bd

**Stack:** Node.js 20 · PM2 · PostgreSQL · Next.js standalone · Port 3000

---

## Prerequisites

- SSH access to VPS (root or sudo)
- CloudPanel site `citypetshop.bd` already created
- Node.js 20, PM2, PostgreSQL, and git installed

---

## REPLACE LIVE SITE: 100% Copy-Paste Guide

Run each block in order. Expected output is shown after each command.

---

### Step A: Stop and remove the old app

```bash
pm2 stop cityplus 2>/dev/null || true
pm2 delete cityplus 2>/dev/null || true
pm2 save
```

**Expected:** `[PM2] Applying action deleteProcessId...` or no output if app didn't exist.

---

### Step B: Backup uploads (optional — skip if fresh start)

```bash
mkdir -p /home/citypetshop/backups
cp -r /home/citypetshop/htdocs/citypetshop.bd/public/uploads /home/citypetshop/backups/ 2>/dev/null || true
```

**Expected:** No output, or `cp` messages if uploads exist.

---

### Step C: Remove old site files

```bash
rm -rf /home/citypetshop/htdocs/citypetshop.bd/*
rm -rf /home/citypetshop/htdocs/citypetshop.bd/.[!.]* 2>/dev/null || true
```

**Expected:** No output. Directory emptied.

---

### Step D: (Optional) Drop database for fresh start — **ALL DATA LOST**

```bash
sudo -u postgres psql -c "DROP DATABASE IF EXISTS cityplus_db;"
sudo -u postgres psql -c "DROP USER IF EXISTS cityplus_app;"
```

**Expected:** `DROP DATABASE` and `DROP USER` messages. Skip if you want to keep existing data.

---

### Step E: Recreate database (only if you ran Step D)

```bash
DB_PASS=$(openssl rand -base64 24 | tr -d '\n/+=' | head -c 24)
sudo -u postgres psql -c "CREATE USER cityplus_app WITH PASSWORD '$DB_PASS';"
sudo -u postgres psql -c "CREATE DATABASE cityplus_db OWNER cityplus_app;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE cityplus_db TO cityplus_app;"
echo "$DB_PASS" | sudo tee /root/.citypetshop_db_pass
```

**Expected:** `CREATE ROLE`, `CREATE DATABASE`, `GRANT` messages.

---

### Step F: Clone fresh code

```bash
sudo -u citypetshop bash -c 'cd /home/citypetshop/htdocs/citypetshop.bd && git clone https://github.com/abrarfoysalofficial/citypetshop.bd .'
```

**Expected:** `Cloning into '.'...` then `done`.

---

### Step G: Create .env.production.local

*(If you skipped Step D, use your existing DB password instead of `/root/.citypetshop_db_pass`.)*

```bash
DB_PASS=$(sudo cat /root/.citypetshop_db_pass 2>/dev/null || echo "YOUR_EXISTING_DB_PASSWORD")
NEXTAUTH_SECRET=$(openssl rand -hex 32)
MASTER_SECRET=$(openssl rand -hex 32)
sudo -u citypetshop tee /home/citypetshop/htdocs/citypetshop.bd/.env.production.local <<ENV
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://citypetshop.bd
NEXTAUTH_URL=https://citypetshop.bd
APP_URL=https://citypetshop.bd
DATABASE_URL=postgresql://cityplus_app:${DB_PASS}@127.0.0.1:5432/cityplus_db?connection_limit=10&connect_timeout=10&pool_timeout=20
NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
AUTH_TRUST_HOST=true
# COOKIE_DOMAIN=.citypetshop.bd   # Uncomment if serving both www and non-www
# SENTRY_DSN=                     # Optional: enable Sentry for error tracking
MASTER_SECRET=${MASTER_SECRET}
UPLOAD_DIR=/home/citypetshop/htdocs/citypetshop.bd/uploads
ADMIN_EMAIL=admin@citypetshop.bd
ADMIN_PASSWORD=TempPass123ChangeMe
ENV
```

**Expected:** File written.

---

### Step H: Create uploads directory

```bash
sudo -u citypetshop mkdir -p /home/citypetshop/htdocs/citypetshop.bd/uploads
```

**Expected:** No output.

---

### Step I: Install, migrate, seed, build

```bash
sudo -u citypetshop bash -lc 'cd /home/citypetshop/htdocs/citypetshop.bd && npm ci'
```

**Expected:** `added X packages`.

```bash
sudo -u citypetshop bash -lc 'cd /home/citypetshop/htdocs/citypetshop.bd && npx prisma generate'
```

**Expected:** `Generated Prisma Client`.

```bash
sudo -u citypetshop bash -lc 'cd /home/citypetshop/htdocs/citypetshop.bd && npx prisma migrate deploy'
```

**Expected:** `X migration(s) applied`.

```bash
sudo -u citypetshop bash -lc 'cd /home/citypetshop/htdocs/citypetshop.bd && npm run db:seed'
```

**Expected:** `Tenant settings ready`, `Roles ready`, `Admin user ready`.

```bash
sudo -u citypetshop bash -lc 'cd /home/citypetshop/htdocs/citypetshop.bd && NODE_OPTIONS=--max-old-space-size=4096 npm run build'
```

**Expected:** `Compiled successfully`, `Route (app)`, build completes.

---

### Step J: Copy assets and start PM2

```bash
cd /home/citypetshop/htdocs/citypetshop.bd
cp -r public .next/standalone/public 2>/dev/null || true
cp -r .next/static .next/standalone/.next/static 2>/dev/null || true
APP_DIR=/home/citypetshop/htdocs/citypetshop.bd pm2 start ecosystem.config.js --env production --only cityplus
pm2 save
```

**Expected:** `[PM2] Starting ecosystem.config.js in env_production`, `App [cityplus] online`.

---

### Step K: Set temporary admin password (admin@citypetshop.bd / Admin 123)

```bash
cd /home/citypetshop/htdocs/citypetshop.bd
sudo -u citypetshop bash -lc 'ADMIN_EMAIL=admin@citypetshop.bd ADMIN_PASSWORD="Admin 123" npx tsx scripts/admin-reset.ts'
```

**Expected:** `Admin reset complete: admin@citypetshop.bd` and `Login at: https://citypetshop.bd/admin/login`.

---

### Step L: Verify site is live

```bash
curl -sf http://127.0.0.1:3000/api/health
```

**Expected:** JSON with `"status":"ok"` and `"database":"connected"`.

```bash
# DB-only health (for load balancer probes)
curl -sf http://127.0.0.1:3000/api/health/db
```

---

## CloudPanel Vhost / Reverse Proxy (Nginx)

Admin login and sessions require correct proxy headers. Ensure your vhost forwards:

- `X-Forwarded-Host`
- `X-Forwarded-Proto` (must be `https` for secure cookies)
- `X-Forwarded-For`

**CloudPanel:** Sites → citypetshop.bd → Vhost → Reverse Proxy:
- **Backend:** `http://127.0.0.1:3000`
- **WebSocket:** enabled if needed

**Nginx vhost** (CloudPanel often uses Nginx):

```nginx
location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Host $host;
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
}
```

**LiteSpeed/OpenLiteSpeed** (if used):

```apache
ProxyPreserveHost On
RequestHeader set X-Forwarded-Proto "https"
ProxyPass / http://127.0.0.1:3000/
ProxyPassReverse / http://127.0.0.1:3000/
```

---

## Login

- **URL:** https://citypetshop.bd/admin/login  
- **Email:** admin@citypetshop.bd  
- **Password:** Admin 123  

**Change the password after first login.**

---

## Restore uploads (if you ran Step B)

```bash
cp -r /home/citypetshop/backups/uploads/* /home/citypetshop/htdocs/citypetshop.bd/public/uploads/ 2>/dev/null || true
sudo chown -R citypetshop:citypetshop /home/citypetshop/htdocs/citypetshop.bd/public/uploads
```

---

## Production Redeploy Plan

See **[docs/PRODUCTION_REDEPLOY_PLAN.md](PRODUCTION_REDEPLOY_PLAN.md)** for:
- Folder structure (releases, shared, logs)
- Pre-deploy backup and post-deploy smoke tests
- Nginx config validation
- Rollback strategy
- Copy-paste command blocks

---

## Quick re-deploy (after initial setup)

```bash
cd /home/citypetshop/htdocs/citypetshop.bd
git pull origin main
npm ci
npx prisma migrate deploy
NODE_OPTIONS=--max-old-space-size=4096 npm run build
cp -r public .next/standalone/public 2>/dev/null || true
cp -r .next/static .next/standalone/.next/static 2>/dev/null || true
APP_DIR=/home/citypetshop/htdocs/citypetshop.bd pm2 startOrReload ecosystem.config.js --env production --update-env --only cityplus
pm2 save
curl -sf http://127.0.0.1:3000/api/health
```

---

## Production Runbook (Admin + PostgreSQL Stability)

### Health checks (run after deploy)

```bash
# 1. App health (DB + env)
curl -s http://127.0.0.1:3000/api/health | jq .

# Expected: {"status":"ok","database":"connected","checks":{"env":"ok","database":"ok"}}

# 2. Via HTTPS (through proxy)
curl -s https://citypetshop.bd/api/health | jq .

# 3. Admin login page loads
curl -sI https://citypetshop.bd/admin/login | head -1
# Expected: HTTP/2 200
```

### Verify admin login

1. Open https://citypetshop.bd/admin/login in a browser (HTTPS required for cookies).
2. Log in with admin@citypetshop.bd and your password.
3. You should land on `/admin` dashboard. If redirected to `/login`, proxy headers or `NEXTAUTH_URL` are wrong.

### Logs and debugging

```bash
# PM2 logs (errors, startup messages)
pm2 logs cityplus --lines 100

# Startup should show: [startup] Environment validated ✓
#                      [startup] PostgreSQL connected ✓

# If DB fails at startup: check DATABASE_URL, PostgreSQL service
sudo systemctl status postgresql
```

### PostgreSQL connectivity

```bash
# Health endpoint tests DB internally
curl -s http://127.0.0.1:3000/api/health | jq .database
# "connected" = OK
```

---

## Database Migration & Backup

See **[docs/DB_MIGRATION_RUNBOOK.md](DB_MIGRATION_RUNBOOK.md)** for:
- Non-destructive migration (`prisma migrate deploy`)
- Backup strategy (pg_dump before migration)
- PostgreSQL VPS settings (max_connections, pool)
- DB health endpoint (`/api/health/db`)

---

## Observability & Troubleshooting

See **[docs/OBSERVABILITY_TROUBLESHOOTING.md](OBSERVABILITY_TROUBLESHOOTING.md)** for:
- Where to check logs (PM2, Nginx, PostgreSQL)
- Structured log format (scope, requestId, errorCode)
- Debug steps for 502, 500, login loop, DB timeout
- Optional Sentry (`SENTRY_DSN`)

---

## Auth Production Guide

See **[docs/AUTH_PRODUCTION.md](AUTH_PRODUCTION.md)** for:
- Environment variables checklist
- Nginx reverse proxy config (required headers)
- Cookie configuration (secure, sameSite, domain)
- Smoke test plan (login, session, logout, protected routes)

---

## Troubleshooting

**Admin redirects to customer login:** Use https://citypetshop.bd/admin/login directly. Ensure `NEXTAUTH_URL=https://citypetshop.bd`, `NEXTAUTH_SECRET` (32+ chars), and `AUTH_TRUST_HOST=true` in `.env.production.local`.

**Session/cookie not persisting:** Ensure Nginx passes `X-Forwarded-Proto: https` and `X-Forwarded-Host`. NextAuth uses secure cookies in production; HTTP will fail.

**502 Bad Gateway:** PM2 app may not be running. Check: `pm2 status` and `pm2 logs cityplus`.

**Health returns 503 / database disconnected:** Check `pm2 logs cityplus` for DB errors. Verify PostgreSQL is running and `DATABASE_URL` is correct. Run `npx prisma migrate deploy` if migrations are pending.

**Permission denied:** Ensure files are owned by `citypetshop`: `sudo chown -R citypetshop:citypetshop /home/citypetshop/htdocs/citypetshop.bd`
