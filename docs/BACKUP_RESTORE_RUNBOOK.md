# Backup & Restore Runbook

## Daily Backup

### One-command backup
```bash
# With defaults (7-day retention, BACKUP_DIR=/var/backups/city-plus)
export DATABASE_URL="postgresql://user:pass@localhost:5432/cityplus"
export UPLOAD_DIR="/var/www/city-plus/uploads"  # optional
./scripts/backup.sh

# Custom retention (14 days)
./scripts/backup.sh 14
```

### Cron (daily at 2 AM)
```cron
0 2 * * * cd /var/www/city-plus && DATABASE_URL="postgresql://..." ./scripts/backup.sh 7
```

### What gets backed up
| Asset | Path | Format |
|-------|------|--------|
| PostgreSQL | `$BACKUP_DIR/db_YYYYMMDD_HHMMSS.dump` | pg_dump custom format |
| Media uploads | `$BACKUP_DIR/media_YYYYMMDD_HHMMSS.tar.gz` | gzipped tar |

---

## Restore to Staging (DR drill)

### One-command restore
```bash
export STAGING_DATABASE_URL="postgresql://user:pass@staging-host:5432/cityplus_staging"
./scripts/restore-to-staging.sh /var/backups/city-plus/db_20250221_020000.dump

# With media
./scripts/restore-to-staging.sh \
  /var/backups/city-plus/db_20250221_020000.dump \
  /var/backups/city-plus/media_20250221_020000.tar.gz
```

### Verification checklist (after restore)
- [ ] App starts: `npm run start` or `pm2 restart city-plus`
- [ ] Health: `curl https://staging.example.com/api/health`
- [ ] Login: Admin login works
- [ ] Products: Product list loads
- [ ] Orders: Recent orders visible
- [ ] Media: Product images load (if media restored)
- [ ] Checkout: Can add to cart (do not complete real payment on staging)

---

## Backup verification

Run monthly to ensure backups are valid:
```bash
# Test DB dump can be read
pg_restore -l /var/backups/city-plus/db_LATEST.dump | head -20

# Test media archive
tar -tzf /var/backups/city-plus/media_LATEST.tar.gz | head -20
```
