# Fresh Deployment Guide (CyberPanel) — City Plus Pet Shop

**Purpose:** Step-by-step fresh deployment from a clean local machine to a brand-new CyberPanel VPS. No old code, no old database, no restore, no backups. All data will be unrecoverable if you overwrite or drop it.

**Stack:** Ubuntu 24.04 · CyberPanel 2.3+ · OpenLiteSpeed · Node.js 20 · npm · PM2 · PostgreSQL 14+ · Redis (optional)

**Repo:** https://github.com/abrarfoysalofficial/citypetshop.bd

**App path:** /var/www/cityplus/app  
**Port:** 3001 (127.0.0.1 only) — PM2, ecosystem.config.js, and OpenLiteSpeed proxy target must all use 3001  
**Output:** Next.js standalone

---

## Domain & Redirect Policy

| Type | Domain | Action |
|------|--------|--------|
| **Canonical (primary)** | https://citypetshop.bd | Serves the site |
| **Secondary alias** | https://www.citypetshop.bd | 301 redirect → https://citypetshop.bd (preserve path + query) |
| **HTTP** | http://citypetshop.bd, http://www.citypetshop.bd | 301 redirect → https://citypetshop.bd |

Issue Let's Encrypt SSL for both `citypetshop.bd` and `www.citypetshop.bd` in CyberPanel.

---

## 1. Fresh VPS Preparation

### 1.1 Install system packages

```bash
sudo apt install -y git curl ca-certificates jq
```

**Expected:** Packages installed, no errors.

**Verify:**
```bash
git --version
curl --version | head -1
jq --version
```
Output: version numbers for git, curl, jq.

---

### 1.2 Update system

```bash
sudo apt update && sudo apt upgrade -y
```

**Expected:** Packages updated, no errors.

**Verify:**
```bash
cat /etc/os-release | head -2
```
Output must include `Ubuntu` and `24.04` (or compatible).

---

### 1.3 Create app user and directories

```bash
sudo adduser --disabled-password --gecos "" cityplus
sudo mkdir -p /var/www/cityplus
sudo chown cityplus:cityplus /var/www/cityplus
sudo mkdir -p /var/www/cityplus/uploads
sudo chown cityplus:cityplus /var/www/cityplus/uploads
sudo mkdir -p /var/log/cityplus
sudo chown cityplus:cityplus /var/log/cityplus
sudo -u cityplus touch /var/log/cityplus/deploy.log
sudo chown cityplus:cityplus /var/log/cityplus/deploy.log
```

**Expected:** User `cityplus` created, directories exist.

**Verify:**
```bash
ls -la /var/www/cityplus
ls -la /var/log/cityplus/deploy.log
id cityplus
```
Output: `cityplus` owns `/var/www/cityplus` and subdirs; `deploy.log` exists and is owned by cityplus.

---

## 2. Install Node.js 20 and PM2 (as cityplus user)

### 2.1 Install nvm

```bash
sudo -u cityplus bash -lc 'curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash'
```

**Expected:** nvm installed to `/home/cityplus/.nvm`.

**Verify:**
```bash
sudo -u cityplus bash -lc 'nvm --version'
```
Output: version number (e.g. `0.40.0`).

---

### 2.2 Install Node 20

```bash
sudo -u cityplus bash -lc 'nvm install 20'
sudo -u cityplus bash -lc 'nvm use 20'
sudo -u cityplus bash -lc 'nvm alias default 20'
```

**Expected:** `Now using node v20.x.x`.

**Verify:**
```bash
sudo -u cityplus bash -lc 'node -v'
sudo -u cityplus bash -lc 'npm -v'
```
Output: `v20.x.x` and `10.x.x` or higher.

---

### 2.3 Install PM2 globally

```bash
sudo -u cityplus bash -lc 'npm i -g pm2'
```

**Expected:** `added X packages`.

**Verify:**
```bash
sudo -u cityplus bash -lc 'pm2 -v'
```
Output: version number (e.g. `5.x.x`).

---

## 3. Install PostgreSQL

### 3.1 Install PostgreSQL

```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

**Expected:** Service started.

**Verify:**
```bash
sudo systemctl status postgresql
```
Output: `Active: active (running)`.

---

### 3.2 Verify PostgreSQL binds to localhost only

```bash
sudo ss -lntp | grep 5432 || true
```

**Expected:** Output shows `127.0.0.1:5432` or `::1:5432`. If it shows `0.0.0.0:5432`, PostgreSQL is listening on all interfaces.

**If 0.0.0.0:** Run this fix:

```bash
sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = 'localhost'/" /etc/postgresql/*/main/postgresql.conf
sudo sed -i "s/listen_addresses = '\*'/listen_addresses = 'localhost'/" /etc/postgresql/*/main/postgresql.conf
sudo systemctl restart postgresql
```

**Re-verify:**
```bash
sudo ss -lntp | grep 5432 || true
```
Output must show `127.0.0.1:5432` or `::1:5432`, not `0.0.0.0`.

---

### 3.3 Create fresh database and user

**DANGER:** This creates a new database. Any existing data in `cityplus_db` will be lost if you run this on a DB that already has it.

```bash
DB_PASS=$(openssl rand -base64 24 | tr -d '\n/+=' | head -c 32)
sudo -u postgres psql <<SQL
DROP DATABASE IF EXISTS cityplus_db;
DROP USER IF EXISTS cityplus_app;
CREATE USER cityplus_app WITH PASSWORD '$DB_PASS';
CREATE DATABASE cityplus_db OWNER cityplus_app;
GRANT ALL PRIVILEGES ON DATABASE cityplus_db TO cityplus_app;
\c cityplus_db
GRANT ALL ON SCHEMA public TO cityplus_app;
ALTER DATABASE cityplus_db SET search_path TO public;
SQL
echo "postgresql://cityplus_app:${DB_PASS}@127.0.0.1:5432/cityplus_db" | sudo tee /root/.cityplus_db_url
sudo chmod 600 /root/.cityplus_db_url
```

**Expected:** `CREATE USER`, `CREATE DATABASE`, `GRANT` messages. DATABASE_URL saved to `/root/.cityplus_db_url` for step 7.2 (deleted in 7.2 after use).

**Verify:**
```bash
sudo -u postgres psql -c "\du cityplus_app"
sudo -u postgres psql -c "\l" | grep cityplus_db
```
Output: `cityplus_app` exists; `cityplus_db` in list.

---

## 4. Install Redis (Optional)

Redis is optional. Rate limiting falls back to in-memory if `REDIS_URL` is not set.

### 4.1 Install Redis

```bash
sudo apt install -y redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

**Expected:** Service started.

**Verify:**
```bash
redis-cli ping
```
Output: `PONG`.

---

### 4.2 Secure Redis (bind to localhost only)

```bash
sudo sed -i 's/^# bind 127.0.0.1/bind 127.0.0.1/' /etc/redis/redis.conf
sudo sed -i 's/^bind .*/bind 127.0.0.1 -::1/' /etc/redis/redis.conf
sudo systemctl restart redis-server
```

**Expected:** No output.

**Verify:**
```bash
redis-cli ping
```
Output: `PONG`.

---

## 5. Firewall and Fail2ban

### 5.1 Configure UFW

```bash
MY_IP=$(curl -s ifconfig.me)
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw delete allow 7080/tcp 2>/dev/null || true
sudo ufw allow from $MY_IP to any port 7080 proto tcp
sudo ufw --force enable
```

**Expected:** `Firewall is active and enabled on system startup`. Port 7080 (CyberPanel) allowed only from your public IP. Any prior open 7080 rule is removed.

**Verify:**
```bash
curl -s ifconfig.me
sudo ufw status
```
Output: your public IP; `22/tcp`, `80/tcp`, `443/tcp` ALLOW; `7080` ALLOW from your IP only (e.g. `7080/tcp ALLOW IN $MY_IP`).

---

### 5.2 Install and enable Fail2ban

```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

**Expected:** Service started.

**Verify:**
```bash
sudo systemctl status fail2ban
```
Output: `Active: active (running)`.

---

## 6. Clone Code

### 6.1 Clone repository

```bash
sudo -u cityplus bash -c 'cd /var/www/cityplus && git clone https://github.com/abrarfoysalofficial/citypetshop.bd app'
```

**Expected:** `Cloning into 'app'...` then `done`.

**Verify:**
```bash
ls -la /var/www/cityplus/app/package.json
```
Output: file exists.

---

## 7. Environment Variables

### 7.1 Create .env.production.local

```bash
sudo -u cityplus bash -c 'cd /var/www/cityplus/app && (test -f .env.production.example && cp .env.production.example .env.production.local) || cp .env.example .env.production.local'
```

**Expected:** File created (from .env.production.example if present, else .env.example).

**Verify:**
```bash
ls -la /var/www/cityplus/app/.env.production.local
```
Output: file exists.

---

### 7.2 Generate secrets and write .env.production.local

Run after step 6 (clone). Reads DATABASE_URL from step 3.3.

```bash
DATABASE_URL=$(sudo cat /root/.cityplus_db_url)
NEXTAUTH_SECRET=$(openssl rand -hex 32)
MASTER_SECRET=$(openssl rand -hex 32)
ADMIN_PASS=$(openssl rand -base64 16 | tr -d '\n/+=' | head -c 20)
sudo -u cityplus tee /var/www/cityplus/app/.env.production.local <<ENV
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://citypetshop.bd
NEXTAUTH_URL=https://citypetshop.bd
APP_URL=https://citypetshop.bd
DATABASE_URL=$DATABASE_URL
NEXTAUTH_SECRET=$NEXTAUTH_SECRET
AUTH_TRUST_HOST=true
MASTER_SECRET=$MASTER_SECRET
UPLOAD_DIR=/var/www/cityplus/uploads
ADMIN_EMAIL=admin@citypetshop.bd
ADMIN_PASSWORD=$ADMIN_PASS
ENV
echo "ADMIN_PASSWORD=$ADMIN_PASS"
sudo rm -f /root/.cityplus_db_url
```

**Expected:** File written. ADMIN_PASSWORD printed (save for first login). Temp DB URL file deleted.

**Verify:**
```bash
sudo -u cityplus bash -c 'cd /var/www/cityplus/app && grep NEXT_PUBLIC_SITE_URL .env.production.local'
sudo -u cityplus bash -c 'cd /var/www/cityplus/app && grep NEXTAUTH_URL .env.production.local'
```
Output: both show `https://citypetshop.bd`.

---

## 8. Database Migration and Seed

### 8.1 Install dependencies

```bash
sudo -u cityplus bash -lc 'cd /var/www/cityplus/app && npm ci'
```

**Expected:** `added X packages`.

**Verify:**
```bash
ls /var/www/cityplus/app/node_modules/next
```
Output: directory exists.

---

### 8.2 Prisma generate

```bash
sudo -u cityplus bash -lc 'cd /var/www/cityplus/app && npx prisma generate'
```

**Expected:** `Generated Prisma Client`.

**Verify:**
```bash
ls /var/www/cityplus/app/node_modules/.prisma/client
```
Output: directory exists.

---

### 8.3 Run migrations

```bash
sudo -u cityplus bash -lc 'cd /var/www/cityplus/app && npx prisma migrate deploy'
```

**Expected:** `X migration(s) applied`.

**Verify:**
```bash
sudo -u postgres psql -d cityplus_db -c "\dt" | head -20
```
Output: list of tables (e.g. tenants, users, products).

---

### 8.4 Seed database

```bash
sudo -u cityplus bash -lc 'cd /var/www/cityplus/app && npm run db:seed'
```

**Expected:** `Tenant settings ready`, `Roles ready`, `Admin user ready`, etc.

**Verify:**
```bash
sudo -u postgres psql -d cityplus_db -c "SELECT email FROM users WHERE role IN ('admin','super_admin') LIMIT 1;"
```
Output: admin email (admin@citypetshop.bd).

---

## 9. Build Next.js

### 9.1 Build

```bash
sudo -u cityplus bash -lc 'cd /var/www/cityplus/app && NODE_OPTIONS=--max-old-space-size=4096 npm run build'
```

**Expected:** `Compiled successfully`, `Route (app)`, `Generating static pages`, `Finalizing page optimization`.

**Verify:**
```bash
ls /var/www/cityplus/app/.next/standalone/server.js
```
Output: file exists.

---

### 9.2 Copy static assets to standalone

```bash
sudo -u cityplus bash -c 'cd /var/www/cityplus/app && cp -r public .next/standalone/public 2>/dev/null || true'
sudo -u cityplus bash -c 'cd /var/www/cityplus/app && cp -r .next/static .next/standalone/.next/static 2>/dev/null || true'
```

**Expected:** No errors.

**Verify:**
```bash
ls /var/www/cityplus/app/.next/standalone/public
```
Output: public assets listed.

---

## 10. PM2 Start

### 10.1 Start app with PM2 (port 3001)

```bash
sudo -u cityplus bash -lc 'cd /var/www/cityplus/app && APP_DIR=/var/www/cityplus/app pm2 start ecosystem.config.js --env production'
```

**Expected:** `[PM2] Starting ecosystem.config.js in fork_mode`, `[PM2] Done`.

**Verify:**
```bash
sudo -u cityplus bash -lc 'pm2 list'
grep -A2 env_production /var/www/cityplus/app/ecosystem.config.js
```
Output: `cityplus` status `online`; `PORT: "3001"` in ecosystem.

---

### 10.2 Save PM2 process list

```bash
sudo -u cityplus bash -lc 'pm2 save'
```

**Expected:** `[PM2] Saving current process list`.

---

### 10.3 Configure PM2 startup on boot

```bash
sudo -u cityplus bash -lc 'pm2 startup systemd'
```

**Expected:** A command like `sudo env PATH=... pm2 startup systemd -u cityplus --hp /home/cityplus` is printed. Run the printed root command immediately.

**Verify:**
```bash
sudo systemctl status pm2-cityplus --no-pager
```
Output: `Active: active (running)` (after running the printed startup command).

---

### 10.4 Health check (local, port 3001)

```bash
curl -sf http://127.0.0.1:3001/api/health
```

**Expected:** `{"status":"ok","timestamp":"...","database":"connected"}`.

**Verify:**
```bash
curl -s http://127.0.0.1:3001/api/health | jq .
```
Output: JSON with `status` = `ok`.

---

## 11. CyberPanel and OpenLiteSpeed

### 11.1 Create website in CyberPanel

1. CyberPanel → Websites → Create Website
2. Domain: `citypetshop.bd`
3. PHP: Not required (leave default or disable)
4. Create

---

### 11.2 Add rewrite rules (redirects + proxy)

1. CyberPanel → Websites → List Websites → Manage (citypetshop.bd)
2. Click **REWRITE RULES**
3. Add the following rules in order (OpenLiteSpeed mod_rewrite compatible):

```
RewriteCond %{HTTP_HOST} ^www\.citypetshop\.bd$ [NC]
RewriteRule ^(.*)$ https://citypetshop.bd/$1 [R=301,L]

RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://citypetshop.bd/$1 [R=301,L]

RewriteRule ^(.*)$ http://127.0.0.1:3001/$1 [P,L]
```

4. Save
5. Restart OpenLiteSpeed: CyberPanel → Restart → LiteSpeed

**Expected:** Rules saved, server restarted.

**Verify:**
```bash
curl -sI http://127.0.0.1:80/ -H "Host: citypetshop.bd"
```
Output: `HTTP/1.1 200` or `302` (proxied to Node).

---

### 11.3 Enable SSL (Let's Encrypt)

1. CyberPanel → Websites → citypetshop.bd → SSL
2. Issue Let's Encrypt
3. Select `citypetshop.bd` and `www.citypetshop.bd`
4. Issue

**Expected:** Certificate issued.

**Verify:**
```bash
echo | openssl s_client -servername citypetshop.bd -connect citypetshop.bd:443 2>/dev/null | openssl x509 -noout -dates -issuer -subject
```
Output: `notBefore`, `notAfter`, `issuer`, `subject` with citypetshop.bd.

---

## 12. Upload Directory Permissions

```bash
sudo chown -R cityplus:cityplus /var/www/cityplus/uploads
sudo chmod 755 /var/www/cityplus/uploads
```

**Expected:** No output.

**Verify:**
```bash
ls -la /var/www/cityplus/uploads
```
Output: `drwxr-xr-x` owned by `cityplus`.

---

## 13. Health and Route Verification

```bash
curl -sf http://127.0.0.1:3001/api/health
curl -I https://citypetshop.bd/
curl -I https://www.citypetshop.bd/
curl -sf https://citypetshop.bd/api/health
```

**Expected:**
- `curl -sf http://127.0.0.1:3001/api/health`: `{"status":"ok","timestamp":"...","database":"connected"}`
- `curl -I https://citypetshop.bd/`: `HTTP/2 200` or `302`
- `curl -I https://www.citypetshop.bd/`: `HTTP/2 301` with `Location: https://citypetshop.bd/`
- `curl -sf https://citypetshop.bd/api/health`: `{"status":"ok","timestamp":"...","database":"connected"}`

```bash
curl -sI https://citypetshop.bd/shop
curl -sI https://citypetshop.bd/cart
curl -sI https://citypetshop.bd/checkout
curl -sI https://citypetshop.bd/admin
```

**Expected:** `HTTP/2 200` or `HTTP/2 302` (redirect to login for /admin).

---

## 14. Log Locations

| Log | Location |
|-----|----------|
| PM2 app logs | `/home/cityplus/.pm2/logs/cityplus-out.log`, `cityplus-error.log` |
| Deploy log | `/var/log/cityplus/deploy.log` (created in step 1.3, owned by cityplus) |
| OpenLiteSpeed error | `/usr/local/lsws/logs/error.log` |
| OpenLiteSpeed access | `/usr/local/lsws/logs/access.log` |

**View PM2 logs:**
```bash
sudo -u cityplus bash -lc 'pm2 logs cityplus --lines 50'
```

---

## 15. Post-Deploy Checklist

- [ ] `curl -sf https://citypetshop.bd/api/health` returns `{"status":"ok"}`
- [ ] `curl -I https://citypetshop.bd/` returns 200 or 302
- [ ] `curl -I https://www.citypetshop.bd/` returns 301 to https://citypetshop.bd/
- [ ] Homepage loads: https://citypetshop.bd/
- [ ] Shop loads: https://citypetshop.bd/shop
- [ ] Cart loads: https://citypetshop.bd/cart
- [ ] Checkout loads: https://citypetshop.bd/checkout
- [ ] Admin login: https://citypetshop.bd/admin (login with ADMIN_EMAIL / ADMIN_PASSWORD from step 7.2)
- [ ] Change admin password after first login
- [ ] Configure Admin → Settings → Integrations (MASTER_SECRET must be set)
- [ ] Configure Admin → Payments (SSLCommerz, wallet numbers if used)
- [ ] Configure Admin → Courier (Steadfast, etc. if used)
- [ ] Test order flow (add to cart, checkout, payment)
- [ ] Verify uploads: Admin → Products → Upload image; check /api/media/... serves it

---

## 16. Environment Variables Reference

| Variable | Required | Value |
|----------|----------|-------|
| NODE_ENV | Yes | production |
| DATABASE_URL | Yes | postgresql://cityplus_app:PASSWORD@127.0.0.1:5432/cityplus_db |
| NEXTAUTH_URL | Yes | https://citypetshop.bd |
| NEXTAUTH_SECRET | Yes | 32+ chars |
| AUTH_TRUST_HOST | Yes | true |
| NEXT_PUBLIC_SITE_URL | Yes | https://citypetshop.bd |
| APP_URL | Yes | https://citypetshop.bd |
| MASTER_SECRET | Yes | 32+ chars |
| UPLOAD_DIR | Yes | /var/www/cityplus/uploads |
| ADMIN_EMAIL | Yes | admin@citypetshop.bd |
| ADMIN_PASSWORD | Yes | 12+ chars |

---

## 17. Quick Re-Deploy (After Initial Setup)

```bash
cd /var/www/cityplus/app
git pull origin main
npm ci
npx prisma migrate deploy
NODE_OPTIONS=--max-old-space-size=4096 npm run build
cp -r public .next/standalone/public 2>/dev/null || true
cp -r .next/static .next/standalone/.next/static 2>/dev/null || true
APP_DIR=/var/www/cityplus/app pm2 startOrReload ecosystem.config.js --env production --update-env --only cityplus
pm2 save
curl -sf http://127.0.0.1:3001/api/health
```

---

## 18. Troubleshooting: Admin Login Redirects to Customer Login

If you are redirected to the customer login page (`/login`) when trying to access the admin panel (`/admin/login`):

1. **Use the correct admin URL:** Go directly to `https://citypetshop.bd/admin/login` (not `/login`).

2. **Verify NEXTAUTH_URL:** In `.env.production.local`, ensure:
   - `NEXTAUTH_URL=https://citypetshop.bd` (must match your actual domain)
   - `NEXTAUTH_SECRET` is set (32+ chars, e.g. from `openssl rand -hex 32`)

3. **Verify admin user exists:**
   ```bash
   sudo -u cityplus bash -lc 'cd /var/www/cityplus/app && npx prisma studio'
   ```
   Check `User` table: your admin email must have `role` = `admin`, `adm`, or `super_admin`.

4. **Reset admin password:**
   ```bash
   cd /var/www/cityplus/app
   ADMIN_PASSWORD='YourNewSecurePassword123!' npx tsx scripts/admin-reset.ts
   ```
   Save the password; use it at `/admin/login`.

5. **Restart PM2** after changing env vars:
   ```bash
   pm2 restart cityplus --update-env
   pm2 save
   ```

---

## DANGER Notes

- **Section 3.3:** `DROP DATABASE` and `DROP USER` destroy existing data. Use only on a fresh DB or when you accept total data loss.
- **Section 7.2:** Never commit `.env.production.local`. It is in `.gitignore`. `/root/.cityplus_db_url` is deleted in step 7.2.
- **Admin password:** Must be changed after first login. Seed rejects default `Admin@12345` in production.
