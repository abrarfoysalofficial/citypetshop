# City Plus Pet Shop — Deployment Runbook

**Domain:** https://citypetshopbd.com  
**Stack:** Next.js 14, Prisma, PostgreSQL, PM2, OpenLiteSpeed, Cloudflare

---

## Quick Reference

| Document | Purpose |
|----------|---------|
| [deploy/DEPLOYMENT_RUNBOOK.md](deploy/DEPLOYMENT_RUNBOOK.md) | **Full step-by-step** — Ubuntu 24.04, PM2, OpenLiteSpeed, Cloudflare |
| [docs/HANDOVER.md](docs/HANDOVER.md) | Client handover, team images, admin settings |
| [deploy/deploy-production.sh](deploy/deploy-production.sh) | Production deploy script |

---

## Pre-Deploy Checklist

- [ ] `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET` set in `.env.production.local`
- [ ] `npx prisma migrate deploy` run
- [ ] `npm run build` succeeds
- [ ] Health: `curl -sf http://127.0.0.1:3001/api/health` returns `{"status":"ok"}`

---

## Deploy Commands (Ubuntu 24.04 + PM2)

```bash
cd /var/www/cityplus/app
git pull origin main
npm ci --production=false
npx prisma migrate deploy
NODE_ENV=production npm run build
pm2 reload ecosystem.config.cjs --env production
curl -sf http://127.0.0.1:3001/api/health
```

---

## Rollback

```bash
bash deploy/rollback.sh
```
