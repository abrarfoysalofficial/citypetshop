# City Plus Pet Shop — VPS Upgrade Guideline

> **Enterprise DevOps Guide** · Safe, step-by-step upgrade to new version  
> **Target:** Ubuntu 24.04 VPS · CyberPanel/OpenLiteSpeed · PM2 · PostgreSQL  
> **Domain:** citypetshopbd.com · **Port:** 3001 · **App Path:** /var/www/cityplus/app  
> **Last Updated:** 2026-02-23

---

## Table of Contents

1. [Pre-Upgrade Audit Summary](#1-pre-upgrade-audit-summary)
2. [Prerequisites](#2-prerequisites)
3. [Pre-Upgrade Checklist](#3-pre-upgrade-checklist)
4. [Step-by-Step Upgrade Procedure](#4-step-by-step-upgrade-procedure)
5. [Post-Upgrade Verification](#5-post-upgrade-verification)
6. [Rollback Procedure](#6-rollback-procedure)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. Pre-Upgrade Audit Summary

### Project Readiness

| Component | Status | Notes |
|-----------|--------|-------|
| Next.js 14 standalone | ✅ | `output: "standalone"` in next.config.js |
| Prisma + PostgreSQL | ✅ | Migrations ready, use `prisma migrate deploy` |
| PM2 ecosystem | ✅ | Uses `.next/standalone/server.js` on 127.0.0.1:3001 |
| OpenLiteSpeed proxy | ✅ | Must proxy `/` and `/admin` to 127.0.0.1:3001 |
| Environment vars | ✅ | `.env.production.local` required |
| Health check | ✅ | `/api/health` validates DB + env |
| Rollback plan | ✅ | App + DB backups before deploy |

### New Migrations in This Release

| Migration | Description |
|-----------|-------------|
| `20260222170000_add_about_page` | Adds `about_page_profiles`, `team_members` tables |
| `20260222180000_add_sales_top_bar_text` | Adds `sales_top_bar_text` to `site_settings` |
| `20260222190000_add_sales_top_bar_enabled` | Adds `sales_top_bar_enabled` to `site_settings` |

All migrations are **additive** and **non-destructive**. No data loss.

### New Features

- Upgraded `/about` page (Bengali content, SEO, 4-column features grid)
- Admin About page (Founder + Team management)
- Sales top bar (configurable text + enable/disable)
- Sliding sales bar component

---

## 2. Prerequisites

### On Your Local Machine (Before Pushing)

- [ ] Code committed and pushed to GitHub
- [ ] `npm run build` succeeds locally
- [ ] No TypeScript/lint errors

### On VPS (Before Upgrade)

| Requirement | Check Command |
|-------------|---------------|
| Node.js 18+ | `node -v` |
| npm 9+ | `npm -v` |
| PM2 5+ | `pm2 -v` |
| PostgreSQL 14+ | `psql --version` |
| Git | `git --version` |
| Disk space (≥2 GB free) | `df -h` |
| Memory (≥2 GB) | `free -h` |

### Required Paths

```
/var/www/cityplus/app          # Application root
/var/www/cityplus/uploads      # Upload directory (writable by cityplus user)
/backups/cityplus              # DB backups
/var/www/cityplus/releases     # App backups for rollback
/var/log/pm2                   # PM2 logs
/var/log/cityplus              # Deploy logs
```

---

## 3. Pre-Upgrade Checklist

Complete these **before** running the upgrade:

### 3.1 Backup Verification

```bash
# Ensure backup directories exist and are writable
sudo mkdir -p /backups/cityplus /var/www/cityplus/releases /var/log/cityplus
sudo chown abrar:abrar /backups/cityplus
sudo chown cityplus:cityplus /var/www/cityplus/releases
```

### 3.2 Environment File

```bash
# Verify .env.production.local exists and has required vars
cat /var/www/cityplus/app/.env.production.local | grep -E "^(DATABASE_URL|NEXTAUTH_SECRET|NEXTAUTH_URL|NEXT_PUBLIC_SITE_URL)=" | sed 's/=.*/=***/'
```

**Required variables:**

- `NODE_ENV=production`
- `DATABASE_URL=postgresql://...`
- `NEXTAUTH_SECRET` (32+ chars, generate with `openssl rand -hex 32`)
- `NEXTAUTH_URL=https://citypetshopbd.com`
- `NEXT_PUBLIC_SITE_URL=https://citypetshopbd.com`
- `AUTH_TRUST_HOST=true`
- `UPLOAD_DIR=/var/www/cityplus/uploads`

### 3.3 Current Health

```bash
# Site must be healthy before upgrade
curl -sf https://citypetshopbd.com/api/health
curl -sf http://127.0.0.1:3001/api/health
```

### 3.4 Maintenance Window (Optional)

For zero-downtime, upgrades typically take **2–5 minutes**. If desired, enable maintenance mode:

```bash
# Optional: Show maintenance page via OLS or Cloudflare
# Or proceed without — deploy script minimizes downtime
```

---

## 4. Step-by-Step Upgrade Procedure

### Phase 1: Connect & Prepare (as `abrar` or root)

```bash
# SSH into VPS
ssh abrar@your-vps-ip

# Ensure you're in app directory
cd /var/www/cityplus/app

# Verify current state
git status
git log -1 --oneline
pm2 status
```

### Phase 2: Run Automated Deploy Script (Recommended)

```bash
# Run the production deploy script (handles backup, build, migrate, restart)
sudo bash /var/www/cityplus/app/deploy/deploy-cityplus-vps.sh
```

The script will:

1. **Phase A** — Safety precheck (disk, memory, PM2 status)
2. **Phase B** — Backup DB + app (to `/backups/cityplus` and `/var/www/cityplus/releases`)
3. **Phase C** — `git pull --rebase`
4. **Phase D** — `npm ci` + `npm run build` + copy assets to standalone
5. **Phase E** — `prisma generate` + `prisma migrate deploy`
6. **Phase F** — `pm2 restart cityplus` + OLS restart
7. **Phase G** — End-to-end health checks

**If the script fails at any step, it exits immediately. Do not proceed. See [Rollback](#6-rollback-procedure).**

---

### Phase 3: Manual Upgrade (If Script Not Used)

If you prefer manual control, follow these steps in order:

#### Step 1: Backup Database

```bash
cd /var/www/cityplus/app
set -a
source .env.production.local
set +a

sudo mkdir -p /backups/cityplus
pg_dump "$DATABASE_URL" -F c -f /backups/cityplus/cityplus_db_$(date +%Y%m%d_%H%M%S).dump
ls -la /backups/cityplus/
```

#### Step 2: Backup Application

```bash
sudo -u cityplus mkdir -p /var/www/cityplus/releases
sudo -u cityplus tar -czf /var/www/cityplus/releases/app_backup_$(date +%Y%m%d_%H%M%S).tgz \
  -C /var/www/cityplus/app \
  --exclude=node_modules \
  --exclude=.git \
  --exclude=.next/cache \
  .
```

#### Step 3: Pull Latest Code

```bash
cd /var/www/cityplus/app
git fetch origin
git pull --rebase origin main
git log -1 --oneline
```

#### Step 4: Install Dependencies

```bash
sudo -u cityplus npm ci
```

#### Step 5: Build

```bash
sudo -u cityplus npm run build
```

Verify standalone output:

```bash
[ -d .next/standalone ] && echo "OK" || echo "FAIL"
[ -f .next/standalone/.next/BUILD_ID ] && echo "OK" || echo "FAIL"
```

#### Step 6: Copy Assets to Standalone

```bash
sudo -u cityplus bash -c "cd /var/www/cityplus/app && rm -rf .next/standalone/public && cp -r public .next/standalone/"
sudo -u cityplus bash -c "cd /var/www/cityplus/app && rm -rf .next/standalone/.next/static && cp -r .next/static .next/standalone/.next/"
```

#### Step 7: Run Database Migrations

```bash
sudo -u cityplus bash -c "set -a; source /var/www/cityplus/app/.env.production.local; set +a; cd /var/www/cityplus/app; npx prisma generate"
sudo -u cityplus bash -c "set -a; source /var/www/cityplus/app/.env.production.local; set +a; cd /var/www/cityplus/app; npx prisma migrate deploy"
```

**If migration fails:** Do NOT run `prisma migrate reset` or `prisma db push`. See [Troubleshooting](#7-troubleshooting).

#### Step 8: Restart PM2

```bash
sudo -u cityplus pm2 restart cityplus --update-env
sudo -u cityplus pm2 save
```

#### Step 9: Restart OpenLiteSpeed (if needed)

```bash
sudo systemctl restart lsws
```

---

## 5. Post-Upgrade Verification

### 5.1 Local Health Check

```bash
# Wait a few seconds for app to start
sleep 5

# Health endpoint (must return 200)
curl -sf http://127.0.0.1:3001/api/health
# Expected: {"status":"ok","database":"connected",...}

# Port listening
ss -lntp | grep 3001
```

### 5.2 Public Site Checks

```bash
# Homepage
curl -sI https://citypetshopbd.com/ | head -5

# Admin login (must NOT redirect to localhost)
curl -sI https://citypetshopbd.com/admin | head -10

# About page (new)
curl -sI https://citypetshopbd.com/about | head -5

# API health via domain
curl -sf https://citypetshopbd.com/api/health
```

### 5.3 Critical Paths to Test Manually

| Path | Expected |
|------|----------|
| `/` | Homepage loads |
| `/about` | About page with Bengali content |
| `/admin` | Redirects to `/admin/login` if not logged in |
| `/admin/login` | Login form loads |
| `/admin/about` | About page admin (Founder/Team) |
| `/admin/settings` | Settings (Sales top bar options) |
| `/api/health` | `{"status":"ok"}` |

### 5.4 Verify No Localhost Redirect

```bash
LOC=$(curl -sI https://citypetshopbd.com/admin 2>/dev/null | grep -i "^location:" | head -1)
if echo "$LOC" | grep -qi "localhost\|127\.0\.0\.1"; then
  echo "ERROR: Redirect to localhost detected!"
else
  echo "OK: No localhost redirect"
fi
```

---

## 6. Rollback Procedure

**Use only if upgrade fails or site is broken.**

### Quick Rollback (App Only)

```bash
# 1. Stop PM2
sudo -u cityplus pm2 stop cityplus

# 2. List backups (newest first)
ls -lt /var/www/cityplus/releases/app_backup_*.tgz

# 3. Pick backup from BEFORE failed deploy, e.g.:
BACKUP="/var/www/cityplus/releases/app_backup_20260222_120000.tgz"

# 4. Extract to temp
cd /var/www/cityplus
sudo -u cityplus mkdir -p app_rollback
sudo -u cityplus tar -xzf "$BACKUP" -C app_rollback

# 5. Preserve .env
sudo -u cityplus cp app/.env.production.local app_rollback/.env.production.local 2>/dev/null || true

# 6. Swap
sudo -u cityplus rm -rf app_failed
sudo -u cityplus mv app app_failed
sudo -u cityplus mv app_rollback app

# 7. Rebuild and restart
cd /var/www/cityplus/app
sudo -u cityplus bash -c "set -a; source .env.production.local; set +a; npx prisma generate"
sudo -u cityplus npm run build
sudo -u cityplus bash -c "rm -rf .next/standalone/public; cp -r public .next/standalone/; cp -r .next/static .next/standalone/.next/"
sudo -u cityplus pm2 start ecosystem.config.cjs --env production
sudo -u cityplus pm2 save
```

### Database Rollback (Only if Migration Broke DB)

```bash
# List DB backups
ls -lt /backups/cityplus/cityplus_db_*.dump

# Restore (replace with actual path)
pg_restore -d "$DATABASE_URL" --clean --if-exists /backups/cityplus/cityplus_db_YYYYMMDD_HHMMSS.dump
```

**Note:** Rolling back migrations is complex. Prefer restoring from DB backup if migration caused data issues.

---

## 7. Troubleshooting

### Build Fails

```bash
# Clear cache and retry
cd /var/www/cityplus/app
rm -rf .next node_modules
sudo -u cityplus npm ci
sudo -u cityplus npm run build
```

### Prisma Migration Fails

- **Never** run `prisma migrate reset` or `prisma db push` in production.
- Check migration status: `npx prisma migrate status`
- If migration partially applied: `npx prisma migrate resolve --rolled-back MIGRATION_NAME`
- Restore from DB backup if needed.

### PM2 Won't Start

```bash
# Check logs
pm2 logs cityplus --lines 100

# Verify standalone server exists
ls -la /var/www/cityplus/app/.next/standalone/server.js

# Verify .env
cat /var/www/cityplus/app/.env.production.local | grep -v PASSWORD | head -20
```

### Health Check Returns 503

- Check `DATABASE_URL` is correct and DB is reachable.
- Check `NEXTAUTH_SECRET` is set and ≥32 chars.
- Check `NEXTAUTH_URL` matches domain (no trailing slash).

### Localhost Redirect on /admin

- Ensure `NEXTAUTH_URL=https://citypetshopbd.com` (no www if domain is apex).
- Ensure `AUTH_TRUST_HOST=true`.
- Ensure OpenLiteSpeed sends `X-Forwarded-Proto: https` and `X-Forwarded-Host: citypetshopbd.com`.

### Port 3001 Not Listening

```bash
# Check if another process uses 3001
ss -lntp | grep 3001

# Restart PM2
sudo -u cityplus pm2 restart cityplus
sleep 5
ss -lntp | grep 3001
```

---

## 8. Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | `production` |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Yes | 32+ char hex (`openssl rand -hex 32`) |
| `NEXTAUTH_URL` | Yes | `https://citypetshopbd.com` |
| `NEXT_PUBLIC_SITE_URL` | Yes | `https://citypetshopbd.com` |
| `AUTH_TRUST_HOST` | Yes | `true` (for proxy) |
| `UPLOAD_DIR` | Yes | `/var/www/cityplus/uploads` |
| `SSLCOMMERZ_*` | For payments | Store ID, password, is_live |
| `RESEND_API_KEY` | For email | Resend.com API key |
| `BULK_SMS_BD_*` | For SMS | BulkSMS BD keys |

---

## 9. Quick Reference

### One-Line Deploy (After Prerequisites Met)

```bash
sudo bash /var/www/cityplus/app/deploy/deploy-cityplus-vps.sh
```

### Key Paths

| Path | Purpose |
|------|---------|
| `/var/www/cityplus/app` | Application root |
| `/var/www/cityplus/app/.env.production.local` | Production env (never commit) |
| `/var/www/cityplus/app/ecosystem.config.cjs` | PM2 config |
| `/var/www/cityplus/uploads` | Uploaded files |
| `/backups/cityplus` | DB backups |
| `/var/www/cityplus/releases` | App backups |
| `/var/log/pm2/cityplus-*.log` | PM2 logs |
| `/var/log/cityplus/deploy.log` | Deploy script log |

### Support

- **Developer:** Fresher IT BD · Abrar Foysal  
- **Email:** abrar@fresheritbd.com  
- **WhatsApp:** 01929524975  

---

*Document version: 1.0 · Generated for City Plus Pet Shop VPS upgrade*
