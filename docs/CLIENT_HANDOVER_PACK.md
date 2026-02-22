# City Plus Pet Shop — Client Handover Pack

## Admin Access

- **URL**: `https://yourdomain.com/admin/login`
- **Email**: Set in `ADMIN_EMAIL` during seed (default: admin@citypetshopbd.com)
- **Password**: Set in `ADMIN_PASSWORD` during seed — **never use default in production**

## Adding Products

1. Login at `/admin/login`
2. Go to **Products** → **Add Product**
3. Fill: Name, SKU, Category, Price, Stock, Images
4. Save

## Managing Orders

1. Go to **Orders**
2. View, update status (Pending → Processing → Shipped → Delivered)
3. Add notes if needed
4. Courier booking: use **Courier** action when configured

## Backups

- **Database**: `./deploy/backup_postgres.sh [retention_days]`
- **Uploads**: `./deploy/backup_uploads.sh [retention_days]`
- **Restore**: `DATABASE_URL=... ./deploy/restore_postgres.sh /path/to/dump.dump`

Recommended: Set cron for daily backups

```cron
0 2 * * * cd /var/www/city-plus-pet-shop && ./deploy/backup_postgres.sh 7
0 3 * * * cd /var/www/city-plus-pet-shop && ./deploy/backup_uploads.sh 7
```

## SSL Renewal

- CyberPanel handles Let's Encrypt renewal automatically
- Verify renewal: CyberPanel → SSL → Certificates

## Log Locations

- **PM2**: `~/.pm2/logs/city-plus-pet-shop-*.log`
- **Web server**: CyberPanel → Logs

## Support

- Technical: [Your contact]
- Hosting: CyberPanel support / your VPS provider
