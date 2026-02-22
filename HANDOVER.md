# City Plus Pet Shop — Client Handover

## Admin access

- **URL:** https://citypetshopbd.com/admin/login
- **Default admin:** admin@citypetshopbd.com (after seed or reset)
- Auth uses `passwordHash` (bcrypt); no legacy `password` field.

## Reset admin password

If you forget the admin password:

```bash
cd /var/www/cityplus/app
ADMIN_PASSWORD='YourNewSecurePassword123!' npm run admin:reset
```

Use a strong password (12+ characters). The script updates the existing admin user.

## Backup and restore

### Database backup

```bash
sudo -u postgres pg_dump -Fc -d cityplus_db -f /var/backups/cityplus/backup_$(date +%Y%m%d_%H%M).dump
```

### Restore

```bash
sudo -u postgres pg_restore -c -d cityplus_db /var/backups/cityplus/backup_YYYYMMDD_HHMM.dump
```

### Uploads

Back up `/var/www/cityplus/uploads` if using local file storage.

## Key files

| File | Purpose |
|------|---------|
| `.env.production.local` | Secrets (never commit) |
| `ecosystem.config.cjs` | PM2 config |
| `deploy/deploy-production.sh` | Deploy script |

## Support

- Site: https://citypetshopbd.com
- Admin: https://citypetshopbd.com/admin
