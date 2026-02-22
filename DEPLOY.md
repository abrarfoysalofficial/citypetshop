# City Plus Pet Shop — Production Deployment

Ubuntu 24.04 · OpenLiteSpeed/CyberPanel · PM2 · PostgreSQL · Cloudflare

## Prerequisites

- Node.js 18–20
- PostgreSQL (local or remote)
- PM2 (`npm i -g pm2`)
- OpenLiteSpeed reverse proxy

## 1. Server Setup

### Clone and install

```bash
sudo mkdir -p /var/www/cityplus
sudo chown $USER:$USER /var/www/cityplus
cd /var/www/cityplus
git clone <repo-url> app
cd app
npm ci --omit=dev
npx prisma generate
```

### Environment

```bash
cp .env.production.example .env.production.local
# Edit .env.production.local with real values
```

Required variables:

- `DATABASE_URL` — PostgreSQL connection string (use `127.0.0.1`, not `localhost`)
- `NEXTAUTH_SECRET` — **Required.** Static value from `openssl rand -hex 32`. Do NOT use `$(...)` or command substitution.
- `NEXTAUTH_URL` — `https://citypetshopbd.com` (never localhost in production)
- `AUTH_TRUST_HOST` — **Required behind proxy.** Set to `true` so NextAuth trusts X-Forwarded-Host/Proto from Cloudflare/OLS.
- `NEXT_PUBLIC_SITE_URL` — `https://citypetshopbd.com`
- `APP_URL` — `https://citypetshopbd.com`

## 2. Database

```bash
npx prisma migrate deploy
npm run db:seed
```

## 3. Build and static assets

```bash
NODE_OPTIONS=--max-old-space-size=4096 npm run build
cp -r public .next/standalone/public
cp -r .next/static .next/standalone/.next/static
```

## 4. PM2

```bash
cd /var/www/cityplus/app
pm2 start ecosystem.config.cjs --env production
pm2 save
pm2 startup  # if not already configured
```

PM2 loads `.env.production.local` via dotenv (CLI arg `dotenv_config_path` + `DOTENV_CONFIG_PATH` in env_production).

## 5. OpenLiteSpeed proxy

External App: `127.0.0.1:3001`  
Rewrite: `^/(.*) http://127.0.0.1:3001/$1 [P,L]`

## 6. Post-deploy smoke test

### Curl checks (run from server or locally)

```bash
# Health
curl -sf http://127.0.0.1:3001/api/health
# Expect: {"status":"ok",...}

# Static assets (replace * with actual chunk hash from build)
curl -sI "https://citypetshopbd.com/_next/static/chunks/main-*.js" | head -1
# Expect: HTTP/2 200

# Auth session (unauthenticated)
curl -sI https://citypetshopbd.com/api/auth/session
# Expect: HTTP/2 200

# Admin (should redirect to login)
curl -sI https://citypetshopbd.com/admin
# Expect: HTTP/2 307 or 302 to /admin/login

# Category fallback image (no /_next/image 400)
curl -sI https://citypetshopbd.com/categories/category-1.svg
# Expect: HTTP/2 200
```

### Browser checks

1. **Homepage** — https://citypetshopbd.com loads, no broken images.
2. **Popular Categories** — Uses `/categories/category-1.svg`; no 404/400 in Network tab.
3. **Admin login** — https://citypetshopbd.com/admin/login → sign in with admin@citypetshopbd.com.
4. **Console** — No `t.target.closest is not a function` or `/ _next/image` 400 errors.

## 7. Deploy script (updates)

```bash
bash deploy/deploy-production.sh
```

Or manually:

```bash
cd /var/www/cityplus/app
git pull origin main
npm ci --omit=dev
npx prisma migrate deploy
NODE_OPTIONS=--max-old-space-size=4096 npm run build
cp -r public .next/standalone/public
cp -r .next/static .next/standalone/.next/static
pm2 reload cityplus --update-env
```

## Admin reset

```bash
cd /var/www/cityplus/app
ADMIN_PASSWORD='YourNewSecurePassword123!' npm run admin:reset
```
