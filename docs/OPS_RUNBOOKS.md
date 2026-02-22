# Phase 8 — Ops Runbooks

**Date:** 2026-02-22

---

## 1. Backups Runbook

### Prisma DB Backup (PostgreSQL)

```bash
# Full backup
pg_dump -h localhost -U postgres -d citypluspetshop -F c -f backup_$(date +%Y%m%d_%H%M).dump

# Restore
pg_restore -h localhost -U postgres -d citypluspetshop -c backup_YYYYMMDD_HHMM.dump
```

### File Backup

```bash
# Backup uploads, .env
tar -czvf site_backup_$(date +%Y%m%d).tar.gz .env.local uploads/
```

### Schedule (cron)

```cron
0 2 * * * /path/to/backup-db.sh
0 3 * * 0 /path/to/backup_full.sh
```

---

## 2. Migration Runbook

### Prisma Migrations (Production)

```bash
# 1. Backup first
pg_dump ... > pre_migrate_backup.dump

# 2. Deploy migrations
npx prisma migrate deploy

# 3. Regenerate client
npx prisma generate

# 4. Restart app
pm2 restart cityplus
```

### Rollback

```bash
# Restore from backup
pg_restore -c -d citypluspetshop pre_migrate_backup.dump

# Revert code
git checkout HEAD~1 -- prisma/
```

---

## 3. Rate Limiting Plan

| Endpoint | Limit | Window |
|----------|-------|--------|
| POST /api/auth/callback/credentials | 5 | 15 min |
| POST /api/checkout/order | 10 | 1 min |
| POST /api/admin/* | 100 | 1 min |
| GET /api/* | 200 | 1 min |

Configure in `lib/rate-limit.ts` or middleware.

---

## 4. Monitoring Checklist

- [ ] PM2 process list: `pm2 list`
- [ ] Logs: `pm2 logs cityplus`
- [ ] Disk: `df -h`
- [ ] Database connections: `SELECT count(*) FROM pg_stat_activity;`
- [ ] SSL certificate expiry
- [ ] Cloudflare DNS / proxy status

---

## 5. Settings Summary

| Setting | Path | Purpose |
|---------|------|---------|
| Website | /admin/settings | Logo, colors, meta |
| Menu | /admin/menus | Navbar, footer links |
| Contact | /admin/settings | Phone, email, address |
| IP Restrictions | /admin/fraud | Block IPs |
| Shipping | /admin/shipping | Delivery charges |
| Global AI | /admin/global-ai | Safe mode, logging |
