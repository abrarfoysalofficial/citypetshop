# VPS Production Audit Report — City Plus Pet Shop

**Date:** 2026-02-23  
**Stack:** Next.js 14 App Router, Prisma, PostgreSQL, PM2, OpenLiteSpeed  
**Environment:** Ubuntu 24.04 VPS, CyberPanel, citypetshopbd.com

---

## Executive Summary

**Status: ✅ PRODUCTION READY**

The project is ready for live deployment on the VPS. All critical components are configured correctly. Minor improvements (env validation, deploy script hardening) have been implemented.

---

## Audit Findings

### 1. Build & Runtime ✅

| Item | Status |
|------|--------|
| Next.js standalone output | ✅ `output: "standalone"` |
| Prisma externalized | ✅ `serverComponentsExternalPackages` |
| Standalone server path | ✅ `.next/standalone/server.js` |
| Asset copying | ✅ public + .next/static → standalone |
| PM2 script | ✅ Uses standalone server, port 3001, 127.0.0.1 |

### 2. Database ✅

| Item | Status |
|------|--------|
| PostgreSQL provider | ✅ |
| Migrations | ✅ 15 migrations, all additive |
| New migrations (this release) | About page, Sales top bar |
| Seed script | ✅ Idempotent |
| Connection | ✅ 127.0.0.1 (TCP) |

### 3. Environment ✅

| Item | Status |
|------|--------|
| .env.production.local | ✅ Required, gitignored |
| .env.production.example | ✅ Documented |
| Required vars | DATABASE_URL, NEXTAUTH_*, AUTH_TRUST_HOST |
| Pre-deploy validation | ✅ Added to deploy script |

### 4. Security ✅

| Item | Status |
|------|--------|
| Security headers | ✅ CSP, X-Frame-Options, etc. |
| Auth (NextAuth) | ✅ JWT, AUTH_TRUST_HOST |
| Middleware | ✅ Admin protection, rate limit |
| Bind address | ✅ 127.0.0.1 only |

### 5. Deployment ✅

| Item | Status |
|------|--------|
| Deploy script | ✅ deploy/deploy-cityplus-vps.sh |
| Backup (DB + app) | ✅ Before deploy |
| Rollback procedure | ✅ deploy/ROLLBACK_CITYPLUS.md |
| Upgrade guideline | ✅ deploy/UPGRADE_GUIDELINE.md |

### 6. Reverse Proxy ✅

| Item | Status |
|------|--------|
| OpenLiteSpeed | ✅ Proxy to 127.0.0.1:3001 |
| X-Forwarded-* | ✅ Required for NextAuth |
| Static assets | ✅ Optional OLS disk serve |

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Migration failure | DB backup before deploy; never use `migrate reset` |
| Env var typo | Pre-deploy validation in script |
| Localhost redirect | NEXTAUTH_URL, AUTH_TRUST_HOST, OLS headers |
| Downtime | Deploy takes ~2–5 min; script minimizes it |

---

## Recommendations

1. **Before first deploy:** Run `deploy/deploy-cityplus-vps.sh` in a test run (dry-run or staging).
2. **After deploy:** Verify `/about`, `/admin/about`, `/admin/settings` (sales top bar).
3. **Ongoing:** Schedule daily DB backups via cron (see DEPLOYMENT_RUNBOOK).

---

## Files Reference

| File | Purpose |
|------|---------|
| `deploy/UPGRADE_GUIDELINE.md` | Step-by-step upgrade procedure |
| `deploy/deploy-cityplus-vps.sh` | Automated deploy script |
| `deploy/ROLLBACK_CITYPLUS.md` | Rollback procedure |
| `deploy/DEPLOYMENT_RUNBOOK.md` | Full deployment runbook |
| `ecosystem.config.cjs` | PM2 config |
| `scripts/validate-env.sh` | Optional env validation |

---

*Report generated for City Plus Pet Shop VPS upgrade*
