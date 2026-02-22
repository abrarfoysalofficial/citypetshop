# Rollback Plan — City Plus Pet Shop

## Quick Rollback (same server)

1. **Stop app**:
   ```bash
   pm2 stop city-plus-pet-shop
   ```

2. **Checkout previous release**:
   ```bash
   cd /var/www/city-plus-pet-shop
   git fetch && git checkout <previous-tag-or-commit>
   ```

3. **Restore DB** (if migration was applied):
   ```bash
   DATABASE_URL=... ./deploy/restore_postgres.sh /var/backups/city-plus/db_YYYYMMDD_HHMMSS.dump
   ```

4. **Rebuild and start**:
   ```bash
   npm ci
   npx prisma generate
   npm run build
   pm2 start city-plus-pet-shop
   ```

## Zero-Downtime Rollback (blue-green)

If using two app directories:

1. Switch OpenLiteSpeed proxy from port 3000 to 3001 (or vice versa)
2. Reload OpenLiteSpeed
3. Start old app on alternate port, stop new app

## Post-Rollback

- Verify `/api/health` returns OK
- Test admin login
- Test checkout flow
