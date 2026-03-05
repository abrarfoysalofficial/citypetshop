# Security & Production Audit Report

**Date:** 2026-03-06  
**Project:** City Pet Shop BD  
**Stack:** Next.js App Router, NextAuth, Prisma, PostgreSQL  
**Target:** VPS CloudPanel, Node 20, Port 3000, https://citypetshop.bd

---

## Executive Summary

This audit covers authentication, API security, secrets management, database, headers, observability, domain integrity, and demo-mode removal. Risks are ranked Critical/High/Medium/Low with exact file paths and minimal fix scope.

---

## 1. Authentication & Authorization

### 1.1 NextAuth Config (lib/auth.ts)

| Risk | Level | Finding | Fix |
|------|-------|---------|-----|
| trustHost | Medium | NextAuth v4 uses `AUTH_TRUST_HOST` env; not explicitly set in authOptions. | Env validation already requires `AUTH_TRUST_HOST=true` in production. Add `trustHost: true` to authOptions when in production for defense-in-depth. |
| Cookies | Low | Cookies: secure, sameSite=lax, httpOnly in production. | Already correct. |
| Redirect | Low | `getAuthBaseUrl()` locks to citypetshop.bd in production. | Already correct. |

### 1.2 Middleware (middleware.ts)

| Risk | Level | Finding | Fix |
|------|-------|---------|-----|
| Redirect loop | Low | /admin/login when already logged-in admin → redirect to /admin. | Already handled. |
| Non-admin on /admin | Low | Logged-in non-admin → redirect to /. | Already handled. |
| Rate limit | Low | Admin login: 5 req/15min per IP. | Already implemented. |

### 1.3 Admin API Protection (lib/admin-auth.ts)

| Risk | Level | Finding | Fix |
|------|-------|---------|-----|
| RBAC | Low | requireAdminAuth + hasPermission("admin.view"). | Already enforced. |
| 403 response | Low | Unauthorized returns 401/403. | Already correct. |

### 1.4 CSRF & Session

| Risk | Level | Finding | Fix |
|------|-------|---------|-----|
| CSRF | Low | NextAuth handles CSRF for credentials. | No change. |
| Session fixation | Low | JWT strategy, 30-day maxAge. | Acceptable. |

---

## 2. API Security

### 2.1 Input Validation

| Risk | Level | Finding | Fix |
|------|-------|---------|-----|
| Admin settings PATCH | Medium | Body parsed without Zod. | Add Zod schema for PATCH /api/admin/settings. |
| Admin payment-gateways PATCH | Low | Body parsed, id required. | Add Zod for updates. |
| Admin orders [id] routes | Low | ID from params, tenantId scoped. | IDOR prevented by tenant scope. |

### 2.2 Rate Limiting

| Risk | Level | Finding | Fix |
|------|-------|---------|-----|
| Login | Low | 5/15min per IP in middleware. | Already done. |
| Admin APIs | Low | No per-route limit. | Acceptable (admin is authenticated). |

### 2.3 IDOR

| Risk | Level | Finding | Fix |
|------|-------|---------|-----|
| Orders | Low | All admin order routes use getDefaultTenantId() + order id. | Tenant-scoped; no IDOR. |
| Vouchers, customers | Low | Same pattern. | OK. |

### 2.4 Open Redirect

| Risk | Level | Finding | Fix |
|------|-------|---------|-----|
| NextAuth redirect | Low | redirect callback restricts to authBase. | Already safe. |

---

## 3. Secrets & Config

| Risk | Level | Finding | Fix |
|------|-------|---------|-----|
| .gitignore | Medium | .env* covered; add *.pem, id_rsa*. | Add to .gitignore. |
| Secret scan | High | No pre-commit/prebuild check for secrets. | Add scripts/check-secrets.ts. |
| Env validation | Low | validateProductionEnv() at /api/health. | Already done. |
| Hardcoded creds | Low | None found. | OK. |

---

## 4. Database

| Risk | Level | Finding | Fix |
|------|-------|---------|-----|
| Prisma singleton | Low | globalForPrisma pattern. | Correct. |
| Pool | Low | DATABASE_URL params for connection_limit. | Documented. |
| Query timeout | Low | Prisma default. | Acceptable. |
| Error sanitization | Low | checkDbConnectivity returns error without DB URL. | OK. |
| Migration | Low | migrate deploy only. | Correct. |

---

## 5. Web Security Headers

| Risk | Level | Finding | Fix |
|------|-------|---------|-----|
| Headers | Low | X-Frame-Options, X-Content-Type-Options, Referrer-Policy, CSP. | Already in next.config.js. |
| HSTS | Medium | Not set in Next.js. | Add via Nginx (recommended in docs). |
| Cookies | Low | secure, sameSite. | OK. |

---

## 6. Observability

| Risk | Level | Finding | Fix |
|------|-------|---------|-----|
| /api/health | Low | Returns ok, dbPingMs, checks. No secrets. | OK. |
| /api/health/db | Low | Returns latencyMs. Error sanitized. | OK. |
| Logging | Low | logError sanitizes PII. | OK. |
| Correlation | Low | x-request-id in middleware. | OK. |

---

## 7. Domain Integrity

| Risk | Level | Finding | Fix |
|------|-------|---------|-----|
| site-url | Low | getAuthBaseUrl() locks to citypetshop.bd in prod. | OK. |
| remotePatterns | Low | citypetshop.bd, www.citypetshop.bd. | OK. |
| check-domain | Low | Script exists, prebuild. | OK. |

---

## 8. Demo Mode

| Risk | Level | Finding | Fix |
|------|-------|---------|-----|
| Demo artifacts | Low | check-no-demo.ts, demo routes removed. | Verified. |
| DEPLOY.md | Low | References "demo_session" in RBAC section. | Update to remove demo reference. |

---

## Top 10 Risks (Summary)

| # | Risk | Level | File | Fix |
|---|------|-------|------|-----|
| 1 | No secret scan in build | High | - | Add check-secrets.ts, prebuild |
| 2 | .gitignore missing *.pem, id_rsa | Medium | .gitignore | Add entries |
| 3 | Admin settings PATCH no Zod | Medium | app/api/admin/settings/route.ts | Add Zod |
| 4 | trustHost not explicit in auth | Medium | lib/auth.ts | Add trustHost: true (prod) |
| 5 | HSTS not set | Medium | Nginx | Document in Nginx config |
| 6 | DEPLOY.md demo_session ref | Low | docs/DEPLOY.md | Remove demo ref |
| 7 | Health errMsg in dev | Low | app/api/health/route.ts | Already sanitized |
| 8 | /api/health/db error | Low | app/api/health/db/route.ts | Already sanitized |
| 9 | AUTH_MODE dead code | Low | middleware.ts | Minor cleanup |
| 10 | ENV_TEMPLATE.md | Low | docs/ | Create keys-only template |

---

## Implemented Fixes (Phase 2)

- scripts/check-secrets.ts added
- .gitignore updated (*.pem, id_rsa*, etc.)
- prebuild: check:nodemo then check:secrets then check:domain
- Zod validation for admin settings PATCH
