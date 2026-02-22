# City Plus Pet Shop — Complete Deployment & Operations Guide
> **Single source of truth** for setup, deployment, recovery, and daily operations.
> Last audited: 2026-02-22 | Stack: Next.js 14 · Prisma 5 · PostgreSQL 16 · PM2 · Ubuntu 24.04

---

## TABLE OF CONTENTS

1. [Project Architecture](#1-project-architecture)
2. [Confirmed Credentials & Secrets](#2-confirmed-credentials--secrets)
3. [Current Server State (Audit Findings)](#3-current-server-state-audit-findings)
4. [First-Time VPS Setup](#4-first-time-vps-setup)
5. [Fix Prisma P3009 Migration (Immediate)](#5-fix-prisma-p3009-migration-immediate)
6. [Deploy the Application](#6-deploy-the-application)
7. [Seed the Database (First Deploy Only)](#7-seed-the-database-first-deploy-only)
8. [Verify Everything is Working](#8-verify-everything-is-working)
9. [Day-to-Day Operations](#9-day-to-day-operations)
10. [GitHub Actions CI/CD Setup](#10-github-actions-cicd-setup)
11. [Troubleshooting Guide](#11-troubleshooting-guide)
12. [Security Audit Findings](#12-security-audit-findings)

---

## 1. Project Architecture

```
Browser
  │
  ▼
Cloudflare (DNS + DDoS + Cache)
  │
  ▼
Ubuntu 24.04 VPS
  ├── OpenLiteSpeed / Nginx (reverse proxy → port 3001)
  ├── PM2 → Node.js (Next.js 14 standalone, port 3001)
  │         App user: cityplus
  │         App path: /var/www/cityplus/app
  └── PostgreSQL 16
            DB: cityplus_db
            User: cityplus_app
```

### Tech Stack
| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js | 14.2.18 |
| ORM | Prisma | 5.22.0 |
| Database | PostgreSQL | 16 |
| Auth | NextAuth v4 (Credentials) | 4.24.10 |
| Process Manager | PM2 | 5+ |
| Payments | SSLCommerz | — |
| Email | Resend | 4.0.0 |
| Build Mode | Standalone (`output: "standalone"`) | — |
| Auth Mode | `prisma` (NextAuth JWT) | — |

### Key Code Facts (from audit)
- **Auth mode is hardcoded** to `"prisma"` in `src/config/runtime.ts` — no Supabase, no demo mode in production
- **DB connection** uses `DATABASE_URL` env var via Prisma singleton at `lib/db.ts`
- **Admin protection** via JWT token checked in `middleware.ts` and `lib/admin-auth.ts`
- **RBAC** (roles/permissions) is fully implemented — seed creates `super_admin`, `admin`, `moderator` roles
- **Health check** at `/api/health` — checks DB connection + env validation
- **Standalone build** — Next.js outputs to `.next/standalone/server.js` — must copy `public/` and `.next/static/` after build

---

## 2. Confirmed Credentials & Secrets

> These were set during the current session. Store them securely (e.g. Bitwarden).

### PostgreSQL
| Key | Value |
|---|---|
| Database name | `cityplus_db` |
| Database user | `cityplus_app` |
| Password | `Citypetshopbd2026Secure` |
| Host | `127.0.0.1` (TCP — not socket) |
| Port | `5432` |
| Full DATABASE_URL | `postgresql://cityplus_app:Citypetshopbd2026Secure@127.0.0.1:5432/cityplus_db` |

### Admin User (after seeding)
| Key | Value |
|---|---|
| Email | `admin@citypetshopbd.com` |
| Password | Set via `ADMIN_PASSWORD` env var at seed time |
| URL | `https://www.citypluspetshop.com/admin/login` |

### Server Users
| OS User | Purpose | App Path |
|---|---|---|
| `abrar` | System admin (sudo) | — |
| `cityplus` | Application runtime | `/var/www/cityplus/app` |

---

## 3. Current Server State (Audit Findings)

Based on the terminal screenshots reviewed during audit:

| Item | Status | Notes |
|---|---|---|
| PostgreSQL 16 | ✅ Running | `cityplus_db` exists, `cityplus_app` user exists |
| `cityplus_app` password | ✅ Set | `Citypetshopbd2026Secure` |
| `pg_hba.conf` TCP auth | ✅ Fixed | `scram-sha-256` for 127.0.0.1 |
| `/var/www/cityplus/app` | ⚠️ Exists but empty/partial | Git clone was blocked by non-empty dir |
| `.env.production.local` | ❌ Not created yet | Blocking all Prisma commands |
| Migration P3009 | ❌ Failed | `20250221100000_enterprise_phases` — enum ownership issue |
| PM2 `cityplus` app | ❌ Not started | App not deployed yet |
| Backup dir | ✅ Created | `/var/backups/cityplus/` |
| `deploybot` user | ⚠️ Created but not in plan | Not used by any scripts — ignore or delete |

---

## 4. First-Time VPS Setup

> Run all commands as `abrar`. Skip steps already done.

### 4.1 — System packages

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl wget unzip postgresql-client
```

### 4.2 — Install Node.js 20 via NVM

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
nvm alias default 20
node -v
```

### 4.3 — Install PM2 globally

```bash
npm install -g pm2
pm2 -v
```

### 4.4 — Create application OS user

```bash
sudo useradd -m -s /bin/bash cityplus
sudo mkdir -p /var/www/cityplus/app
sudo mkdir -p /var/www/cityplus/uploads
sudo chown -R cityplus:cityplus /var/www/cityplus
sudo chmod 750 /var/www/cityplus/uploads
```

### 4.5 — Create PostgreSQL database (if not done)

```bash
sudo -u postgres psql -c "CREATE USER cityplus_app WITH PASSWORD 'Citypetshopbd2026Secure';"
sudo -u postgres psql -c "CREATE DATABASE cityplus_db OWNER cityplus_app;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE cityplus_db TO cityplus_app;"
sudo -u postgres psql -d cityplus_db -c "GRANT ALL ON SCHEMA public TO cityplus_app;"
sudo -u postgres psql -d cityplus_db -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO cityplus_app;"
sudo -u postgres psql -d cityplus_db -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO cityplus_app;"
```

Verify:
```bash
sudo -u postgres psql -c "\l cityplus_db"
```

### 4.6 — Configure pg_hba.conf for TCP password auth

```bash
sudo nano /etc/postgresql/16/main/pg_hba.conf
```

Add this line **before** the `local all all peer` line:
```
host    cityplus_db     cityplus_app    127.0.0.1/32            scram-sha-256
```

```bash
sudo systemctl reload postgresql
```

Verify:
```bash
psql -h 127.0.0.1 -U cityplus_app -d cityplus_db -c "SELECT 1 AS connected;"
# Enter password when prompted: Citypetshopbd2026Secure
```

### 4.7 — Create backup directory

```bash
sudo mkdir -p /var/backups/cityplus
sudo chown root:root /var/backups/cityplus
sudo chmod 755 /var/backups/cityplus
```

### 4.8 — Create PM2 log directory

```bash
sudo mkdir -p /var/log/pm2 /var/log/cityplus
sudo chown cityplus:cityplus /var/log/pm2 /var/log/cityplus
```

### 4.9 — Install sudoers for least-privilege backup

```bash
sudo tee /etc/sudoers.d/cityplus > /dev/null << 'EOF'
# City Plus Pet Shop — allow pg_dump only
cityplus ALL=(postgres) NOPASSWD: /usr/bin/pg_dump -Fc -d cityplus_db -f /var/backups/cityplus/*.dump
EOF
sudo chmod 440 /etc/sudoers.d/cityplus
sudo visudo -c -f /etc/sudoers.d/cityplus
```

---

## 5. Fix Prisma P3009 Migration (Immediate)

> The migration `20250221100000_enterprise_phases` failed because `cityplus_app` didn't own the `OrderStatus` enum when it tried to `ALTER TYPE "OrderStatus" ADD VALUE 'draft'`.

**Run these in order. Do NOT skip steps.**

### Step A — Backup first (as abrar)

```bash
sudo -u postgres pg_dump -Fc -d cityplus_db -f /tmp/cityplus_pre_p3009_fix.dump
sudo mv /tmp/cityplus_pre_p3009_fix.dump /var/backups/cityplus/
sudo ls -lh /var/backups/cityplus/
```

### Step B — Check migration state (as abrar)

```bash
sudo -u postgres psql -d cityplus_db -c "SELECT migration_name, applied_steps_count, finished_at IS NOT NULL AS done FROM _prisma_migrations ORDER BY started_at DESC LIMIT 10;"
```

### Step C — Check enum values (as abrar)

```bash
sudo -u postgres psql -d cityplus_db -c "SELECT enumlabel FROM pg_enum JOIN pg_type ON pg_enum.enumtypid = pg_type.oid WHERE pg_type.typname = 'OrderStatus' ORDER BY enumsortorder;"
```

### Step D — Fix enum ownership (as abrar)

```bash
sudo -u postgres psql -d cityplus_db -c "REASSIGN OWNED BY postgres TO cityplus_app;"
```

Verify:
```bash
sudo -u postgres psql -d cityplus_db -c "SELECT typname, rolname AS owner FROM pg_type JOIN pg_roles ON pg_type.typowner = pg_roles.oid WHERE typname = 'OrderStatus';"
```

### Step E — Resolve the failed migration

First create the .env file (required for Prisma CLI):

```bash
sudo -u cityplus tee /var/www/cityplus/app/.env.production.local > /dev/null << 'ENVEOF'
NODE_ENV=production
DATABASE_URL=postgresql://cityplus_app:Citypetshopbd2026Secure@127.0.0.1:5432/cityplus_db
NEXTAUTH_URL=https://www.citypluspetshop.com
NEXTAUTH_SECRET=PLACEHOLDER_REPLACE_AFTER_COPY
NEXT_PUBLIC_SITE_URL=https://www.citypluspetshop.com
APP_URL=https://www.citypluspetshop.com
UPLOAD_DIR=/var/www/cityplus/uploads
PORT=3001
ENVEOF
sudo chmod 600 /var/www/cityplus/app/.env.production.local
```

Generate NEXTAUTH_SECRET and insert it:
```bash
SECRET=$(openssl rand -hex 32)
sudo -u cityplus sed -i "s|PLACEHOLDER_REPLACE_AFTER_COPY|$SECRET|" /var/www/cityplus/app/.env.production.local
echo "Generated NEXTAUTH_SECRET: $SECRET"
echo "SAVE THIS VALUE SECURELY ↑"
```

Now check whether to mark as `--applied` or `--rolled-back`:

```bash
# Count migration tables
sudo -u postgres psql -d cityplus_db -t -c "SELECT COUNT(*) FROM pg_tables WHERE schemaname='public' AND tablename IN ('order_tags','inventory_logs','collections','flash_sale_rules','landing_pages','draft_orders','fraud_flags');"
```

```bash
# Check if 'draft' enum exists
sudo -u postgres psql -d cityplus_db -t -c "SELECT COUNT(*) FROM pg_enum JOIN pg_type ON pg_enum.enumtypid=pg_type.oid WHERE pg_type.typname='OrderStatus' AND pg_enum.enumlabel='draft';"
```

**Decision:**
- Count ≥ 5 tables **AND** draft enum = 1 → use `--applied` (migration actually ran)
- Count < 5 tables **OR** draft enum = 0 → use `--rolled-back` (re-runs cleanly)

```bash
# Option A: mark as applied (everything exists)
sudo -u cityplus bash -c "cd /var/www/cityplus/app && DATABASE_URL='postgresql://cityplus_app:Citypetshopbd2026Secure@127.0.0.1:5432/cityplus_db' npx prisma migrate resolve --applied 20250221100000_enterprise_phases"

# Option B: mark as rolled-back (will re-run)
sudo -u cityplus bash -c "cd /var/www/cityplus/app && DATABASE_URL='postgresql://cityplus_app:Citypetshopbd2026Secure@127.0.0.1:5432/cityplus_db' npx prisma migrate resolve --rolled-back 20250221100000_enterprise_phases"
```

### Step F — Verify clean state

```bash
sudo -u cityplus bash -c "cd /var/www/cityplus/app && DATABASE_URL='postgresql://cityplus_app:Citypetshopbd2026Secure@127.0.0.1:5432/cityplus_db' npx prisma migrate status"
```

Expected: No failed migrations shown. Possibly pending ones — that's fine for now.

---

## 6. Deploy the Application

### 6.1 — Get the code onto the server

**If `/var/www/cityplus/app` is empty or has junk files:**
```bash
sudo rm -rf /var/www/cityplus/app
sudo mkdir -p /var/www/cityplus/app
sudo chown cityplus:cityplus /var/www/cityplus/app
sudo -u cityplus git clone https://github.com/YOUR_ORG/city-plus-pet-shop.git /var/www/cityplus/app
```

**If it's already a git repo (run `git status` to check):**
```bash
sudo -u cityplus bash -c "cd /var/www/cityplus/app && git fetch origin && git checkout main && git pull origin main"
```

### 6.2 — Create `.env.production.local` (if not done in Step 5E)

```bash
sudo -u cityplus tee /var/www/cityplus/app/.env.production.local > /dev/null << 'ENVEOF'
NODE_ENV=production
DATABASE_URL=postgresql://cityplus_app:Citypetshopbd2026Secure@127.0.0.1:5432/cityplus_db
NEXTAUTH_URL=https://www.citypluspetshop.com
NEXTAUTH_SECRET=YOUR_64_CHAR_HEX_FROM_STEP_5E
NEXT_PUBLIC_SITE_URL=https://www.citypluspetshop.com
APP_URL=https://www.citypluspetshop.com
UPLOAD_DIR=/var/www/cityplus/uploads
PORT=3001
SSLCOMMERZ_STORE_ID=your_store_id
SSLCOMMERZ_STORE_PASSWORD=your_store_password
SSLCOMMERZ_IS_LIVE=false
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM=noreply@citypluspetshop.com
BULK_SMS_BD_API_KEY=your_sms_key
BULK_SMS_BD_SENDER_ID=CityPlus
NEXT_PUBLIC_SUPPORT_PHONE=01XXXXXXXXX
NEXT_PUBLIC_SUPPORT_EMAIL=support@citypluspetshop.com
ENVEOF
sudo chmod 600 /var/www/cityplus/app/.env.production.local
sudo chown cityplus:cityplus /var/www/cityplus/app/.env.production.local
```

### 6.3 — Install dependencies

```bash
sudo -u cityplus bash -c "cd /var/www/cityplus/app && npm ci --omit=dev"
```

### 6.4 — Run all database migrations

```bash
sudo -u cityplus bash -c "cd /var/www/cityplus/app && DATABASE_URL='postgresql://cityplus_app:Citypetshopbd2026Secure@127.0.0.1:5432/cityplus_db' npx prisma migrate deploy"
```

Verify:
```bash
sudo -u cityplus bash -c "cd /var/www/cityplus/app && DATABASE_URL='postgresql://cityplus_app:Citypetshopbd2026Secure@127.0.0.1:5432/cityplus_db' npx prisma migrate status"
```

### 6.5 — Generate Prisma client

```bash
sudo -u cityplus bash -c "cd /var/www/cityplus/app && npx prisma generate"
```

### 6.6 — Build the application

```bash
sudo -u cityplus bash -c "cd /var/www/cityplus/app && NODE_OPTIONS=--max-old-space-size=4096 npm run build"
```

> This takes 3–8 minutes. If it runs out of memory, the server needs more RAM or a swap file (see Troubleshooting §11.4).

### 6.7 — Copy static assets into standalone output

> **This step is mandatory.** Next.js standalone mode does NOT include public/ or static/ automatically.

```bash
sudo -u cityplus bash -c "cp -r /var/www/cityplus/app/public /var/www/cityplus/app/.next/standalone/public"
sudo -u cityplus bash -c "cp -r /var/www/cityplus/app/.next/static /var/www/cityplus/app/.next/standalone/.next/static"
```

### 6.8 — Start with PM2

```bash
sudo -u cityplus bash -c "cd /var/www/cityplus/app && pm2 start ecosystem.config.cjs --env production"
sudo -u cityplus bash -c "pm2 save"
```

Enable PM2 auto-start on server reboot:
```bash
sudo env PATH=$PATH:/home/cityplus/.nvm/versions/node/v20.x.x/bin pm2 startup systemd -u cityplus --hp /home/cityplus
# Run the command PM2 prints
sudo systemctl enable pm2-cityplus
```

### 6.9 — Verify the app is running

```bash
pm2 list
curl -sf http://127.0.0.1:3001/api/health
```

Expected response:
```json
{"status":"ok","timestamp":"2026-02-22T...","database":"connected"}
```

---

## 7. Seed the Database (First Deploy Only)

> Seeds: admin user, site settings, payment gateways (COD default), RBAC roles/permissions, sample product.
> **Run ONCE only.** Safe to re-run — all operations are `upsert`.

```bash
sudo -u cityplus bash -c "cd /var/www/cityplus/app && DATABASE_URL='postgresql://cityplus_app:Citypetshopbd2026Secure@127.0.0.1:5432/cityplus_db' ADMIN_EMAIL='admin@citypetshopbd.com' ADMIN_PASSWORD='YourStrongPassword123!' NODE_ENV=production npx tsx prisma/seed.ts"
```

> Replace `YourStrongPassword123!` with your real admin password.
> After seeding, login at: `https://www.citypluspetshop.com/admin/login`

---

## 8. Verify Everything is Working

Run these checks in order:

```bash
# 1. PM2 process is running
sudo -u cityplus bash -c "pm2 list"

# 2. App responds on port 3001
curl -sf http://127.0.0.1:3001/api/health

# 3. Database has tables
sudo -u postgres psql -d cityplus_db -c "\dt" | head -30

# 4. Migrations are all applied
sudo -u cityplus bash -c "cd /var/www/cityplus/app && DATABASE_URL='postgresql://cityplus_app:Citypetshopbd2026Secure@127.0.0.1:5432/cityplus_db' npx prisma migrate status"

# 5. No PM2 errors in last 50 lines
sudo -u cityplus bash -c "pm2 logs cityplus --lines 50 --nostream"

# 6. Admin user exists
sudo -u postgres psql -d cityplus_db -c "SELECT email, role FROM users WHERE role='admin';"
```

---

## 9. Day-to-Day Operations

### Restart the app

```bash
sudo -u cityplus bash -c "pm2 reload cityplus --update-env"
```

### View live logs

```bash
sudo -u cityplus bash -c "pm2 logs cityplus"
```

### View error logs only

```bash
tail -f /var/log/pm2/cityplus-error.log
```

### Deploy a new version (manual)

```bash
sudo -u cityplus bash -c "cd /var/www/cityplus/app && git pull origin main"
sudo -u cityplus bash -c "cd /var/www/cityplus/app && npm ci --omit=dev"
sudo -u cityplus bash -c "cd /var/www/cityplus/app && DATABASE_URL='postgresql://cityplus_app:Citypetshopbd2026Secure@127.0.0.1:5432/cityplus_db' npx prisma migrate deploy"
sudo -u cityplus bash -c "cd /var/www/cityplus/app && NODE_OPTIONS=--max-old-space-size=4096 npm run build"
sudo -u cityplus bash -c "cp -r /var/www/cityplus/app/public /var/www/cityplus/app/.next/standalone/public"
sudo -u cityplus bash -c "cp -r /var/www/cityplus/app/.next/static /var/www/cityplus/app/.next/standalone/.next/static"
sudo -u cityplus bash -c "pm2 reload cityplus --update-env"
curl -sf http://127.0.0.1:3001/api/health
```

### Manual database backup

```bash
sudo -u postgres pg_dump -Fc -d cityplus_db -f /tmp/cityplus_manual_$(date +%Y%m%d_%H%M%S).dump
sudo mv /tmp/cityplus_manual_*.dump /var/backups/cityplus/
ls -lh /var/backups/cityplus/
```

### Automated daily backup (cron)

```bash
sudo crontab -e
```

Add this line:
```cron
0 2 * * * sudo -u postgres pg_dump -Fc -d cityplus_db -f /var/backups/cityplus/daily_$(date +\%Y\%m\%d).dump && find /var/backups/cityplus -name "daily_*.dump" -mtime +30 -delete
```

### Check disk space

```bash
df -h /var/www /var/backups /var/log
```

### Reset admin password (if locked out)

```bash
# Generate bcrypt hash for new password
sudo -u cityplus bash -c "cd /var/www/cityplus/app && node -e \"const bcrypt = require('bcryptjs'); bcrypt.hash('NewPassword123!', 12).then(h => console.log(h));\""

# Update in DB (replace the hash value)
sudo -u postgres psql -d cityplus_db -c "UPDATE users SET password_hash = 'PASTE_HASH_HERE' WHERE email = 'admin@citypetshopbd.com';"
```

---

## 10. GitHub Actions CI/CD Setup

### Repository secrets to add

Go to: **GitHub → Your repo → Settings → Secrets and variables → Actions**

| Secret | Value |
|---|---|
| `PRODUCTION_HOST` | VPS IP address |
| `PRODUCTION_SSH_KEY` | SSH private key for `cityplus` user (see below) |
| `PRODUCTION_SSH_PORT` | `22` |

### Generate SSH deploy key for GitHub Actions

```bash
# On the VPS, as abrar
sudo -u cityplus ssh-keygen -t ed25519 -C "github-deploy-production" -f /home/cityplus/.ssh/deploy_key -N ""
cat /home/cityplus/.ssh/deploy_key.pub >> /home/cityplus/.ssh/authorized_keys
sudo chmod 600 /home/cityplus/.ssh/authorized_keys
sudo chown cityplus:cityplus /home/cityplus/.ssh/authorized_keys

# Print private key → paste into GitHub Secret PRODUCTION_SSH_KEY
sudo cat /home/cityplus/.ssh/deploy_key
```

### GitHub environment setup

1. Go to **Settings → Environments → New environment**
2. Name it `production`
3. Add **Required reviewers**: `abrar`
4. Restrict to branch: `main`

### Trigger a production deploy

1. Merge changes to `main` branch
2. Go to **Actions → Deploy — City Plus Pet Shop**
3. Click **Run workflow** → select `production` → **Run workflow**
4. Approve the deployment in the environment protection dialog

---

## 11. Troubleshooting Guide

### 11.1 — Prisma: P1012 Environment variable not found: DATABASE_URL

**Cause:** `.env.production.local` doesn't exist or Prisma can't load it.

**Fix:** Always pass DATABASE_URL explicitly:
```bash
DATABASE_URL='postgresql://cityplus_app:Citypetshopbd2026Secure@127.0.0.1:5432/cityplus_db' npx prisma migrate deploy
```

Or verify the file exists:
```bash
sudo -u cityplus cat /var/www/cityplus/app/.env.production.local
```

### 11.2 — PostgreSQL: Peer authentication failed for user "cityplus_app"

**Cause:** Connecting via Unix socket without matching OS username.

**Fix:** Always use `127.0.0.1` (TCP), never `localhost` (socket):
```bash
# WRONG (uses socket → peer auth)
psql -U cityplus_app -d cityplus_db

# CORRECT (uses TCP → password auth)
psql -h 127.0.0.1 -U cityplus_app -d cityplus_db
```

Or use the postgres superuser for admin queries:
```bash
sudo -u postgres psql -d cityplus_db -c "YOUR QUERY"
```

### 11.3 — pg_dump: Permission denied writing to /var/backups/cityplus

**Cause:** The directory permissions block the postgres user.

**Fix:** Always use `/tmp` as intermediate:
```bash
sudo -u postgres pg_dump -Fc -d cityplus_db -f /tmp/backup.dump
sudo mv /tmp/backup.dump /var/backups/cityplus/backup_$(date +%Y%m%d_%H%M%S).dump
```

### 11.4 — Build fails: JavaScript heap out of memory

**Cause:** VPS has < 2GB RAM with no swap.

**Fix:** Add a swap file:
```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
free -h
```

Then retry build:
```bash
sudo -u cityplus bash -c "cd /var/www/cityplus/app && NODE_OPTIONS=--max-old-space-size=3072 npm run build"
```

### 11.5 — PM2: App keeps restarting (crash loop)

**Diagnose:**
```bash
sudo -u cityplus bash -c "pm2 logs cityplus --lines 100 --nostream"
```

**Common causes:**
- Missing `.env.production.local` → create the file
- `DATABASE_URL` wrong → test connection first
- `.next/standalone/server.js` missing → rebuild
- Static assets not copied → re-run copy step from §6.7

### 11.6 — App returns 503 on health check

**Check sequence:**
```bash
# Is PM2 running?
sudo -u cityplus bash -c "pm2 list"

# Is port 3001 listening?
ss -tlnp | grep 3001

# Is DB reachable?
psql -h 127.0.0.1 -U cityplus_app -d cityplus_db -c "SELECT 1;"

# Any JS errors?
sudo -u cityplus bash -c "pm2 logs cityplus --lines 50 --nostream"
```

### 11.7 — Admin login doesn't work

**Check 1:** Is `NEXTAUTH_SECRET` set in `.env.production.local`?
```bash
sudo -u cityplus grep NEXTAUTH_SECRET /var/www/cityplus/app/.env.production.local
```

**Check 2:** Does the admin user exist in DB?
```bash
sudo -u postgres psql -d cityplus_db -c "SELECT email, role FROM users;"
```

**Check 3:** Re-seed if empty:
```bash
sudo -u cityplus bash -c "cd /var/www/cityplus/app && DATABASE_URL='postgresql://cityplus_app:Citypetshopbd2026Secure@127.0.0.1:5432/cityplus_db' ADMIN_EMAIL='admin@citypetshopbd.com' ADMIN_PASSWORD='YourPassword123!' NODE_ENV=production npx tsx prisma/seed.ts"
```

### 11.8 — Git clone fails: destination path already exists

```bash
# Check what's in the directory
sudo -u cityplus bash -c "ls -la /var/www/cityplus/app"
sudo -u cityplus bash -c "cd /var/www/cityplus/app && git status 2>&1"

# If it's a git repo: pull instead of clone
sudo -u cityplus bash -c "cd /var/www/cityplus/app && git fetch origin && git checkout main && git pull origin main --ff-only"

# If it's NOT a git repo: clear and re-clone
sudo rm -rf /var/www/cityplus/app
sudo mkdir -p /var/www/cityplus/app
sudo chown cityplus:cityplus /var/www/cityplus/app
sudo -u cityplus git clone https://github.com/YOUR_ORG/city-plus-pet-shop.git /var/www/cityplus/app
```

---

## 12. Security Audit Findings

### ✅ Good (already in place)

| Finding | Status |
|---|---|
| Dedicated OS user `cityplus` (no root app) | ✅ |
| Dedicated DB user `cityplus_app` (not superuser) | ✅ |
| Hardcoded `AUTH_MODE="prisma"` — no demo mode in prod | ✅ |
| Rate limiting on admin login (5 req/15min per IP) | ✅ |
| RBAC with granular permissions | ✅ |
| bcrypt password hashing (cost 12) | ✅ |
| Security headers (X-Frame-Options, CSP, HSTS) | ✅ |
| `.env` files in `.gitignore` | ✅ |
| Health check validates env before reporting OK | ✅ |
| `SSLCOMMERZ_IS_LIVE=false` initially (sandbox) | ✅ |

### ⚠️ Needs Attention

| Finding | Risk | Action |
|---|---|---|
| DB password `Citypetshopbd2026Secure` is now known in git history via previous terminal sessions | Medium | Change after setup: `sudo -u postgres psql -c "ALTER USER cityplus_app WITH PASSWORD 'NEW_STRONG_PASS';"` then update `.env.production.local` |
| `deploybot` user created on server but not used | Low | Delete: `sudo userdel -r deploybot` |
| No automatic DB backup cron job set up yet | High | Set up cron from §9 immediately |
| SSH password auth may still be enabled | High | Disable: `sudo nano /etc/ssh/sshd_config` → `PasswordAuthentication no` → `sudo systemctl restart sshd` |
| `SSLCOMMERZ_IS_LIVE=true` set in env example | High | Only switch to `true` after going live and testing payments in sandbox first |
| No firewall rules yet | High | Run: `sudo ufw allow 22 && sudo ufw allow 80 && sudo ufw allow 443 && sudo ufw enable` |
| No SSL certificate yet | High | Run: `sudo apt install certbot && sudo certbot certonly --standalone -d citypluspetshop.com -d www.citypluspetshop.com` |

### 🔒 After Go-Live Checklist

```bash
# 1. Change DB password
sudo -u postgres psql -c "ALTER USER cityplus_app WITH PASSWORD 'NEW_UNIQUE_STRONG_PASS';"
sudo -u cityplus sed -i 's|Citypetshopbd2026Secure|NEW_UNIQUE_STRONG_PASS|g' /var/www/cityplus/app/.env.production.local
sudo -u cityplus bash -c "pm2 reload cityplus --update-env"

# 2. Delete unused deploybot user
sudo userdel -r deploybot 2>/dev/null || true

# 3. Enable UFW firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
sudo ufw status

# 4. Disable SSH password auth
sudo sed -i 's/^#*PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo systemctl restart sshd

# 5. Set up daily backup cron
sudo crontab -e
# Add: 0 2 * * * sudo -u postgres pg_dump -Fc -d cityplus_db -f /var/backups/cityplus/daily_$(date +\%Y\%m\%d).dump

# 6. Verify SSL is working
curl -I https://www.citypluspetshop.com/api/health
```

---

## Quick Reference Card

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 CITY PLUS PET SHOP — QUICK REFERENCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 App dir       /var/www/cityplus/app
 App user      cityplus
 Admin user    abrar (sudo)
 DB name       cityplus_db
 DB user       cityplus_app
 DB host       127.0.0.1:5432
 App port      3001
 PM2 name      cityplus

 Start         pm2 start ecosystem.config.cjs --env production
 Reload        pm2 reload cityplus --update-env
 Logs          pm2 logs cityplus
 Health        curl http://127.0.0.1:3001/api/health
 Backup        sudo -u postgres pg_dump -Fc -d cityplus_db -f /tmp/bak.dump

 Admin login   /admin/login
 Build cmd     NODE_OPTIONS=--max-old-space-size=4096 npm run build
 Migrate       DATABASE_URL='...' npx prisma migrate deploy
 Seed          DATABASE_URL='...' ADMIN_EMAIL='...' ADMIN_PASSWORD='...' NODE_ENV=production npx tsx prisma/seed.ts
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
