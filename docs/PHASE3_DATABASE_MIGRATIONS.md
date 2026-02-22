# Phase 3 — Database & Migrations

## Prisma Schema Sanity Check

- **Products**: Indexes on `categorySlug`, `slug`, `isFeatured` — OK for 500+ products
- **Orders**: Consider adding `@@index([createdAt(sort: Desc)])` for admin dashboard
- **ProductReview**: `productId`, `orderId` indexed via FKs — OK
- **TrackOtpVerification**: `phoneNormalized`, `expiresAt` — add composite index if OTP volume is high

### Suggested Index (optional)

```prisma
// In Order model
@@index([createdAt(sort: Desc)])
@@index([status])
```

## Migration Plan for Production

1. **Set DATABASE_URL** in `.env.production` before build
2. **Deploy migrations**:
   ```bash
   npx prisma migrate deploy
   ```
3. **Seed database** (first deploy only):
   ```bash
   ADMIN_PASSWORD="YourSecurePassword12!" npx prisma db seed
   ```
4. **Verify**:
   ```bash
   npx prisma db execute --stdin <<< "SELECT 1"
   ```

## First Admin User Bootstrap

Use the seed script with `ADMIN_PASSWORD`:

```bash
ADMIN_EMAIL=admin@yourdomain.com ADMIN_PASSWORD="YourSecurePassword12!" npx prisma db seed
```

Or run the bootstrap script: `scripts/bootstrap-admin.sh`

## Indexes for 500+ Products

Current schema already has:
- `Product`: `@@index([categorySlug])`, `@@index([slug])`, `@@index([isFeatured])`
- `Category`: `slug` unique
- `Order`: Consider adding `@@index([createdAt])` for reports

No additional indexes required for 500 products; existing indexes suffice.
