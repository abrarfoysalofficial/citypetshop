# Must Replace Secrets — Production Checklist

**Version:** 1.1  
**Last Updated:** March 1, 2026  
**Purpose:** Real secrets that MUST be replaced before production. Do not commit these.

---

## Pre-Deploy Checklist

- [ ] All items below reviewed and replaced
- [ ] `.env` and `.env.local` in `.gitignore` (verify)
- [ ] No secrets in `docs/` or committed files
- [ ] `MASTER_SECRET` set for SecureConfig encryption (production)

---

## 1. Environment Variables (.env / .env.local)

| Variable | Where to Paste | Current (Dev) | Production Action |
|----------|----------------|---------------|-------------------|
| `DATABASE_URL` | Root `.env` | `postgresql://user:password@localhost:5432/...` | Use production DB URL |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Root `.env` | `pk_test_...` | Use Clerk production publishable key |
| `CLERK_SECRET_KEY` | Root `.env` | `sk_test_...` | Use Clerk production secret key |
| `NEXT_PUBLIC_SITE_URL` | Root `.env` | `http://localhost:3000` | `https://citypetshop.bd` |
| `ADMIN_EMAIL` | Root `.env` (optional) | `admin@citypetshop.bd` | Change for production |
| `ADMIN_PASSWORD` | Root `.env` (optional) | `Admin@12345!` | **MUST set 12+ chars in production** |
| `MASTER_SECRET` | Root `.env` | Not set (SecureConfig disabled) | `openssl rand -base64 32` for encryption |
| `RESEND_API_KEY` | Root `.env` | `re_xxxxx` | Real Resend API key |
| `REDIS_URL` | Root `.env` | Optional | `redis://...` if using Redis |

**Pre-deploy:** Run `npx prisma db seed` with `ADMIN_EMAIL` and `ADMIN_PASSWORD` set. Change admin password after first login.

---

## 2. Admin Panel — Secure Config (Encrypted)

Configure via **Admin → Settings → Integrations** (or **Admin → Advanced Settings → Secure Config**).

| Key | Purpose | Where to Paste |
|-----|---------|----------------|
| `courier:steadfast:api_key` | Steadfast API Key | Admin → Integrations |
| `courier:steadfast:secret_key` | Steadfast Secret Key | Admin → Integrations |
| `sslcommerz_store_id` | SSLCommerz Store ID | Admin → Payments (if enabling) |
| `sslcommerz_store_password` | SSLCommerz Password | Admin → Payments |

**Note:** Requires `MASTER_SECRET` in `.env` for SecureConfig to work. No real secrets committed.

---

## 3. Admin User Credentials

| Item | Dev Default | Production Action |
|------|-------------|-------------------|
| Email | `admin@citypetshop.bd` | Set `ADMIN_EMAIL` in .env before seed |
| Password | `Admin@12345!` | Set `ADMIN_PASSWORD` (12+ chars) in .env before seed; **MUST change** after first login |

**Idempotent seed:** `npx prisma db seed` creates/updates admin user. Does not overwrite password on re-run.

---

## 4. Wallet Numbers (bKash, Nagad, Rocket)

| Gateway | Where to Configure | Placeholder |
|---------|-------------------|-------------|
| bKash | Admin → Payments → bKash → Configure | Wallet Number: `01XXXXXXXXX` |
| Nagad | Admin → Payments → Nagad → Configure | Merchant Number: `01XXXXXXXXX` |
| Rocket | Admin → Payments → Rocket → Configure | Wallet Number: `01XXXXXXXXX` |

**Pre-deploy:** Replace placeholders with real merchant/wallet numbers. Enable gateways after configuring.

---

## 5. Third-Party Keys (Optional)

| Service | Variable / Config | Production Action |
|---------|-------------------|-------------------|
| Google Tag Manager | `NEXT_PUBLIC_GTM_ID` | Real GTM container ID |
| Meta Pixel | TenantSettings / Secure Config | Real Pixel ID |
| Meta CAPI | SecureConfig | Server-side token |
| Cloudflare Analytics | `NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN` | Real token |

---

## 6. Where to Paste (Quick Reference)

| Location | File / UI |
|----------|-----------|
| App env | `.env` or `.env.local` in project root |
| Steadfast | Admin → Settings → Integrations |
| SSLCommerz | Admin → Payments |
| Wallet numbers | Admin → Payments (bKash, Nagad, Rocket) |

---

## 7. Post-Deploy Verification

- [ ] Admin login works with new password
- [ ] Steadfast courier booking succeeds (test order)
- [ ] SSLCommerz (if enabled) completes test payment
- [ ] Wallet payments (bKash/Nagad/Rocket) show correct numbers in checkout
- [ ] Emails send via Resend (test order confirmation)
- [ ] No secret values in browser DevTools or network responses
