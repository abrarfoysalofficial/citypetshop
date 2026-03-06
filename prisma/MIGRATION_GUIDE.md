# Prisma Migration Guide — Production

## Pre-deploy Checklist

1. **Validate schema**
   ```bash
   npx prisma validate
   ```

2. **Generate client**
   ```bash
   npx prisma generate
   ```

3. **Apply migrations** (production)
   ```bash
   npx prisma migrate deploy
   ```

## Migration Order (chronological)

| Migration | Description |
|-----------|-------------|
| `20260225020022_init` | Initial schema (tenants, users, products, orders, etc.) |
| `20260226030000_add_notification_log` | Notification logs table |
| `20260226054035_add_secure_config` | Secure config + audit logs |
| `20260226054123_add_secure_config_value_len` | value_len column on secure_configs |
| `20260226060055_add_courier_booking_log` | Courier booking logs |
| `20260226061325_add_courier_booking_sandbox` | Sandbox column + created_at index |
| `20260301000000_add_product_search_indexes` | products name_en, slug indexes |
| `20260306000000_add_tiktok_pixel` | tiktok_pixel_id on tenant_settings |

## Safe Production Sequence

```bash
# 1. Backup database (recommended)
pg_dump -h localhost -U user -d citypluspetshop > backup_$(date +%Y%m%d).sql

# 2. Deploy migrations
npx prisma migrate deploy

# 3. Verify
npx prisma migrate status
```

## Notes

- **No data loss:** Migrations only add tables/columns. No destructive DROP in this set.
- **Idempotent tiktok_pixel:** Uses `ADD COLUMN IF NOT EXISTS` for safety.
- **Raw SQL:** Dashboard uses `$queryRaw` for monthly aggregation. Uses parameterized `tenantId`.
