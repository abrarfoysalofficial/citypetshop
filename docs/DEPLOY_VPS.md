# Deploy City Plus Pet Shop — CyberPanel + OpenLiteSpeed + PM2

Production stack: **PostgreSQL** · **Next.js 14 standalone** · **PM2** · **CyberPanel (OpenLiteSpeed)**

---

## Prerequisites

- VPS Ubuntu 22.04/Debian 12, 2 GB+ RAM (4 GB recommended)
- CyberPanel installed (`cyberpanel.sh`)
- Domain pointed to server (e.g. `citypetshopbd.com`)
- SSH root access

---

## Step 1: Server Setup

### 1.1 Install Node.js 20

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git
node -v   # v20.x
```

### 1.2 Install PM2 globally

```bash
sudo npm install -g pm2
```

### 1.3 Install PostgreSQL

```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable postgresql && sudo systemctl start postgresql

# Create DB user and database
sudo -u postgres psql <<'SQL'
CREATE USER cityplus_app WITH PASSWORD 'STRONG_PASSWORD_HERE';
CREATE DATABASE cityplus_db OWNER cityplus_app;
GRANT ALL PRIVILEGES ON DATABASE cityplus_db TO cityplus_app;
SQL
```

---

## Step 2: Deploy the Application

### 2.1 Create directory and upload/clone code

```bash
sudo mkdir -p /var/www/cityplus/app
sudo chown $USER:$USER /var/www/cityplus/app
cd /var/www/cityplus/app

# Option A: Clone from Git
git clone https://github.com/YOUR_ORG/cityplus-petshop.git .

# Option B: Upload via SFTP, then extract here
```

### 2.2 Create production env file

```bash
nano /var/www/cityplus/app/.env.production.local
```

Paste and fill in real values (copy from `.env.production.example`):

```env
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://citypetshopbd.com
APP_URL=https://citypetshopbd.com

# Database — PostgreSQL (required)
DATABASE_URL=postgresql://cityplus_app:STRONG_PASSWORD_HERE@localhost:5432/cityplus_db

# NextAuth (required)
NEXTAUTH_SECRET=<run: openssl rand -hex 32>
NEXTAUTH_URL=https://citypetshopbd.com

# File uploads
UPLOAD_DIR=/var/www/cityplus/uploads

# SSLCommerz (set if using payment gateway)
# SSLCOMMERZ_STORE_ID=your_store_id
# SSLCOMMERZ_STORE_PASSWORD=your_store_pass
# SSLCOMMERZ_IS_LIVE=true
```

```bash
chmod 600 /var/www/cityplus/app/.env.production.local
mkdir -p /var/www/cityplus/uploads
```

### 2.3 Install dependencies and build

```bash
cd /var/www/cityplus/app

# If RAM < 4 GB, create swap first:
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile

npm ci --omit=dev
npm run build
```

Build output: `.next/standalone/` (self-contained server).

### 2.4 Copy static assets into standalone folder

```bash
# Required after every build — Next.js standalone doesn't auto-copy these
cp -r /var/www/cityplus/app/public /var/www/cityplus/app/.next/standalone/public
cp -r /var/www/cityplus/app/.next/static /var/www/cityplus/app/.next/standalone/.next/static
```

---

## Step 3: Database Migration

```bash
cd /var/www/cityplus/app

# Run all pending migrations (safe, non-destructive)
npx prisma migrate deploy

# (Optional) Seed initial admin user and site settings
# node prisma/seed.js
```

---

## Step 4: PM2 Process Manager

### 4.1 Start with PM2

```bash
cd /var/www/cityplus/app
pm2 start ecosystem.config.cjs --env production
pm2 save
pm2 startup   # Run the printed command to enable boot auto-start
```

### 4.2 Verify

```bash
pm2 status
pm2 logs cityplus --lines 50
# App listens on 127.0.0.1:3001
curl http://127.0.0.1:3001/api/health
```

---

## Step 5: CyberPanel — OpenLiteSpeed Reverse Proxy

### 5.1 Create a website in CyberPanel

1. CyberPanel → **Websites** → **Create Website**
   - Domain: `citypetshopbd.com`
   - PHP: `None` (static/proxy only)
   - SSL: Enable Let's Encrypt after creation

### 5.2 Add External Application (Node.js proxy)

1. **Websites** → `citypetshopbd.com` → **OpenLiteSpeed** → **External App**
2. Click **Add**:
   - **Name:** `cityplus`
   - **Address:** `127.0.0.1:3001`
   - **Max Connections:** `100`
3. Save.

### 5.3 Add Context (reverse proxy rule)

1. **Websites** → `citypetshopbd.com` → **OpenLiteSpeed** → **Context**
2. Click **Add**, choose **Proxy**:
   - **URI:** `/`
   - **Web Server:** select `cityplus` (the external app you just created)
   - **Header Operations:** Add:
     ```
     X-Forwarded-For $REMOTE_ADDR
     X-Forwarded-Proto $SCHEME
     X-Real-IP $REMOTE_ADDR
     ```
3. Save and **Graceful Restart** OpenLiteSpeed.

### 5.4 SSL Certificate

```
CyberPanel → Websites → citypetshopbd.com → SSL → Issue SSL (Let's Encrypt)
```

### 5.5 Force HTTPS redirect

In **Websites** → `citypetshopbd.com` → **Rewrite Rules**, add:

```
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [R=301,L]
```

---

## Step 6: Verify Deployment

```bash
# Health check
curl https://citypetshopbd.com/api/health

# Admin login (set admin password via seed or directly in DB)
# https://citypetshopbd.com/admin/login
```

---

## Updating the App

```bash
cd /var/www/cityplus/app
git pull
npm ci --omit=dev
npm run build

# Re-copy static assets
cp -r public .next/standalone/public
cp -r .next/static .next/standalone/.next/static

# Run new migrations
npx prisma migrate deploy

pm2 restart cityplus
pm2 logs cityplus --lines 20
```

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | ✅ | Min 32-char random string (`openssl rand -hex 32`) |
| `NEXTAUTH_URL` | ✅ | Full site URL including scheme |
| `NEXT_PUBLIC_SITE_URL` | ✅ | Public site URL for sitemap/OG |
| `UPLOAD_DIR` | ✅ | Absolute path for file uploads |
| `SSLCOMMERZ_STORE_ID` | Optional | Payment gateway |
| `SSLCOMMERZ_STORE_PASSWORD` | Optional | Payment gateway |
| `SSLCOMMERZ_IS_LIVE` | Optional | `true` in production |
| `RESEND_API_KEY` | Optional | Email notifications |
| `OPENAI_API_KEY` | Optional | AI chat automation |

---

## PM2 Commands

| Command | Description |
|---|---|
| `pm2 status` | App status and uptime |
| `pm2 logs cityplus` | Live log tail |
| `pm2 restart cityplus` | Graceful restart |
| `pm2 reload cityplus` | Zero-downtime reload (cluster mode) |
| `pm2 stop cityplus` | Stop app |
| `pm2 monit` | CPU/memory monitor |

---

## Troubleshooting

| Issue | Fix |
|---|---|
| Build OOM | Add swap: `sudo fallocate -l 2G /swapfile && ...` |
| 502 Bad Gateway | Check `pm2 status`; verify app runs on port 3001 |
| Static assets 404 | Re-run: `cp -r public .next/standalone/public` |
| DB connection refused | Check `DATABASE_URL`; verify PostgreSQL is running |
| Env vars not loading | Use `.env.production.local`; restart PM2 after changes |
| Admin login loop | Check `NEXTAUTH_SECRET` and `NEXTAUTH_URL` are set |
| Uploads not saving | Check `UPLOAD_DIR` exists and is writable by node process |
