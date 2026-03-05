# Production Redeploy Plan — City Pet Shop BD

Clean, low-downtime redeploy strategy for VPS (CloudPanel + Nginx).

---

## 1. Folder Structure

### Option A: Releases (recommended for rollback)

```
/home/citypetshop/
├── citypetshop.bd/
│   ├── current -> releases/20250306_143000    # Symlink to active release
│   ├── releases/
│   │   ├── 20250306_143000/                  # This deploy
│   │   │   ├── .next/
│   │   │   ├── public/
│   │   │   ├── package.json
│   │   │   └── ...
│   │   └── 20250305_120000/                  # Previous (rollback target)
│   ├── shared/
│   │   ├── .env.production.local
│   │   ├── uploads/
│   │   └── logs/
│   └── backups/
│       ├── db/
│       └── uploads/
```

### Option B: Flat (CloudPanel default)

```
/home/citypetshop/htdocs/citypetshop.bd/
├── .next/
├── public/
├── uploads/
├── .env.production.local
└── ...
```

**Use Option A** if you need rollback. **Use Option B** if you prefer CloudPanel’s default layout.

---

## 2. Build & Start Strategy

### PM2 (recommended)

- `pm2 reload` for zero-downtime restart (spawn new, then kill old)
- `pm2 startOrReload` for first deploy or redeploy
- Logs: `~/.pm2/logs/` or `pm2 logs cityplus`

### Systemd (alternative)

- Run PM2 under systemd so it survives reboots
- `pm2 startup` + `pm2 save`

---

## 3. Environment Variable Management

| Location | Purpose |
|----------|----------|
| `shared/.env.production.local` | Production secrets (Option A) |
| `htdocs/citypetshop.bd/.env.production.local` | Production secrets (Option B) |
| `/root/.citypetshop_db_pass` | DB password (root only) |

**Rules:**
- Never commit `.env.production.local`
- Load from `shared/` via symlink: `current/.env.production.local -> ../shared/.env.production.local`
- Backup env before deploy: `cp shared/.env.production.local shared/.env.production.local.bak`

---

## 4. Nginx Config Validation

### Pre-deploy check

```bash
# Test Nginx config
sudo nginx -t

# Expected: syntax is ok
#           test is successful
```

### Required proxy block

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

### Post-deploy check

```bash
# Verify headers reach app
curl -sI -H "X-Forwarded-Proto: https" -H "X-Forwarded-Host: citypetshop.bd" http://127.0.0.1:3000/api/health | head -5
```

---

## 5. Rollback Strategy

### Option A (releases)

```bash
cd /home/citypetshop/citypetshop.bd
PREV=$(readlink -f current | xargs basename)
# Or: PREV=$(ls -t releases/ | sed -n '2p')

ln -sfn releases/$PREV current
APP_DIR=/home/citypetshop/citypetshop.bd/current pm2 reload cityplus --update-env
pm2 save
```

### Option B (flat)

```bash
cd /home/citypetshop/htdocs/citypetshop.bd
git checkout HEAD~1
npm ci
npx prisma migrate deploy
NODE_OPTIONS=--max-old-space-size=4096 npm run build
cp -r public .next/standalone/public 2>/dev/null || true
cp -r .next/static .next/standalone/.next/static 2>/dev/null || true
APP_DIR=/home/citypetshop/htdocs/citypetshop.bd pm2 reload cityplus --update-env
pm2 save
```

---

## 6. Commands List (Copy-Paste Ready)

### Pre-deploy (backup + validation)

```bash
# 1. DB backup
sudo mkdir -p /home/citypetshop/backups/db
sudo -u postgres pg_dump -Fc cityplus_db -f /home/citypetshop/backups/db/cityplus_db_$(date +%Y%m%d_%H%M%S).dump

# 2. Uploads backup (optional)
mkdir -p /home/citypetshop/backups/uploads
cp -r /home/citypetshop/htdocs/citypetshop.bd/public/uploads /home/citypetshop/backups/uploads/$(date +%Y%m%d_%H%M%S) 2>/dev/null || true

# 3. Env backup
cp /home/citypetshop/htdocs/citypetshop.bd/.env.production.local /home/citypetshop/htdocs/citypetshop.bd/.env.production.local.bak 2>/dev/null || true

# 4. Nginx config validation
sudo nginx -t
```

### Deploy (flat)

```bash
cd /home/citypetshop/htdocs/citypetshop.bd
git fetch origin
git checkout main
git pull origin main

npm ci
npx prisma generate
npx prisma migrate deploy
NODE_OPTIONS=--max-old-space-size=4096 npm run build

cp -r public .next/standalone/public 2>/dev/null || true
cp -r .next/static .next/standalone/.next/static 2>/dev/null || true

APP_DIR=/home/citypetshop/htdocs/citypetshop.bd pm2 startOrReload ecosystem.config.js --env production --update-env --only cityplus
pm2 save
```

### Post-deploy (smoke tests)

```bash
# 1. Health (local)
curl -sf http://127.0.0.1:3000/api/health | jq .
# Expect: "status":"ok", "database":"connected"

# 2. Health (via proxy)
curl -sf https://citypetshop.bd/api/health | jq .

# 3. DB health
curl -sf http://127.0.0.1:3000/api/health/db | jq .

# 4. Homepage
curl -sI https://citypetshop.bd | head -1
# Expect: HTTP/2 200

# 5. Admin login page
curl -sI https://citypetshop.bd/admin/login | head -1
# Expect: HTTP/2 200

# 6. PM2 status
pm2 status cityplus
# Expect: online
```

### Rollback (flat)

```bash
cd /home/citypetshop/htdocs/citypetshop.bd
git log -1 --oneline
git checkout main~1
npm ci
npx prisma migrate deploy
NODE_OPTIONS=--max-old-space-size=4096 npm run build
cp -r public .next/standalone/public 2>/dev/null || true
cp -r .next/static .next/standalone/.next/static 2>/dev/null || true
APP_DIR=/home/citypetshop/htdocs/citypetshop.bd pm2 reload cityplus --update-env
pm2 save
```

---

## 7. Full Redeploy Script (One Block)

```bash
# === PRE-DEPLOY ===
sudo mkdir -p /home/citypetshop/backups/db
sudo -u postgres pg_dump -Fc cityplus_db -f /home/citypetshop/backups/db/cityplus_db_$(date +%Y%m%d_%H%M%S).dump
cp /home/citypetshop/htdocs/citypetshop.bd/.env.production.local /home/citypetshop/htdocs/citypetshop.bd/.env.production.local.bak 2>/dev/null || true
sudo nginx -t

# === DEPLOY ===
cd /home/citypetshop/htdocs/citypetshop.bd
git pull origin main
npm ci
npx prisma generate
npx prisma migrate deploy
NODE_OPTIONS=--max-old-space-size=4096 npm run build
cp -r public .next/standalone/public 2>/dev/null || true
cp -r .next/static .next/standalone/.next/static 2>/dev/null || true
APP_DIR=/home/citypetshop/htdocs/citypetshop.bd pm2 startOrReload ecosystem.config.js --env production --update-env --only cityplus
pm2 save

# === POST-DEPLOY ===
sleep 3
curl -sf http://127.0.0.1:3000/api/health | jq .
curl -sf https://citypetshop.bd/api/health | jq .
pm2 status cityplus
```

---

## 8. Downtime Minimization

| Step | Downtime |
|------|----------|
| `pm2 reload` | ~2–5 s (new process starts before old stops) |
| `git pull` + `npm run build` | None (build runs while old app serves) |
| `prisma migrate deploy` | None (migrations are non-blocking) |
| Nginx reload | None (if config unchanged) |

**Total expected downtime:** ~2–5 seconds during PM2 reload.

---

## 9. Related Docs

- [docs/DEPLOY_CLOUDPANEL.md](DEPLOY_CLOUDPANEL.md) — Initial setup
- [docs/DB_MIGRATION_RUNBOOK.md](DB_MIGRATION_RUNBOOK.md) — Migrations & backup
- [docs/AUTH_PRODUCTION.md](AUTH_PRODUCTION.md) — Auth & smoke tests
