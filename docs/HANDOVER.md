# City Plus Pet Shop — Client Handover

**Domain:** https://citypetshopbd.com  
**Stack:** Next.js 14, TypeScript, Prisma, PostgreSQL, PM2, OpenLiteSpeed

---

## 1. Where to Upload Team Images

Place images in **`public/team/`**:

| File | Purpose |
|------|---------|
| `founder.jpg` | Founder (Sheikh Shakil) photo |
| `developer.jpg` | Developer/team member photo |
| `fresheritbd-logo.png` | Fresher IT BD logo |

**Admin path:** Admin → About Page — edit Founder and Team members; paste image URLs (e.g. `/team/founder.jpg` or `/api/media/about-images/...`).

---

## 2. Admin Settings Guide

### Sliding Top Bar (Announcement Bar)
- **Admin → Settings → Store Information → Sliding Top Bar Text**
- **Enable/Disable:** Checkbox "Enable announcement bar" — uncheck to hide the bar site-wide.
- Default text: `City Plus Pet Shop — 100% Authentic Pet Supplies • Fast Delivery • Best Price Guarantee • Hotline: 01643-390045`
- Use `•` to separate items. Text scrolls at top of every page.

### About Page
- **Admin → About Page** — edit Founder (Sheikh Shakil) and Team members
- Image URL: `/team/founder.jpg` or upload via Admin → Upload (bucket: about-images)

### Site Identity, Contact, Delivery
- **Admin → Settings** — logo, site name, address, phone, email, delivery fees

---

## 3. Backup Instructions

```bash
# Database backup (run before deploy)
pg_dump -U cityplus_app -h localhost cityplus_db > backup_$(date +%F_%T).sql

# Restore (if needed)
psql -U cityplus_app -h localhost cityplus_db < backup_YYYY-MM-DD_HH-MM-SS.sql
```

---

## 4. Deployment Steps

```bash
cd /var/www/cityplus/app

# 1. Backup DB
pg_dump -U cityplus_app -h localhost cityplus_db > backup_$(date +%F_%T).sql

# 2. Pull code
git pull origin main

# 3. Install
npm ci

# 4. Prisma
npx prisma generate
npx prisma migrate deploy

# 5. Build
npm run build

# 6. Copy standalone assets
cp -r public .next/standalone/public
cp -r .next/static .next/standalone/.next/static

# 7. Restart
pm2 reload city-plus-app --update-env
sudo systemctl restart lsws

# 8. Health check
curl -I https://citypetshopbd.com/
curl -I https://citypetshopbd.com/admin
```

**If /admin redirects to localhost → stop and fix before going live.**

---

## 5. Security Checklist

- [ ] `NEXTAUTH_URL=https://citypetshopbd.com` in production
- [ ] `NEXTAUTH_SECRET` is strong (32+ chars)
- [ ] `DATABASE_URL` not exposed
- [ ] Proxy sets `X-Forwarded-Host` and `X-Forwarded-Proto`
- [ ] SSH key-only access (no password)
- [ ] Firewall allows only 80, 443, 22

---

## 6. Environment Variables (Production)

```env
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://citypetshopbd.com
NEXTAUTH_SECRET=<32+ char secret>
NEXT_PUBLIC_SITE_URL=https://citypetshopbd.com
UPLOAD_DIR=/var/www/cityplus/uploads
```

---

## 7. Support

- **Developer:** Abrar Foysal — abrar@fresheritbd.com  
- **Fresher IT BD:** https://fresheritbd.com
