# City Plus Pet Shop — Production Setup: CyberPanel + OpenLiteSpeed
> One document. Every step. Copy-paste ready.
> Stack: Next.js 14 (standalone) · PM2 · PostgreSQL 16 · CyberPanel · OpenLiteSpeed

---

## FILLED-IN PROJECT DETAILS

| Field | Value |
|---|---|
| Domain | `citypluspetshop.com` / `www.citypluspetshop.com` |
| App user | `cityplus` |
| App path | `/var/www/cityplus/app` |
| Internal port | `3001` |
| PM2 app name | `cityplus` |
| DB name | `cityplus_db` |
| DB user | `cityplus_app` |
| Reverse proxy | CyberPanel + OpenLiteSpeed (lsws) |
| Build output | Standalone → `.next/standalone/server.js` |
| Uploads dir | `/var/www/cityplus/uploads` |

---

## SECTION 1 — DIAGNOSIS FRAMEWORK

Before touching anything, run these 5 commands and read the output:

```bash
# 1. Is the Node app responding internally?
curl -I http://127.0.0.1:3001

# 2. Is OpenLiteSpeed running?
sudo systemctl status lsws

# 3. What errors does OLS show?
sudo tail -50 /usr/local/lsws/logs/error.log

# 4. Is PM2 running the app?
sudo -u cityplus pm2 status

# 5. What does PM2 show in logs?
sudo -u cityplus pm2 logs cityplus --lines 50 --nostream
```

**Pass conditions:**
- `curl -I http://127.0.0.1:3001` → `HTTP/1.1 200 OK` or `307`
- `systemctl status lsws` → `Active: active (running)`
- OLS error log → no `[extprocessor]` or `connection refused` lines
- `pm2 status` → `cityplus` shows `online`

---

## SECTION 2 — PM2 CORRECT SETUP

### 2.1 — What NOT to do

```bash
# WRONG — never use next start for standalone builds
pm2 start npm --name cityplus -- start

# WRONG — never bind to 0.0.0.0 on a shared VPS
PORT=3001 node .next/standalone/server.js   # (without HOSTNAME=127.0.0.1)
```

### 2.2 — Correct PM2 start command (one-liner, no ecosystem file)

```bash
sudo -u cityplus bash -c "
  cd /var/www/cityplus/app &&
  PORT=3001 HOSTNAME=127.0.0.1 NODE_ENV=production \
  pm2 start .next/standalone/server.js \
    --name cityplus \
    --log /var/log/pm2/cityplus-out.log \
    --error /var/log/pm2/cityplus-error.log \
    --time
"
```

### 2.3 — Correct PM2 start via ecosystem file (preferred)

Ecosystem file is at `/var/www/cityplus/app/ecosystem.config.cjs` (already updated in repo).

```bash
# First time
sudo -u cityplus bash -c "cd /var/www/cityplus/app && pm2 start ecosystem.config.cjs --env production"

# Zero-downtime reload (after code update)
sudo -u cityplus bash -c "pm2 reload cityplus --update-env"

# Hard restart (if app is stuck)
sudo -u cityplus bash -c "pm2 restart cityplus --update-env"

# Persist across reboots
sudo -u cityplus bash -c "pm2 save"
```

### 2.4 — Remove duplicate PM2 process

From the last screenshot, `city-plus-app` is a stale duplicate:

```bash
sudo -u cityplus bash -c "pm2 delete city-plus-app && pm2 save"
sudo -u cityplus bash -c "pm2 list"
```

**Expected output:** Only `cityplus` (id 0) remains, status `online`.

**Rollback:** None needed — `city-plus-app` used the wrong start method and was not serving traffic.

### 2.5 — PM2 auto-start on server reboot

```bash
# Generate the systemd startup command (run as cityplus or abrar)
sudo -u cityplus bash -c "pm2 startup systemd -u cityplus --hp /home/cityplus"
```

PM2 prints a `sudo env PATH=...` command. **Run that exact command as abrar**, then:

```bash
sudo -u cityplus bash -c "pm2 save"
sudo systemctl status pm2-cityplus
```

---

## SECTION 3 — OPENLITESPEED REVERSE PROXY SETUP

OpenLiteSpeed uses two mechanisms to proxy to Node. Use **native extprocessor** (Method A). Only fall back to .htaccess rewrites (Method B) if CyberPanel doesn't expose vHost file editing for your version.

---

### Method A — Native OLS vHost Config (Recommended)

This is the correct production approach. It serves static files from disk and proxies everything else to Node.

#### Step A1 — Back up existing vHost config

```bash
VHOST_DIR="/usr/local/lsws/conf/vhosts/citypluspetshop.com"
sudo cp "$VHOST_DIR/vhconf.conf" "$VHOST_DIR/vhconf.conf.bak_$(date +%Y%m%d_%H%M%S)"
sudo ls -lh "$VHOST_DIR/"
```

#### Step A2 — Apply the vHost config

```bash
sudo tee /usr/local/lsws/conf/vhosts/citypluspetshop.com/vhconf.conf > /dev/null << 'OLSEOF'
extprocessor lsapi:cityplus_next {
  type                    proxy
  address                 127.0.0.1:3001
  maxConns                100
  pcKeepAliveTimeout      60
  initTimeout             60
  retryTimeout            0
  checkInterval           0
  respBuffer              0
  extraHeaders            "X-Forwarded-Proto: https\nX-Forwarded-For: $REMOTE_ADDR"
}

context /_next/static/ {
  location                /var/www/cityplus/app/.next/static/
  allowBrowse             0
  addDefaultCharset       off
  extraHeaders            "Cache-Control: public, max-age=31536000, immutable"
}

context /uploads/ {
  location                /var/www/cityplus/uploads/
  allowBrowse             0
  addDefaultCharset       off
}

context / {
  type                    proxy
  handler                 lsapi:cityplus_next
  addDefaultCharset       off
}
OLSEOF
```

#### Step A3 — Restart OLS and verify

```bash
sudo systemctl restart lsws
sleep 3
sudo systemctl status lsws
sudo tail -20 /usr/local/lsws/logs/error.log
```

**Pass condition:** No `[extprocessor]` errors in log. `status lsws` shows `active (running)`.

**Rollback:**
```bash
sudo cp /usr/local/lsws/conf/vhosts/citypluspetshop.com/vhconf.conf.bak_* /usr/local/lsws/conf/vhosts/citypluspetshop.com/vhconf.conf
sudo systemctl restart lsws
```

---

### Method B — CyberPanel UI + .htaccess Rewrite (Fallback)

Use this only if you cannot edit the vHost conf file directly.

#### Step B1 — Add External App in CyberPanel

1. CyberPanel → **OpenLiteSpeed → External Apps → Add**
2. Fill in:
   - Name: `cityplus_next`
   - Type: `Load Balancer`
   - Address: `127.0.0.1:3001`
   - Max Connections: `100`
3. Click **Save**

#### Step B2 — Add Rewrite Rules

1. CyberPanel → **Websites → List Websites → citypluspetshop.com → Rewrite Rules**
2. Paste:

```apache
RewriteEngine On

# Serve Next.js static files directly (no proxy overhead)
RewriteCond %{REQUEST_URI} ^/_next/static/
RewriteRule ^/_next/static/(.*)$ /var/www/cityplus/app/.next/static/$1 [L]

# Serve uploaded files directly
RewriteCond %{REQUEST_URI} ^/uploads/
RewriteRule ^/uploads/(.*)$ /var/www/cityplus/uploads/$1 [L]

# Proxy everything else to Node
RewriteRule ^/(.*) http://127.0.0.1:3001/$1 [P,L]
```

3. Click **Save**
4. Restart OLS: `sudo systemctl restart lsws`

> **Warning:** The rewrite proxy rule requires the external app to be registered first. If `127.0.0.1:3001` is not in the External App list, OLS returns 500.

---

## SECTION 4 — SSL CERTIFICATE

CyberPanel manages SSL via Let's Encrypt. Do this through the UI, not certbot directly (to avoid conflicts).

#### Via CyberPanel UI

1. CyberPanel → **SSL → Manage SSL → Issue SSL**
2. Select domain: `citypluspetshop.com`
3. Check **www** sub-domain too
4. Click **Issue**

#### Verify SSL

```bash
curl -I https://www.citypluspetshop.com/api/health
```

**Expected:** `HTTP/2 200` with body `{"status":"ok","database":"connected"}`

#### Force HTTPS redirect (CyberPanel)

1. CyberPanel → **Websites → citypluspetshop.com → SSL → Force HTTPS**
2. Enable toggle → Save

---

## SECTION 5 — FULL DEPLOYMENT SEQUENCE

Run every time you deploy a new version.

```bash
# ── As abrar ──────────────────────────────────────────────────────────────────

# Step 1: Backup DB before anything touches it
sudo -u postgres pg_dump -Fc -d cityplus_db -f /tmp/pre_deploy_$(date +%Y%m%d_%H%M%S).dump
sudo mv /tmp/pre_deploy_*.dump /var/backups/cityplus/
echo "Backup done"

# ── Switch to cityplus user ───────────────────────────────────────────────────
sudo -u cityplus bash

# Step 2: Pull latest code
cd /var/www/cityplus/app
git fetch origin
git pull origin main --ff-only
echo "Code updated: $(git rev-parse --short HEAD)"

# Step 3: Install dependencies
npm ci --omit=dev

# Step 4: Run migrations (NEVER migrate dev in production)
DATABASE_URL="$(grep DATABASE_URL .env.production.local | cut -d= -f2-)" npx prisma migrate deploy

# Step 5: Build
NODE_OPTIONS=--max-old-space-size=4096 npm run build

# Step 6: Copy static assets into standalone (REQUIRED for standalone builds)
cp -r /var/www/cityplus/app/public /var/www/cityplus/app/.next/standalone/public
cp -r /var/www/cityplus/app/.next/static /var/www/cityplus/app/.next/standalone/.next/static
echo "Static assets copied"

# Step 7: Zero-downtime reload
pm2 reload cityplus --update-env
pm2 save

# Step 8: Health check (exit sudo -u cityplus bash first)
exit
```

```bash
# Back as abrar — verify
curl -sf http://127.0.0.1:3001/api/health
```

**Expected:** `{"status":"ok","timestamp":"...","database":"connected"}`

---

## SECTION 6 — VERIFICATION CHECKLIST

Run after every deploy or config change:

```bash
# 1. Node app responds on 3001
curl -I http://127.0.0.1:3001
# Expected: HTTP/1.1 200 (or 307 redirect)

# 2. Confirm 3001 is owned by cityplus, bound to 127.0.0.1 only
sudo lsof -i :3001
# Expected: node  PID  cityplus  ...  TCP 127.0.0.1:3001 (LISTEN)
# FAIL if: 0.0.0.0:3001 — means app is exposed publicly, fix HOSTNAME

# 3. OLS is running
sudo systemctl status lsws
# Expected: active (running)

# 4. OLS error log clean
sudo tail -20 /usr/local/lsws/logs/error.log
# Expected: no [extprocessor] CONN_REFUSED or proxy errors

# 5. PM2 process is online
sudo -u cityplus pm2 status
# Expected: cityplus | online | 0 restarts

# 6. PM2 no error logs
sudo -u cityplus pm2 logs cityplus --lines 30 --nostream
# Expected: no "Error", "ECONNREFUSED", "Cannot find module"

# 7. Domain resolves and returns 200
curl -I https://www.citypluspetshop.com/api/health
# Expected: HTTP/2 200, body: {"status":"ok","database":"connected"}

# 8. DB migrations are clean
sudo -u cityplus bash -c "cd /var/www/cityplus/app && \
  DATABASE_URL=\$(grep DATABASE_URL .env.production.local | cut -d= -f2-) \
  npx prisma migrate status"
# Expected: "Database schema is up to date"
```

---

## SECTION 7 — ROLLBACK PLAN

### Rollback app code (no DB migration involved)

```bash
# Find latest rollback snapshot
ls -lht /var/backups/cityplus/rollback_* 2>/dev/null | head -5

# Restore previous .next build
sudo -u cityplus bash -c "
  rm -rf /var/www/cityplus/app/.next &&
  cp -r /var/backups/cityplus/rollback_TIMESTAMP/.next /var/www/cityplus/app/.next &&
  pm2 reload cityplus --update-env
"

# Verify
curl -sf http://127.0.0.1:3001/api/health
```

### Rollback a migration (mark as rolled-back, NOT destructive)

```bash
# ONLY marks the migration as not applied — does not drop tables
sudo -u cityplus bash -c "cd /var/www/cityplus/app && \
  DATABASE_URL=\$(grep DATABASE_URL .env.production.local | cut -d= -f2-) \
  npx prisma migrate resolve --rolled-back MIGRATION_NAME_HERE"
```

### Rollback OpenLiteSpeed config

```bash
# Restore OLS vHost backup
sudo cp /usr/local/lsws/conf/vhosts/citypluspetshop.com/vhconf.conf.bak_* \
       /usr/local/lsws/conf/vhosts/citypluspetshop.com/vhconf.conf
sudo systemctl restart lsws
sudo tail -20 /usr/local/lsws/logs/error.log
```

---

## SECTION 8 — TROUBLESHOOTING: COMMON ERRORS

### Error: `502 Bad Gateway` from OLS

**Diagnosis:**
```bash
curl -I http://127.0.0.1:3001          # Is Node running?
sudo -u cityplus pm2 status            # Is PM2 online?
sudo tail -20 /usr/local/lsws/logs/error.log   # OLS saying "connection refused"?
```

**Cause A:** PM2 app is down → `sudo -u cityplus pm2 restart cityplus`

**Cause B:** App crashed on startup → `sudo -u cityplus pm2 logs cityplus --lines 50 --nostream` — look for missing env var or missing `.next` directory

**Cause C:** Wrong port in OLS config → verify `address 127.0.0.1:3001` matches `PORT=3001` in PM2

---

### Error: `503 Service Unavailable` from app

**Diagnosis:**
```bash
curl -sf http://127.0.0.1:3001/api/health
```

Response `{"status":"error","message":"DATABASE_URL is required"}` → `.env.production.local` missing or DATABASE_URL not set

Response `{"status":"error","database":"disconnected"}` → PostgreSQL down or wrong credentials

```bash
# Test DB directly
psql -h 127.0.0.1 -U cityplus_app -d cityplus_db -c "SELECT 1;" 
# Enter password: Citypetshopbd2026Secure
```

---

### Error: `Cannot find module '/var/www/cityplus/app/.next/standalone/server.js'`

Build output is missing. Rebuild:
```bash
sudo -u cityplus bash -c "cd /var/www/cityplus/app && NODE_OPTIONS=--max-old-space-size=4096 npm run build"
sudo -u cityplus bash -c "cp -r /var/www/cityplus/app/public /var/www/cityplus/app/.next/standalone/public"
sudo -u cityplus bash -c "cp -r /var/www/cityplus/app/.next/static /var/www/cityplus/app/.next/standalone/.next/static"
sudo -u cityplus bash -c "pm2 reload cityplus --update-env"
```

---

### Error: App binds to `0.0.0.0` instead of `127.0.0.1`

**Dangerous on shared VPS — Node port is publicly exposed.**

**Fix:** Ensure `HOSTNAME=127.0.0.1` is in PM2 env:
```bash
sudo -u cityplus bash -c "pm2 delete cityplus"
sudo -u cityplus bash -c "cd /var/www/cityplus/app && pm2 start ecosystem.config.cjs --env production"
sudo lsof -i :3001
# Must show: TCP 127.0.0.1:3001 (LISTEN)   NOT   0.0.0.0:3001
```

---

### Error: Static assets return 404 (images, CSS, JS broken)

The `public/` and `.next/static/` directories were not copied into standalone output.

```bash
sudo -u cityplus bash -c "
  cp -r /var/www/cityplus/app/public /var/www/cityplus/app/.next/standalone/public &&
  cp -r /var/www/cityplus/app/.next/static /var/www/cityplus/app/.next/standalone/.next/static
"
sudo -u cityplus bash -c "pm2 reload cityplus --update-env"
```

---

### Error: Admin login returns `500` or infinite redirect

**Cause:** `NEXTAUTH_SECRET` not set, or wrong `NEXTAUTH_URL`

```bash
sudo -u cityplus grep -E "NEXTAUTH_SECRET|NEXTAUTH_URL" /var/www/cityplus/app/.env.production.local
```

`NEXTAUTH_SECRET` must be ≥ 32 characters. `NEXTAUTH_URL` must exactly match the public domain (with https).

---

### Error: OLS shows `[extprocessor] Proxy server is unavailable`

Node is not listening on 3001 yet. Wait 10s after PM2 reload, then:

```bash
sudo -u cityplus pm2 status
curl -I http://127.0.0.1:3001
```

If still failing, check PM2 logs for startup errors:
```bash
sudo -u cityplus pm2 logs cityplus --lines 100 --nostream
```

---

## SECTION 9 — SECURITY HARDENING (POST GO-LIVE)

Run these after the site is verified working:

```bash
# 1. Block port 3001 from public internet (UFW)
sudo ufw deny in on eth0 to any port 3001
sudo ufw status

# 2. Enable firewall if not already
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# 3. Disable SSH password auth
sudo sed -i 's/^#*PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo systemctl restart sshd

# 4. Rotate DB password (after go-live)
sudo -u postgres psql -c "ALTER USER cityplus_app WITH PASSWORD 'NEW_UNIQUE_STRONG_PASS';"
sudo -u cityplus sed -i 's|Citypetshopbd2026Secure|NEW_UNIQUE_STRONG_PASS|g' \
  /var/www/cityplus/app/.env.production.local
sudo -u cityplus bash -c "pm2 reload cityplus --update-env"
curl -sf http://127.0.0.1:3001/api/health

# 5. Remove unused deploybot user
sudo userdel -r deploybot 2>/dev/null || true

# 6. Set up daily backup cron (as root)
sudo crontab -e
# Add:
# 0 2 * * * sudo -u postgres pg_dump -Fc -d cityplus_db -f /tmp/cityplus_$(date +\%Y\%m\%d).dump && mv /tmp/cityplus_$(date +\%Y\%m\%d).dump /var/backups/cityplus/ && find /var/backups/cityplus -name "cityplus_*.dump" -mtime +30 -delete
```

---

## SECTION 10 — QUICK REFERENCE CARD

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 CITY PLUS PET SHOP — OPS QUICK REFERENCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 PATHS
   App:         /var/www/cityplus/app
   Uploads:     /var/www/cityplus/uploads
   Backups:     /var/backups/cityplus
   PM2 logs:    /var/log/pm2/cityplus-{out,error}.log
   OLS logs:    /usr/local/lsws/logs/error.log
   OLS vHost:   /usr/local/lsws/conf/vhosts/citypluspetshop.com/vhconf.conf
   Env file:    /var/www/cityplus/app/.env.production.local

 PM2 COMMANDS (run as cityplus)
   Start:       pm2 start ecosystem.config.cjs --env production
   Reload:      pm2 reload cityplus --update-env
   Restart:     pm2 restart cityplus --update-env
   Logs:        pm2 logs cityplus
   Status:      pm2 status

 OLS COMMANDS (run as abrar/sudo)
   Restart:     sudo systemctl restart lsws
   Status:      sudo systemctl status lsws
   Error log:   sudo tail -50 /usr/local/lsws/logs/error.log

 HEALTH CHECKS
   Internal:    curl -I http://127.0.0.1:3001
   Health API:  curl -sf http://127.0.0.1:3001/api/health
   External:    curl -I https://www.citypluspetshop.com/api/health
   Port owner:  sudo lsof -i :3001

 DATABASE
   Connect:     psql -h 127.0.0.1 -U cityplus_app -d cityplus_db
   Backup:      sudo -u postgres pg_dump -Fc -d cityplus_db -f /tmp/bak.dump
   Migrate:     DATABASE_URL='...' npx prisma migrate deploy
   Status:      DATABASE_URL='...' npx prisma migrate status

 DEPLOY SEQUENCE (in order)
   1. pg_dump backup
   2. git pull origin main
   3. npm ci --omit=dev
   4. npx prisma migrate deploy
   5. npm run build
   6. cp -r public .next/standalone/public
   7. cp -r .next/static .next/standalone/.next/static
   8. pm2 reload cityplus --update-env
   9. curl http://127.0.0.1:3001/api/health
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
