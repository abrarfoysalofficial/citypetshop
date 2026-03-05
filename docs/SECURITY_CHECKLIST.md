# Go-Live Security Checklist — City Pet Shop BD

Complete before production launch.

---

## Environment

- [ ] `NODE_ENV=production`
- [ ] `DATABASE_URL` set, uses 127.0.0.1 (not localhost)
- [ ] `NEXTAUTH_SECRET` 32+ characters
- [ ] `NEXTAUTH_URL=https://citypetshop.bd`
- [ ] `AUTH_TRUST_HOST=true`
- [ ] `MASTER_SECRET` 32+ characters (for admin integrations)
- [ ] No secrets in repo; `.env` and `.env.*` in .gitignore

---

## Authentication

- [ ] Admin login at https://citypetshop.bd/admin/login works
- [ ] Session persists after login (HTTPS required)
- [ ] Default admin password changed via `npm run admin:reset` or Profile
- [ ] Non-admin cannot access /admin or /api/admin/*

---

## Reverse Proxy (Nginx)

- [ ] `proxy_set_header X-Forwarded-Proto $scheme`
- [ ] `proxy_set_header X-Forwarded-Host $host`
- [ ] `proxy_set_header Host $host`
- [ ] Backend: `http://127.0.0.1:3000`

---

## SSL / Headers

- [ ] HTTPS enforced (HTTP → 301 to HTTPS)
- [ ] HSTS enabled in Nginx (optional): `add_header Strict-Transport-Security "max-age=31536000; includeSubDomains"`
- [ ] X-Frame-Options, X-Content-Type-Options set (Next.js default)

---

## Database

- [ ] `npx prisma migrate deploy` applied
- [ ] Backup cron scheduled (pg_dump)
- [ ] DB user has minimal required privileges

---

## Build Guardrails

- [ ] `npm run check:nodemo` passes
- [ ] `npm run check:secrets` passes
- [ ] `npm run check:domain` passes
- [ ] `npm run build` succeeds

---

## Post-Go-Live

- [ ] Change default admin password
- [ ] Test checkout flow (COD, SSLCommerz if used)
- [ ] Verify order confirmation email
- [ ] UFW: allow 22, 80, 443; enable
- [ ] Fail2ban (optional)
- [ ] SSH: key-only auth recommended
