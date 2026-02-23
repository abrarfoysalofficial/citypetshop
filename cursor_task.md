You are acting as an enterprise DevOps engineer for a production Next.js 14 App Router app with Prisma + PostgreSQL, running on Ubuntu 24.04 VPS, behind CyberPanel/OpenLiteSpeed (OLS), with PM2 managing Next.js standalone server on 127.0.0.1:3001.

Project path: /var/www/cityplus/app
Runtime user: cityplus
Admin sudo user: abrar
PM2 app name: cityplus
Domain: citypetshopbd.com
Port: 3001
ecosystem file: /var/www/cityplus/app/ecosystem.config.cjs
Env file: /var/www/cityplus/app/.env.production.local
Reverse proxy: CyberPanel/OpenLiteSpeed (must proxy / and /admin to 127.0.0.1:3001)

GOAL:
- Production-safe deploy with rollback, zero downtime as much as possible, no broken /admin.
- Must include: backup, build, Prisma migrate deploy, restart, health checks, and verify admin routing.

NON-NEGOTIABLE RULES:
- No risky hacks, no disabling security.
- No "rm -rf" outside the app directory.
- Keep secrets out of git. Use .env.production.local only.
- If any step fails, STOP and report exact error and the exact command output.

SECRETS (store in .env.production.local only — never commit):
- CyberPanel: URL, username, password (use password manager)
- Admin panel: admin@citypetshopbd.com + password (use password manager)
- NEXTAUTH_SECRET, DATABASE_URL, etc. — see .env.production.example

DEPLOY SCRIPT:
Run the automated deploy script (implements all phases below):
  sudo bash /var/www/cityplus/app/deploy/deploy-cityplus-vps.sh

ROLLBACK:
See deploy/ROLLBACK_CITYPLUS.md for exact rollback commands.

DEPLOY PLAN (DO EXACTLY IN ORDER):

PHASE A — SAFETY PRECHECK
1) Confirm current user and paths:
   - whoami
   - pwd
   - ls -la /var/www/cityplus/app

2) Confirm disk space + memory:
   - df -h
   - free -h

3) Confirm Node/npm versions:
   - node -v
   - npm -v

4) Confirm pm2 and current app status:
   - sudo -u cityplus pm2 status
   - sudo -u cityplus pm2 info cityplus
   - sudo -u cityplus pm2 logs cityplus --lines 30

PHASE B — BACKUP (MUST DO)
5) Backup database (PostgreSQL local). Use env DATABASE_URL from .env.production.local if available.
   - set -a; source /var/www/cityplus/app/.env.production.local; set +a
   - echo "$DATABASE_URL" | sed 's/\/\/.*:.*@/\/\/***:***@/'
   - Create backup folder: sudo mkdir -p /backups/cityplus && sudo chown abrar:abrar /backups/cityplus
   - Run pg_dump safely (custom format):
     pg_dump "$DATABASE_URL" -F c -f "/backups/cityplus/cityplus_db_$(date +%Y%m%d_%H%M%S).dump"

6) Backup current app build artifacts for rollback:
   - cd /var/www/cityplus/app
   - sudo -u cityplus mkdir -p /var/www/cityplus/releases
   - sudo -u cityplus tar -czf "/var/www/cityplus/releases/app_backup_$(date +%Y%m%d_%H%M%S).tgz" \
       --exclude=node_modules \
       --exclude=.git \
       --exclude=.next/cache \
       .

PHASE C — GET LATEST CODE
7) Pull latest code (do not overwrite env):
   - cd /var/www/cityplus/app
   - git status
   - git pull --rebase
   - git log -1 --oneline

PHASE D — INSTALL + BUILD (STANDALONE)
8) Install deps (production safe):
   - sudo -u cityplus bash -lc 'cd /var/www/cityplus/app && npm ci'

9) Build:
   - sudo -u cityplus bash -lc 'cd /var/www/cityplus/app && npm run build'

10) Ensure standalone structure is correct:
   - ls -la /var/www/cityplus/app/.next/standalone
   - ls -la /var/www/cityplus/app/.next/standalone/.next/BUILD_ID

11) Copy required assets into standalone (MUST):
   - sudo -u cityplus bash -lc 'cd /var/www/cityplus/app && rm -rf .next/standalone/public && cp -r public .next/standalone/'
   - sudo -u cityplus bash -lc 'cd /var/www/cityplus/app && rm -rf .next/standalone/.next/static && cp -r .next/static .next/standalone/.next/'

PHASE E — PRISMA PROD MIGRATION
12) Run Prisma migration deploy using production DATABASE_URL:
   - sudo -u cityplus bash -lc 'set -a; source /var/www/cityplus/app/.env.production.local; set +a; cd /var/www/cityplus/app; npx prisma generate'
   - sudo -u cityplus bash -lc 'set -a; source /var/www/cityplus/app/.env.production.local; set +a; cd /var/www/cityplus/app; npx prisma migrate deploy'

(If migrate deploy fails, STOP. Show error. Do NOT force reset.)

PHASE F — RESTART SERVICE (PM2 + OLS)
13) Restart PM2 app:
   - sudo -u cityplus bash -lc 'cd /var/www/cityplus/app && pm2 restart cityplus --update-env'
   - sudo -u cityplus pm2 save

14) Verify local port is listening:
   - ss -lntp | grep 3001 || true
   - curl -I http://127.0.0.1:3001/api/health || true
   - curl -I http://127.0.0.1:3001/ || true
   - curl -I http://127.0.0.1:3001/admin || true

15) Restart OLS (CyberPanel):
   - sudo systemctl restart lsws
   - sudo systemctl status lsws --no-pager -n 20

PHASE G — END-TO-END CHECKS (CRITICAL)
16) Confirm public site works:
   - curl -I https://citypetshopbd.com/
   - curl -I https://citypetshopbd.com/admin
   - curl -I https://citypetshopbd.com/admin/login

17) IMPORTANT: detect WRONG redirect like "https://localhost:3001/503"
   - If any Location header points to localhost, find the source:
     a) Check Next.js middleware redirect logic
     b) Check NEXTAUTH_URL / NEXT_PUBLIC_SITE_URL / APP_URL in .env.production.local
     c) Check OLS proxy headers: Host, X-Forwarded-Proto, X-Forwarded-Host
   Fix root cause properly.

PHASE H — OLS PROXY HEADERS (IF ADMIN REDIRECTS TO LOCALHOST)
18) Validate that OLS reverse proxy forwards headers:
   Must pass:
   - Host: citypetshopbd.com
   - X-Forwarded-Proto: https
   - X-Forwarded-Host: citypetshopbd.com
   If missing, update vhost proxy settings accordingly.

PHASE I — ROLLBACK PLAN (IF DEPLOY FAILS)
19) If site breaks after deploy:
   - Stop PM2 app
   - Restore last good tgz from /var/www/cityplus/releases/
   - Re-run build + prisma generate + pm2 start
   See deploy/ROLLBACK_CITYPLUS.md for exact commands.

FINAL DELIVERABLE:
- Output a deployment report: commit hash deployed, migration status, PM2 status, curl results for / and /admin, and confirmation that no redirect goes to localhost.
- If any step failed, give the exact fix and rerun steps until all checks pass.
