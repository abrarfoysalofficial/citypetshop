# Git Push Ready — Pre-Push Checklist

**Before pushing and uploading to CyberPanel.**

---

## 1. Build & Validation

- [ ] `Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue; npm run build` → exit 0
- [ ] `npm run typecheck` → no errors
- [ ] `npm run lint` → no errors

---

## 2. Secrets & Env

- [ ] No real secrets in committed files
- [ ] `.env` and `.env.local` in `.gitignore`
- [ ] `docs/MUST_REPLACE_SECRETS.md` reviewed

---

## 3. Database

- [ ] `npx prisma generate` (if schema changed)
- [ ] Migrations applied: `npm run db:setup` or `npx prisma migrate deploy` + `npm run db:seed`
- [ ] Seed ready: `npm run db:seed` (idempotent)

---

## 4. Pre-CyberPanel Upload

- [ ] Production `.env` values ready (DATABASE_URL, NEXTAUTH_SECRET, etc.)
- [ ] `MASTER_SECRET` for SecureConfig (Admin Integrations)
- [ ] `ADMIN_EMAIL` and `ADMIN_PASSWORD` for seed (production: 12+ char password)

---

## 5. Routes Verified (Manual Checklist)

- [ ] `/` — Home
- [ ] `/shop` — Shop (search: `/shop?q=dog`)
- [ ] `/shop/[category]/[subcategory]/[product]` — Product page (e.g. /shop/dog-food/dry-food/sample-product)
- [ ] `/cart` — Cart
- [ ] `/checkout` — Checkout
- [ ] `/blog` — Blog listing
- [ ] `/blog/[slug]` — Blog post
- [ ] `/terms` — Terms & Conditions
- [ ] `/privacy` — Privacy Policy
- [ ] `/refund` — Return/Refund Policy
- [ ] `/track-order` — Track order (OTP send/verify)
- [ ] `/site-map` — Human sitemap (linked in footer)
- [ ] `/offers` — Offers + Flash Sale
- [ ] `/sitemap.xml` — XML sitemap
- [ ] `/robots.txt` — Robots file
- [ ] `/about`, `/contact` — About, Contact

---

## 6. Post-Upload Verification

- [ ] `curl -sf https://citypetshop.bd/api/health` → `{"status":"ok"}`
- [ ] Admin login at `/admin`
- [ ] Change default admin password
- [ ] Homepage, /shop, /blog, canonical product route loads

---

## Note: Duplicate robots removed

`app/robots.txt/route.ts` was removed. Canonical `/robots.txt` is served by `app/robots.ts` (Next.js metadata route).

---

## Quick Commands

```powershell
# Local verification
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run build
npm run dev
# Visit http://localhost:3000
```
