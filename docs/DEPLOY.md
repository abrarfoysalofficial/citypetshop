# City Plus Pet Shop — Production Deployment

**Stack:** Ubuntu 24.04 · CyberPanel/OpenLiteSpeed · PM2 · PostgreSQL · Cloudflare  
**App Path:** `/var/www/cityplus/app` · **Port:** 3000 (127.0.0.1 only)  
**Runtime:** systemd → pm2-cityplus.service → PM2 → Next.js standalone (no Docker)

---

## 0. First Deploy (One-Time)

For a **brand-new** deployment, follow this sequence once:

1. **Prerequisites** (Section 1) — VPS, Node.js, PostgreSQL, PM2
2. **PostgreSQL** (Section 3) — Create DB and user
3. **Application** (Section 4) — Clone repo, `npm ci --omit=dev`, `npx prisma generate`
4. **Environment** (Section 5) — Create `.env.production.local` with `DATABASE_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `UPLOAD_DIR`, and **`INITIAL_ADMIN_EMAIL`**, **`INITIAL_ADMIN_PASSWORD`** (min 12 chars), **`INITIAL_ADMIN_NAME`**
5. **Database** — Run `npm run db:setup` (migrate + seed). This creates the admin user. **Change password** at `/admin/settings/security` after first login.
6. **Upload dir** — `sudo mkdir -p /var/www/cityplus/uploads && sudo chown $USER:$USER /var/www/cityplus/uploads`
7. **Build** (Section 7) — `NODE_OPTIONS=--max-old-space-size=4096 npm run build` + copy public/static
8. **PM2** (Section 8) — Start app
9. **Proxy** (Section 9) — CyberPanel/OpenLiteSpeed proxy to 127.0.0.1:3000
10. **Verify** — `curl -sf http://127.0.0.1:3000/api/health` → `{"status":"ok"}`; login at `/admin`

**Subsequent deploys:** Use `bash deploy/deploy-production.sh` (does not run seed).

---

## 1. Prerequisites

| Requirement | Min |
|-------------|-----|
| VPS RAM | 2 GB (4 GB for multi-site) |
| OS | Ubuntu 24.04 LTS |
| Node.js | 18.x or 20.x (nvm) |
| PostgreSQL | 14+ |
| PM2 | 5+ |
| CyberPanel | 2.3+ |

---

## 2. VPS Setup

```bash
sudo apt update && sudo apt upgrade -y
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
source ~/.bashrc
nvm install 18 && nvm use 18 && nvm alias default 18
npm install -g pm2 prisma
```

---

## 3. PostgreSQL

```bash
sudo apt install postgresql postgresql-contrib -y
sudo systemctl enable postgresql && sudo systemctl start postgresql

sudo -u postgres psql <<'SQL'
CREATE USER cityplus_app WITH PASSWORD 'CHANGE_ME_STRONG_PASSWORD';
CREATE DATABASE cityplus_db OWNER cityplus_app;
GRANT ALL PRIVILEGES ON DATABASE cityplus_db TO cityplus_app;
GRANT ALL ON SCHEMA public TO cityplus_app;
SQL
```

Use `127.0.0.1` in `DATABASE_URL`, not `localhost`.

---

## 4. Application

```bash
sudo mkdir -p /var/www/cityplus
sudo chown $USER:$USER /var/www/cityplus
cd /var/www/cityplus
git clone <repo-url> app
cd app
npm ci --omit=dev
npx prisma generate
```

---

## 5. Environment Variables

Create `.env.production.local`:

```env
NODE_ENV=production
DATABASE_URL=postgresql://cityplus_app:PASSWORD@127.0.0.1:5432/cityplus_db
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_replace_me
CLERK_SECRET_KEY=sk_live_replace_me
NEXT_PUBLIC_SITE_URL=https://citypetshop.bd
APP_URL=https://citypetshop.bd

# Email (order confirmation)
RESEND_API_KEY=re_xxxxx
EMAIL_FROM=noreply@citypetshop.bd

# SMS (optional)
BULK_SMS_BD_API_KEY=xxx
BULK_SMS_BD_SENDER_ID=CityPlus

# Storage — REQUIRED for media persistence across deploys
# Must be an absolute path outside the app directory. Survives app restart, rebuild, redeploy.
# Create: sudo mkdir -p /var/www/cityplus/uploads && sudo chown $USER:$USER /var/www/cityplus/uploads
UPLOAD_DIR=/var/www/cityplus/uploads

# Secure Config (required for Admin Integrations — courier, etc.)
# Generate with: openssl rand -hex 32
MASTER_SECRET=<openssl rand -hex 32>

# Redis (optional, for rate limiting / sessions)
REDIS_URL=redis://127.0.0.1:6379


**Required:** `DATABASE_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`.  
**Integrations:** `MASTER_SECRET` (32+ chars) required for encrypted credentials (Admin → Integrations).  
**Courier go-live:** `MASTER_SECRET` + provider keys in Admin → Integrations; Admin → Courier: enable provider, set Sandbox OFF for production.  
**Invoice API:** Auth-only. Guests get invoice via email/track-order.

**Domain-safe:** Set `NEXT_PUBLIC_SITE_URL` and `APP_URL` to your actual deployment URL. Configure Clerk allowed redirect URLs to match your domain(s).

**Initial admin:** Set `INITIAL_ADMIN_EMAIL`, `INITIAL_ADMIN_PASSWORD` (min 12 chars), `INITIAL_ADMIN_NAME` before running `db:seed`. The seed creates the admin only if it does not exist; it never overwrites an existing password. After first login, change the password at `/admin/settings/security`.

### Infra vs Business Config (Handover)

| Config | Where | Notes |
|-------|-------|------|
| DATABASE_URL, Clerk keys, UPLOAD_DIR, MASTER_SECRET | .env only | Infrastructure; not admin-manageable |
| Payment credentials (SSLCommerz, bKash, etc.) | Admin → Payments | DB-backed; no .env needed |
| Courier credentials (Pathao, Steadfast, RedX) | Admin → Integrations | Encrypted in SecureConfig |
| Courier enable/sandbox | Admin → Courier | DB-backed |
| Tracking (FB Pixel, TikTok, GTM, GA4) | Admin → Tracking | tenant_settings |
| SMS/Email (order notifications) | .env | RESEND_API_KEY, BULK_SMS_BD_* |

After handover, the client configures payments, courier, and tracking from the admin panel. No SSH or .env edits for normal business integration updates.

### Required vs Recommended Env Vars

| Variable | Required | Notes |
|----------|----------|------|
| DATABASE_URL | Yes | PostgreSQL connection string; use 127.0.0.1 not localhost |
| NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY | Yes | Clerk frontend key |
| CLERK_SECRET_KEY | Yes | Clerk backend key |
| UPLOAD_DIR | Yes (prod) | Absolute path for media; survives redeploy |
| INITIAL_ADMIN_* | First deploy | For `db:seed` bootstrap; not needed after |
| MASTER_SECRET | Integrations | 32+ chars for Admin → Integrations |
| NEXT_PUBLIC_SITE_URL | Recommended | For sitemap, canonical, OG |
| APP_URL | Recommended | Fallback for auth redirects |

---

## 6. Database

```bash
# One-command setup (migrate + seed)
npm run db:setup

# Or manually:
npx prisma migrate deploy
npm run db:seed
```

**Local development:** `npm run db:reset` resets DB and re-seeds (destructive).

---

## 6.1 Media / Upload Persistence

Uploaded images (products, banners, logos) are stored on the local filesystem. **UPLOAD_DIR must point to a persistent path** — outside the app directory — so media survives redeploys.

| Risk | Mitigation |
|------|------------|
| Redeploy wipes uploads | Set `UPLOAD_DIR=/var/www/cityplus/uploads` (or similar) — never use `./uploads` or paths inside the app/repo |
| Rebuild overwrites | UPLOAD_DIR is separate from `.next/` and `public/` |
| Container replacement | Mount UPLOAD_DIR as a volume if using Docker |

**One-time setup:**
```bash
sudo mkdir -p /var/www/cityplus/uploads
sudo chown $USER:$USER /var/www/cityplus/uploads
```

**Backup:** Include UPLOAD_DIR in backup scripts. Product/category/banner image URLs reference `/api/media/{key}`; files must exist on disk.

---

## 6.2 Persistence Summary

| Data | Location | Survives Restart | Survives Redeploy |
|------|----------|------------------|-------------------|
| Users, orders, products, settings | PostgreSQL | Yes | Yes |
| Admin credentials | PostgreSQL (seeded once) | Yes | Yes (seed never overwrites) |
| Uploaded media | UPLOAD_DIR (filesystem) | Yes | Yes if path is persistent |
| Deploy logs | /var/log/cityplus/ | Yes | Yes |
| Build output (.next/) | App directory | No (rebuilt) | No (rebuilt) |

**Restart:** App restarts do not affect DB or UPLOAD_DIR. Health check verifies DB connectivity.

**Redeploy:** `deploy-production.sh` backs up DB, runs migrations, rebuilds, reloads PM2. UPLOAD_DIR must be outside app directory. Seed is **not** run by deploy script — run `npm run db:seed` manually on first deploy only.

---

## 7. Build

```bash
NODE_OPTIONS=--max-old-space-size=4096 npm run build
cp -r public .next/standalone/public
cp -r .next/static .next/standalone/.next/static
```

---

## 8. PM2

```bash
cd /var/www/cityplus/app
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

**systemd:** Use `pm2 startup systemd` to generate a pm2-cityplus.service. systemd keeps PM2 alive; PM2 runs the Next app.

---

## 8.1 Deploy log directory (one-time)

Deploy script writes to `/var/log/cityplus/deploy.log`. Create and set ownership:

```bash
sudo mkdir -p /var/log/cityplus
sudo chown cityplus:cityplus /var/log/cityplus
```

---

## 8.2 Logrotate (one-time)

Rotate deploy logs daily, keep 14 days, compress:

```bash
sudo cp /var/www/cityplus/app/deploy/logrotate-cityplus.conf /etc/logrotate.d/cityplus
```

Verify: `sudo logrotate -d /etc/logrotate.d/cityplus` (dry run).

---

## 9. CyberPanel / OpenLiteSpeed

**Create website** in CyberPanel → SSL (Let's Encrypt).

**Proxy to app** — Rewrite rule:
```
RewriteRule ^/(.*) http://127.0.0.1:3000/$1 [P,L]
```

Or vHost proxy: `address 127.0.0.1:3000`

---

## 10. Cloudflare & DNS

### 10.1 www Redirect (301)

**Option A — Cloudflare Page Rules:**
1. Cloudflare Dashboard → Rules → Page Rules
2. Add rule: `*citypetshop.bd/*` → Forwarding URL (301) → `https://citypetshop.bd/$1`
3. Or: `www.citypetshop.bd/*` → 301 → `https://citypetshop.bd/$1`

**Option B — CyberPanel:**
1. Create website for `www.citypetshop.bd`
2. Add redirect: `www` → `https://citypetshop.bd` (301 Permanent)

**Option C — DNS only (Cloudflare):**
- A record: `@` → VPS IP
- CNAME: `www` → `citypetshop.bd` (proxied)
- Cloudflare will serve the apex; `www` may need a redirect rule as above

### 10.2 SSL (Let's Encrypt)

**CyberPanel:**
1. Websites → [your site] → SSL
2. Issue Let's Encrypt (certbot)
3. Auto-renew: CyberPanel enables certbot cron; verify: `sudo certbot renew --dry-run`

**Manual certbot:**
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d citypetshop.bd -d www.citypetshop.bd
# Auto-renew: certbot installs cron; verify: sudo certbot renew --dry-run
```

### 10.3 Cloudflare SSL Settings

- SSL/TLS: Full (Strict)
- Always Use HTTPS: On
- API routes: Cache Level Bypass

---

## 11. Deploy (Updates)

**Exact deploy command:**
```bash
bash /var/www/cityplus/app/deploy/deploy-production.sh
```

Or from repo root: `bash deploy/deploy-production.sh`

### 11.1 Production-Safe Deploy / Migration (Manual)

Use this sequence when deploying with DB migrations. Prisma uses a singleton client; health checks run `SELECT 1` only and do not exhaust connections.

```bash
cd /var/www/cityplus/app

# 1. Backup database before migration (recommended)
sudo -u postgres pg_dump cityplus_db > /var/backups/cityplus/pre_deploy_$(date +%Y%m%d_%H%M%S).dump

# 2. Pull code
git fetch origin && git reset --hard origin/main

# 3. Install deps
npm ci --omit=dev

# 4. Run migrations (Prisma client generated by npm ci postinstall; explicit generate optional)
npx prisma migrate deploy

# 5. Generate Prisma client (explicit; ensures schema matches before build)
npx prisma generate

# 6. Build
NODE_OPTIONS=--max-old-space-size=4096 npm run build

# 7. Copy assets
cp -r public .next/standalone/public 2>/dev/null || true
cp -r .next/static .next/standalone/.next/static 2>/dev/null || true

# 8. Restart app
pm2 startOrReload ecosystem.config.js --env production --update-env --only cityplus
pm2 save

# 9. Verify health
curl -sf http://127.0.0.1:3000/api/health | jq .
curl -sf http://127.0.0.1:3000/api/health/db | jq .
```

**Health endpoints:**
- `GET /api/health` — Full check (env + DB). Returns `ok: true`, `dbPingMs`, `checks`.
- `GET /api/health/db` — DB-only probe. Returns `ok: true`, `latencyMs`, `pingMs`.

**Backup:** See [DB_MIGRATION_RUNBOOK.md](DB_MIGRATION_RUNBOOK.md) for pg_dump options (custom format, restore).

---

## 12. Rollback

**Exact rollback command:**
```bash
bash /var/www/cityplus/app/deploy/rollback.sh
```

With DB restore: `bash deploy/rollback.sh --restore-db`

If rollback fails, manual recovery:
1. `pm2 logs cityplus --lines 100`
2. `bash deploy/restore_postgres.sh /var/backups/cityplus/pre_deploy_YYYYMMDD_HHMMSS.dump`
3. `git checkout <last-good-sha>` (from deploy log) → `npm ci` → `npm run build` → `pm2 reload cityplus`

---

## 13. CI/CD (GitHub Actions)

**Secrets:** `PRODUCTION_HOST`, `PRODUCTION_SSH_KEY`, `PRODUCTION_SSH_PORT`  
**Environments:** `staging` (develop), `production` (main, required reviewer)  
**Deploy:** Push to main → Actions → Run workflow → production → Approve

---

## 13b. RBAC Enforcement

Admin routes (`/admin/*`) and API routes (`/api/admin/*`) enforce role-based access:

- **Middleware** (`middleware.ts`): Redirects unauthenticated users to `/admin/login`. Checks JWT `role` (admin, adm, super_admin).
- **API guards** (`lib/admin-auth.ts`): Each admin API calls `requireAdminAuth()` or `requireAdminAuthAndPermission(permission)`. Returns 401 (sign in required) or 403 (access denied).
- **Granular permissions**: RBAC uses `UserRole` + `RolePermission` (Prisma). Admin panel pages check `hasPermission(userId, "resource.action")` before rendering sensitive UI.
- **Verification**: Unauthorized user cannot access `/admin` pages (redirect to login) or admin APIs (401/403).

---

## 14. Security Hardening Checklist

- [ ] **UFW:** `sudo ufw allow 22 && sudo ufw allow 80 && sudo ufw allow 443 && sudo ufw enable`
- [ ] **Fail2ban:** `sudo apt install fail2ban -y` (protects SSH, HTTP)
- [ ] **SSH:** Key-only auth; disable password: `PasswordAuthentication no` in `/etc/ssh/sshd_config`
- [ ] **No root login:** Use a dedicated deploy user; `PermitRootLogin no`
- [ ] **Secrets:** No real keys in repo; `docs/MUST_REPLACE_SECRETS.md` completed

---

## 15. Post-Deploy: Change Admin Password

1. Log in to Admin at `https://citypetshop.bd/admin`
2. Go to Profile/Settings (or use CLI):
```bash
ADMIN_EMAIL=admin@citypetshop.bd ADMIN_PASSWORD='YourNewSecurePassword123!' npm run admin:reset
```
3. Use a strong password (12+ chars, mixed case, numbers, symbols)

---

## 16. Go-Live Checklist (Final)

- [ ] VPS, CyberPanel, PostgreSQL, PM2, Node.js
- [ ] Domain DNS, www redirect (301), SSL (Let's Encrypt)
- [ ] `prisma migrate deploy`, `npx prisma db seed`
- [ ] `.env.production.local` with all required vars
- [ ] `npm run build` passes
- [ ] PM2 `cityplus` online
- [ ] `curl -sf http://127.0.0.1:3000/api/health` → `{"status":"ok"}`
- [ ] Admin login at `/admin`; **change default password**
- [ ] COD + SSLCommerz test
- [ ] RESEND_API_KEY (order email)
- [ ] Backup cron scheduled (see OPS_RUNBOOKS.md)
- [ ] Security hardening (UFW, Fail2ban, SSH key-only)
- [ ] `docs/MUST_REPLACE_SECRETS.md` — all items checked

---

## 17. Admin Reset

```bash
ADMIN_PASSWORD='YourNewSecurePassword123!' npm run admin:reset
```

---

## 18. Smoke Test

### Health endpoints

```bash
# Full health (env + DB)
curl -sf http://127.0.0.1:3000/api/health | jq .
# Expected: {"status":"ok","ok":true,"database":"connected","checks":{"env":"ok","database":"ok"},"dbPingMs":<number>}

# DB-only probe (for load balancer)
curl -sf http://127.0.0.1:3000/api/health/db | jq .
# Expected: {"status":"ok","ok":true,"database":"connected","latencyMs":<number>,"pingMs":<number>}

# Via HTTPS (through proxy)
curl -sf https://citypetshop.bd/api/health | jq .status
# Expected: "ok"
```

### Site

```bash
curl -sI https://citypetshop.bd/
curl -sI https://citypetshop.bd/admin
```

---

## 19. Visual Regression Checklist (PR-10.5 Design Tokens)

After deploy, manually verify:

- [ ] **Hero banner:** Gradient overlay uses primary green (not black); CTA buttons use accent orange
- [ ] **Header/search:** Search bar and nav use primary-900/primary-700; search button is primary green
- [ ] **Add to cart / CTA buttons:** Accent orange (#F39221)
- [ ] **Footer:** Primary-900 background
- [ ] **Page background:** Light mint (#F8FAF9)
- [ ] **Cards:** White background, text readable
