# GO-LIVE CHECKLIST — City Plus Pet Shop
> Complete ALL items before going live. Sign off each with date + name.

---

## 1. INFRASTRUCTURE ✅

- [ ] VPS provisioned (Ubuntu 22.04, min 2 GB RAM)
- [ ] CyberPanel installed and accessible
- [ ] OpenLiteSpeed running (port 80/443)
- [ ] PostgreSQL 14+ installed and running
- [ ] PM2 installed globally (`pm2 --version`)
- [ ] Node.js 18 LTS installed (`node --version` → v18.x)
- [ ] Domain DNS pointed to VPS (A record + www CNAME)
- [ ] Cloudflare proxy enabled (orange cloud)
- [ ] SSL certificate active (Let's Encrypt or Cloudflare)

---

## 2. DATABASE ✅

- [ ] PostgreSQL database `cityplus_db` created
- [ ] Database user `cityplus_app` created with strong password
- [ ] `prisma migrate deploy` ran successfully (0 pending migrations)
- [ ] `npm run db:seed` ran (admin user + RBAC seeded)
- [ ] Admin user credentials changed from defaults
- [ ] Database backup script scheduled (`crontab -l` shows backup job)
- [ ] Test backup restore verified

---

## 3. APPLICATION ✅

- [ ] `npm run build` passes with 0 TypeScript errors
- [ ] `.env.production.local` created with all required vars
- [ ] `NEXTAUTH_SECRET` set (32+ char random string)
- [ ] `DATABASE_URL` set and tested
- [ ] `NEXT_PUBLIC_SITE_URL` set correctly
- [ ] `NEXTAUTH_URL` matches domain
- [ ] PM2 started: `pm2 status` shows `cityplus` as `online`
- [ ] PM2 startup saved: `pm2 save`
- [ ] Application accessible at domain

---

## 4. PAYMENTS ✅

- [ ] COD visible in checkout
- [ ] SSLCommerz: `SSLCOMMERZ_IS_LIVE=true`
- [ ] SSLCommerz: test payment flow end-to-end
- [ ] SSLCommerz IPN webhook URL registered in SSLCommerz dashboard:
      `https://www.citypluspetshop.com/api/webhooks/sslcommerz`
- [ ] SSLCommerz success/fail/cancel URLs configured in dashboard

---

## 5. SMOKE TESTS ✅

Run: `npx playwright test e2e/smoke.spec.ts`

- [ ] All smoke tests passing
- [ ] Health endpoint returns `{"status":"ok"}`
- [ ] Homepage loads (< 3s)
- [ ] Shop page loads
- [ ] Admin login page loads
- [ ] Track order page loads
- [ ] Product feeds return valid XML

---

## 6. NOTIFICATIONS ✅

- [ ] Email: `RESEND_API_KEY` set (or console-stub in dev)
- [ ] SMS: `BULK_SMS_BD_API_KEY` set (or Twilio credentials)
- [ ] Test order notification: place a COD order → check SMS/email
- [ ] OTP tracking: `/track-order` → enter phone → OTP received

---

## 7. SECURITY ✅

- [ ] `deploy/SECURITY_CHECKLIST.md` — all CRITICAL items checked
- [ ] PostgreSQL not externally accessible (`netstat -tlnp | grep 5432` → 127.0.0.1 only)
- [ ] SSH password auth disabled
- [ ] UFW firewall enabled with correct rules
- [ ] Admin panel only accessible at `/admin` (not exposed to crawlers)
- [ ] `robots.txt` disallows `/admin`

---

## 8. SEO & ANALYTICS ✅

- [ ] `sitemap.xml` accessible at `/sitemap.xml`
- [ ] `robots.txt` accessible
- [ ] Google Analytics ID set in Admin → Settings (if using)
- [ ] Facebook Pixel ID set in Admin → Settings (if using)
- [ ] Google Search Console: site verified

---

## 9. ADMIN SETUP ✅

- [ ] Admin can login at `/admin/login`
- [ ] Admin can view orders dashboard
- [ ] At least one category created
- [ ] At least one product added
- [ ] Checkout settings (delivery charges) configured in Admin
- [ ] Site settings (name, logo, contact) configured in Admin

---

## 10. MONITORING ✅

- [ ] Uptime monitoring configured (UptimeRobot / BetterUptime)
- [ ] Health check URL added: `https://www.citypluspetshop.com/api/health`
- [ ] PM2 log rotation configured
- [ ] Error alerting set up

---

## SIGN-OFF

| Role | Name | Date | Sign |
|------|------|------|------|
| Developer | | | |
| QA | | | |
| Client | | | |

**Note:** Site is GO-LIVE ready only when ALL items above are checked.
