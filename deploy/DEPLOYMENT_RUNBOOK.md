# DEPLOYMENT RUNBOOK — City Plus Pet Shop
> CyberPanel (OpenLiteSpeed) + PM2 + Cloudflare DNS
> Last Updated: 2026-02-22

---

## 0. PRE-REQUISITES

| Requirement | Min Version |
|-------------|-------------|
| VPS RAM | 2 GB (4 GB recommended for 4–5 sites) |
| OS | Ubuntu 24.04 LTS (22.04 also supported) |
| Node.js | 18.x LTS (use nvm) |
| CyberPanel | 2.3+ |
| PostgreSQL | 14+ |
| PM2 | 5+ |
| Cloudflare | DNS proxy (orange cloud) |

---

## 1. VPS INITIAL SETUP

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
nvm alias default 18

# Install PM2 globally
npm install -g pm2

# Install Prisma CLI
npm install -g prisma
```

---

## 2. POSTGRESQL SETUP (Multi-tenant safe)

```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y
sudo systemctl enable postgresql
sudo systemctl start postgresql

# Create DB user (LEAST PRIVILEGE per client)
sudo -u postgres psql <<'SQL'
CREATE USER cityplus_app WITH PASSWORD 'CHANGE_ME_STRONG_PASSWORD';
CREATE DATABASE cityplus_db OWNER cityplus_app;
GRANT ALL PRIVILEGES ON DATABASE cityplus_db TO cityplus_app;
-- Restrict to own schema only (multi-tenant safety)
REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO cityplus_app;
SQL
```

---

## 3. APPLICATION DEPLOYMENT

```bash
# Create system user for this client (multi-tenant isolation)
sudo useradd -m -s /bin/bash cityplus
sudo mkdir -p /var/www/cityplus
sudo chown cityplus:cityplus /var/www/cityplus

# Clone / upload application
cd /var/www/cityplus
git clone https://github.com/YOUR_ORG/city-plus-pet-shop.git app
cd app

# Install dependencies
npm ci --production=false

# Configure environment
cp .env.production.example .env.production.local
nano .env.production.local
# → Set all required env vars (see section 4)

# Build
NODE_ENV=production npx cross-env NODE_OPTIONS=--max-old-space-size=4096 next build

# Run database migrations
DATABASE_URL="postgresql://cityplus_app:PASSWORD@localhost:5432/cityplus_db" npx prisma migrate deploy

# Seed initial data (first deploy only)
DATABASE_URL="postgresql://cityplus_app:PASSWORD@localhost:5432/cityplus_db" npm run db:seed
```

---

## 4. ENVIRONMENT VARIABLES (.env.production.local)

```env
# ── App ──────────────────────────────────────────────────────────────────────
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://www.citypluspetshop.com
APP_URL=https://www.citypluspetshop.com

# ── Database ──────────────────────────────────────────────────────────────────
DATABASE_URL=postgresql://cityplus_app:STRONG_PASSWORD@localhost:5432/cityplus_db

# ── NextAuth ──────────────────────────────────────────────────────────────────
NEXTAUTH_URL=https://www.citypluspetshop.com
NEXTAUTH_SECRET=GENERATE_WITH: openssl rand -hex 32

# ── Payments ──────────────────────────────────────────────────────────────────
SSLCOMMERZ_STORE_ID=your_store_id
SSLCOMMERZ_STORE_PASSWORD=your_store_password
SSLCOMMERZ_IS_LIVE=true

# ── Notifications ─────────────────────────────────────────────────────────────
RESEND_API_KEY=re_xxxxx
EMAIL_FROM=noreply@citypluspetshop.com
BULK_SMS_BD_API_KEY=your_api_key
BULK_SMS_BD_SENDER_ID=CityPlus

# ── Storage (local uploads) ───────────────────────────────────────────────────
UPLOAD_DIR=/var/www/cityplus/uploads

# ── Analytics (optional) ──────────────────────────────────────────────────────
# NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
# NEXT_PUBLIC_FB_PIXEL_ID=XXXXXXXXXX

# ── Couriers (optional – add when keys available) ─────────────────────────────
# STEADFAST_API_KEY=xxx
# PATHAO_CLIENT_ID=xxx
# PATHAO_CLIENT_SECRET=xxx
```

---

## 5. PM2 CONFIGURATION

```bash
# Start with ecosystem config
pm2 start ecosystem.config.cjs --env production

# Save PM2 process list (auto-restart on reboot)
pm2 save
pm2 startup  # Follow the command it prints

# Check status
pm2 status
pm2 logs cityplus --lines 50
```

The `ecosystem.config.cjs` (already in repo root):
```javascript
module.exports = {
  apps: [{
    name: "cityplus",
    script: "node_modules/.bin/next",
    args: "start",
    cwd: "/var/www/cityplus/app",
    instances: 2,          // 2 workers for 4-5 site VPS
    exec_mode: "cluster",
    max_memory_restart: "512M",
    env_production: {
      NODE_ENV: "production",
      PORT: 3001,           // Different port per client site!
    },
    error_file: "/var/log/pm2/cityplus-error.log",
    out_file:   "/var/log/pm2/cityplus-out.log",
  }]
};
```

---

## 6. CYBERPANEL + OPENLIGTSPEED REVERSE PROXY

### Create Website in CyberPanel
1. Login to CyberPanel → **Websites → Create Website**
2. Domain: `citypluspetshop.com`
3. PHP: None (static/proxy only)
4. SSL: Let's Encrypt (or Cloudflare)

### Add OpenLiteSpeed vHost Proxy Config
In CyberPanel → **OpenLiteSpeed → Virtual Hosts → citypluspetshop.com → Rewrite**:

```
RewriteEngine On
RewriteRule ^/(.*) http://127.0.0.1:3001/$1 [P,L]
```

OR create `/usr/local/lsws/conf/vhosts/citypluspetshop.com/vhconf.conf`:

```nginx
context / {
  type                    proxy
  handler                 lsapi:cityplus_next
  addDefaultCharset       off
}

extprocessor lsapi:cityplus_next {
  type                    proxy
  address                 127.0.0.1:3001
  maxConns                50
  pcKeepAliveTimeout      60
  initTimeout             60
  retryTimeout            0
  checkInterval           0
  respBuffer              0
}
```

### WebSocket support (for live analytics)
Add to vHost config:
```
ws.lua  # Enable WebSocket proxy in OLS admin panel
```

### Static asset serving via OLS (performance)
In CyberPanel **Rewrites**, add before proxy rule:
```
RewriteRule ^/_next/static/(.*)$ /var/www/cityplus/app/.next/static/$1 [L]
RewriteRule ^/public/(.*)$ /var/www/cityplus/app/public/$1 [L]
```

---

## 7. CLOUDFLARE DNS + SSL SETTINGS

| Record | Type | Value |
|--------|------|-------|
| `@` | A | VPS IP |
| `www` | CNAME | `@` |
| `_dmarc` | TXT | `v=DMARC1; p=none; rua=mailto:admin@domain` |

### Cloudflare SSL Settings
- SSL/TLS mode: **Full (Strict)** — requires valid cert on VPS
- Always HTTPS: **On**
- Min TLS Version: **1.2**
- HSTS: **Enable**

### Cloudflare Page Rules
```
*citypluspetshop.com/api/*
  → Cache Level: Bypass
  → Security Level: High

*citypluspetshop.com/_next/static/*
  → Cache Level: Cache Everything
  → Edge Cache TTL: 1 year
```

---

## 8. UPLOADS DIRECTORY SETUP

```bash
# Create uploads dir owned by app user
sudo mkdir -p /var/www/cityplus/uploads
sudo chown -R cityplus:cityplus /var/www/cityplus/uploads
sudo chmod 750 /var/www/cityplus/uploads

# OLS: serve /api/media/* via Next.js (already handled)
# Or add static rule in OLS for uploaded files:
# Rewrite: ^/uploads/(.*) /var/www/cityplus/uploads/$1 [L]
```

---

## 9. SSL ON VPS (Let's Encrypt)

```bash
# CyberPanel handles LE via UI
# Manual fallback:
sudo apt install certbot -y
sudo certbot certonly --standalone -d citypluspetshop.com -d www.citypluspetshop.com

# Add to OLS vHost SSL config in CyberPanel
```

---

## 10. HEALTH CHECK & MONITORING

```bash
# Health endpoint (always returns 200 when app is running)
curl https://www.citypluspetshop.com/api/health

# PM2 monitoring
pm2 monit

# Logs
pm2 logs cityplus --lines 100
tail -f /var/log/pm2/cityplus-error.log
```

---

## 11. ROLLBACK PLAN

```bash
# Tag each deploy
git tag v1.0.0-2026-02-22
git push origin --tags

# Rollback to previous version
git checkout v1.0.0-2026-02-20
npm ci --production=false
npm run build
pm2 restart cityplus

# Database rollback (if migration was applied)
npx prisma migrate resolve --rolled-back 20260222_migration_name
```

---

## 12. BACKUP & RESTORE

```bash
# PostgreSQL backup (run daily via cron)
pg_dump -U cityplus_app -h localhost cityplus_db | gzip > /backups/cityplus_$(date +%Y%m%d_%H%M%S).sql.gz

# Uploads backup
tar -czf /backups/uploads_$(date +%Y%m%d).tar.gz /var/www/cityplus/uploads/

# Restore
gunzip -c /backups/cityplus_20260222_120000.sql.gz | psql -U cityplus_app -h localhost cityplus_db
```

**Crontab** (`crontab -e` as root):
```cron
0 2 * * * pg_dump -U cityplus_app cityplus_db | gzip > /backups/cityplus_$(date +\%Y\%m\%d).sql.gz
0 3 * * * find /backups/ -name "*.sql.gz" -mtime +30 -delete
```
