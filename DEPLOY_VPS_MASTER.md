# City Plus Pet Shop – Master VPS Deployment Guide

**Target:** Ubuntu 24.04 LTS, Nginx Proxy Manager, PostgreSQL, local media, NextAuth credentials.  
**Domain:** https://citypetshopbd.com (and www)  
**No third-party SaaS:** No AWS S3, Supabase, Sanity, or Vercel.

---

## 1. Repo Scan Summary

| Component | Implementation |
|-----------|----------------|
| **Database** | PostgreSQL via Prisma (`DATABASE_URL`) |
| **Auth** | NextAuth v4 Credentials (bcryptjs + Prisma `users`) |
| **Media** | Local filesystem (`UPLOAD_DIR`, default `/var/www/city-plus/uploads`) |
| **Upload API** | `POST /api/admin/upload` → saves to `UPLOAD_DIR` |
| **Media Route** | `GET /api/media/[...path]` → serves from `UPLOAD_DIR` (path traversal protected) |
| **Payment** | Optional; from Prisma `payment_gateways`; COD fallback when none configured |
| **Removed** | AWS S3, MinIO, Supabase Storage |

---

## 2. Required Code Changes (Already Applied)

- Media route: local filesystem instead of S3
- Upload route: local filesystem instead of Supabase
- Config: `prisma` products/auth source
- Provider: Prisma-backed data when `DATA_SOURCE=prisma`
- Admin auth: NextAuth when `AUTH_MODE=prisma`
- Middleware: NextAuth JWT when `AUTH_MODE=prisma`
- Login: NextAuth `signIn` when `AUTH_MODE=prisma`
- Checkout order: Prisma when `DATABASE_URL` set
- Payment gateways: Prisma when configured
- Removed: `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`

---

## 3. Environment Variables

### `.env.production` (or Docker env)

```env
# Required
DATABASE_URL=postgresql://cityplus:YOUR_DB_PASSWORD@localhost:5432/cityplus
NEXTAUTH_URL=https://citypetshopbd.com
NEXTAUTH_SECRET=your-secret-min-32-chars-random-string

# Build-time (set before npm run build)
NEXT_PUBLIC_SITE_URL=https://citypetshopbd.com
NEXT_PUBLIC_PRODUCTS_SOURCE=prisma
NEXT_PUBLIC_AUTH_SOURCE=prisma

# Uploads (default: /var/www/city-plus/uploads)
UPLOAD_DIR=/var/www/city-plus/uploads

# Optional
APP_URL=https://citypetshopbd.com
```

### Generate `NEXTAUTH_SECRET`

```bash
openssl rand -base64 32
```

---

## 4. Option 1: Docker Compose (Recommended)

### 4.1 Paths on VPS

```
/opt/apps/city-plus/          # Project root
/opt/apps/city-plus/uploads   # Persistent uploads (bind mount or volume)
```

### 4.2 Setup

```bash
# As user abrar
sudo mkdir -p /opt/apps/city-plus
cd /opt/apps/city-plus

# Clone or copy project (from current repo)
# If deploying from local: rsync/scp the project
# Example: scp -r "F:\client website\City plus pet shop\*" abrar@YOUR_VPS_IP:/opt/apps/city-plus/

# Create .env
cat > .env << 'EOF'
POSTGRES_USER=cityplus
POSTGRES_PASSWORD=CHANGE_ME_STRONG_PASSWORD
POSTGRES_DB=cityplus
NEXTAUTH_SECRET=GENERATE_WITH_openssl_rand_base64_32
NEXTAUTH_URL=https://citypetshopbd.com
NEXT_PUBLIC_SITE_URL=https://citypetshopbd.com
EOF

# Find Nginx Proxy Manager network
docker network ls | grep nginx

# If NPM uses "nginx-proxy_default", the compose file is ready.
# If the network does not exist, create it:
#   docker network create nginx-proxy_default
# If NPM uses a different name (e.g. nginx_proxy), edit docker-compose.yml
# and replace nginx-proxy_default with your network name.
```

### 4.3 Build and Run

```bash
cd /opt/apps/city-plus
docker compose up -d --build
```

### 4.4 Connect App to NPM

1. In Nginx Proxy Manager: **Proxy Hosts** → **Add Proxy Host**
2. **Domain Names:** `citypetshopbd.com`, `www.citypetshopbd.com`
3. **Scheme:** `http`
4. **Forward Hostname / IP:** `app` (Docker service name) or `172.x.x.x` (app container IP)
5. **Forward Port:** `3000`
6. **Websockets:** ON
7. **SSL:** Request new certificate, Force SSL, HTTP/2

If NPM is in another Docker network, connect the app to it:

```bash
docker network connect nginx-proxy_default city-plus-app-1
```

(Replace `city-plus-app-1` with the actual app container name from `docker ps`.)

### 4.5 Seed Admin User (First Deploy)

```bash
docker compose exec app npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
```

Or set env and run:

```bash
docker compose exec -e ADMIN_EMAIL=admin@citypetshopbd.com -e ADMIN_PASSWORD=YourSecurePassword app npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
```

---

## 5. Option 2: PM2 + Postgres in Docker

### 5.1 Paths

```
/opt/apps/city-plus/           # App
/opt/apps/city-plus/uploads    # Uploads
```

### 5.2 Postgres

```bash
docker run -d --name cityplus-postgres \
  -e POSTGRES_USER=cityplus \
  -e POSTGRES_PASSWORD=YOUR_PASSWORD \
  -e POSTGRES_DB=cityplus \
  -v cityplus_pgdata:/var/lib/postgresql/data \
  -p 5432:5432 \
  --restart unless-stopped \
  postgres:16-alpine
```

### 5.3 App Setup

```bash
sudo mkdir -p /opt/apps/city-plus /var/www/city-plus/uploads
sudo chown -R abrar:abrar /opt/apps/city-plus /var/www/city-plus

cd /opt/apps/city-plus
# Copy project files here

# Create .env.production (see section 3)
# Set UPLOAD_DIR=/var/www/city-plus/uploads

npm ci
npx prisma generate
npm run build
npx prisma migrate deploy
npm run db:seed
```

### 5.4 PM2

```bash
npm install -g pm2
pm2 start npm --name "city-plus" -- start
pm2 save
pm2 startup
```

### 5.5 NPM Proxy Host

- **Forward Hostname:** `127.0.0.1` or VPS IP  
- **Forward Port:** `3000`  
- Rest same as Option 1.

---

## 6. Security & Reliability

### 6.1 UFW

```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
# Optional: restrict 81 (NPM admin) to your IP
# sudo ufw allow from YOUR_IP to any port 81
sudo ufw enable
```

### 6.2 Swap (2GB)

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### 6.3 Node Memory (if needed)

```bash
# In package.json start script or PM2:
NODE_OPTIONS=--max-old-space-size=2048
```

---

## 7. Backup

### Postgres

```bash
# Manual
docker exec cityplus-postgres pg_dump -U cityplus cityplus > backup_$(date +%Y%m%d).sql

# Or with compose
docker compose exec postgres pg_dump -U cityplus cityplus > backup_$(date +%Y%m%d).sql
```

### Uploads

```bash
tar -czvf uploads_backup_$(date +%Y%m%d).tar.gz /var/www/city-plus/uploads
# Or for Docker volume:
docker run --rm -v city-plus_uploads_data:/data -v $(pwd):/backup alpine tar czvf /backup/uploads_backup.tar.gz /data
```

---

## 8. Verification Checklist

- [ ] `npm run build` succeeds on VPS
- [ ] `curl https://citypetshopbd.com/api/health` returns `{"status":"ok","database":"connected"}`
- [ ] Customer login at `/login` works (NextAuth credentials)
- [ ] Admin login at `/admin/login` works
- [ ] Admin upload works; file is reachable at `/api/media/product-images/...`
- [ ] Checkout creates order; DB CRUD works
- [ ] After reboot, app and DB start automatically
- [ ] SSL works (HTTPS, no mixed content)

---

## 9. File Reference

### Dockerfile (multi-stage)

See project `Dockerfile`.

### docker-compose.yml

See project `docker-compose.yml`.

### .env.production.example

See project `.env.production.example`.

---

## 10. Troubleshooting

| Issue | Action |
|-------|--------|
| **Prisma P1012: "url is no longer supported"** | You may have Prisma 7 installed. Run `npm install` (or `npm ci`) to use the project's Prisma 5. Then use `npm run db:generate` instead of `npx prisma generate`. The project pins Prisma 5.22.0 via overrides. |
| **"cross-env is not recognized"** | Run `npm install` to install devDependencies. The build script uses `npx cross-env` so it resolves from node_modules. |
| Build fails (Prisma) | Set `DATABASE_URL` before build, or use a dummy URL for build |
| Health returns 503 | Check Postgres; run `npx prisma migrate deploy` |
| Admin login 401 | Run seed; ensure user has `role: "admin"` |
| Upload fails | Ensure `UPLOAD_DIR` exists and app process can write |
| Media 404 | Check path; ensure file exists under `UPLOAD_DIR` |
| NPM 502 | Ensure app listens on `0.0.0.0:3000`; check Docker network |
