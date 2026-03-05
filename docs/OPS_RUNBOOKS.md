# Ops Runbooks — City Plus Pet Shop

**Production operations.** Backup, restore, rollback, migrations.  
**Runtime:** systemd → pm2-cityplus.service → PM2 → Next.js standalone (no Docker).

---

## 1. Backup

### PostgreSQL

```bash
pg_dump -h 127.0.0.1 -U cityplus_app -d cityplus_db -F c \
  -f /var/backups/cityplus/db_$(date +%Y%m%d_%H%M%S).dump
```

### Uploads

```bash
tar -czf /var/backups/cityplus/uploads_$(date +%Y%m%d).tar.gz \
  /var/www/cityplus/uploads/
```

### Cron (daily 2 AM)

```cron
0 2 * * * pg_dump -h 127.0.0.1 -U cityplus_app cityplus_db -F c -f /var/backups/cityplus/db_$(date +\%Y\%m\%d).dump
0 2 * * * tar -czf /var/backups/cityplus/uploads_$(date +\%Y\%m\%d).tar.gz /var/www/cityplus/uploads/
0 3 * * * find /var/backups/cityplus -name "*.dump" -mtime +30 -delete
```

---

## 2. Restore

### Database

```bash
pg_restore -h 127.0.0.1 -U cityplus_app -d cityplus_db --clean --if-exists \
  /var/backups/cityplus/db_YYYYMMDD_HHMMSS.dump
```

### Uploads

```bash
tar -xzf /var/backups/cityplus/uploads_YYYYMMDD.tar.gz -C /
```

### Courier Go-Live Checklist

- [ ] `MASTER_SECRET` set (32+ chars)
- [ ] Admin → Integrations: Pathao credentials (client_id, client_secret, username, password, store_id)
- [ ] Admin → Courier: Pathao enabled, active provider = Pathao
- [ ] **Sandbox OFF** for production (Admin → Courier → uncheck Sandbox)
- [ ] Test Pathao: Admin → Integrations → "Test Pathao" returns OK
- [ ] Create test order, book courier from Admin → Orders → order detail → "Book Courier"
- [ ] Verify tracking code in Pathao merchant panel

### Courier UI Steps

1. **Single order:** Admin → Orders → [order] → Actions → "Book Courier" → result shows provider, tracking code, "Copy tracking code". Rebook disabled (idempotent).
2. **Bulk:** Admin → Orders → Booking tab → "Bulk Book Courier" → select orders → Book Selected → per-order success/fail summary → "Retry Failed Only" if needed.

### Courier Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| 429 | Rate limit from provider | Wait, retry later |
| 409 | Provider disabled or credentials missing | Admin → Courier: enable provider; Admin → Integrations: add keys |
| Invalid credentials | Wrong Pathao keys / sandbox vs prod mismatch | Check sandbox mode; verify keys in Pathao merchant panel |
| Rebook disabled | Order already has courier booking | Idempotent — no action needed |

### Verification

- [ ] `curl -sf http://127.0.0.1:3000/api/health`
- [ ] Admin login
- [ ] Products, orders load
- [ ] Media loads (if restored)

### Deploy / Rollback

| Action | Command |
|--------|---------|
| Deploy | `bash /var/www/cityplus/app/deploy/deploy-production.sh` |
| Rollback (code only) | `bash deploy/rollback.sh` |
| Rollback (code + DB) | `bash deploy/rollback.sh --restore-db` |

---

## 3. Rollback

### App (code)

```bash
pm2 stop cityplus
cd /var/www/cityplus
# Restore from backup tarball
tar -xzf releases/app_backup_YYYYMMDD_HHMMSS.tgz -C app_rollback
cp app/.env.production.local app_rollback/
rm -rf app && mv app_rollback app
cd app
npx prisma generate
npm run build
cp -r public .next/standalone/public
cp -r .next/static .next/standalone/.next/static
pm2 start ecosystem.config.cjs --env production
pm2 save
```

### Database (migration rollback)

```bash
# Restore from pre-migration backup
pg_restore -h 127.0.0.1 -U cityplus_app -d cityplus_db --clean --if-exists \
  /var/backups/cityplus/pre_migrate_YYYYMMDD.dump

# Mark migration rolled back (optional)
npx prisma migrate resolve --rolled-back <migration_name>
```

---

## 4. Migrations

### Deploy

```bash
# 1. Backup first
pg_dump -h 127.0.0.1 -U cityplus_app cityplus_db -F c \
  -f /var/backups/cityplus/pre_migrate_$(date +%Y%m%d).dump

# 2. Deploy
npx prisma migrate deploy

# 3. Regenerate
npx prisma generate

# 4. Restart
pm2 restart cityplus
```

---

## 5. Monitoring

### Basics

| Check | Command |
|-------|---------|
| PM2 | `pm2 list` |
| Logs | `pm2 logs cityplus` |
| Health | `curl -sf http://127.0.0.1:3000/api/health` |
| Disk | `df -h` |
| DB connections | `psql -c "SELECT count(*) FROM pg_stat_activity;"` |

### Uptime & Logs

- **Uptime:** Use UptimeRobot, Pingdom, or Cloudflare Health Checks for `https://citypetshop.bd`
- **Error logs:** `pm2 logs cityplus --err`
- **Slow queries:** Enable `log_min_duration_statement` in PostgreSQL for queries > 1s

---

## 6. Rate Limits (Reference)

| Endpoint | Limit |
|----------|-------|
| POST /api/auth/callback/credentials | 5 / 15 min |
| POST /api/checkout/order | 5 / IP |
| POST /api/track-order/send-otp | 15 min / phone |

---

## 7. PR-9 Security (Reference)

### Env Vars

| Var | Purpose |
|-----|---------|
| `CSP_ALLOW_UNSAFE_EVAL` | Set `true` to restore unsafe-eval in CSP (rollback if GTM/GA break) |
| `SSLCOMMERZ_IP_ALLOWLIST` | Comma-separated IPs for webhook; unset = no IP check |
| `IMPORT_BODY_LIMIT_BYTES` | Max body for bulk import (default 2MB, max 10MB) |

### Verification (post-deploy)

```bash
# CSP header (no unsafe-eval when rollback not needed)
curl -sI http://127.0.0.1:3000/ | grep -i content-security-policy

# 413 on oversized analytics
curl -X POST http://127.0.0.1:3000/api/analytics/events \
  -H "Content-Type: application/json" -H "Content-Length: 70000" -d '{"event_name":"x"}' -w "%{http_code}"
# Expect 413
```

### Rollback

- **CSP:** Set `CSP_ALLOW_UNSAFE_EVAL=true`, rebuild, redeploy
- **Webhook allowlist:** Unset `SSLCOMMERZ_IP_ALLOWLIST`, restart
