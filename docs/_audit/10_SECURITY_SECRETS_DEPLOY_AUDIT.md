# Security, Secrets, Deploy Audit

**Generated:** March 1, 2026

---

## 1. No Secrets in Repo

| Check | Status | Evidence |
|-------|--------|----------|
| .env in .gitignore | ✅ | .gitignore contains .env, .env.local |
| No real secrets in docs | ✅ | MUST_REPLACE_SECRETS uses placeholders |
| No API keys in code | ✅ | SecureConfig for runtime secrets |
| No passwords committed | ✅ | Admin password from env |

---

## 2. MUST_REPLACE_SECRETS Checklist

| Item | Status |
|------|--------|
| DATABASE_URL | Placeholder in docs |
| NEXTAUTH_SECRET | Generate instruction |
| NEXTAUTH_URL | Production URL |
| ADMIN_PASSWORD | 12+ chars in production |
| MASTER_SECRET | For SecureConfig |
| RESEND_API_KEY | Email |
| Courier keys | Admin → Integrations |

**File:** docs/MUST_REPLACE_SECRETS.md — Complete.

---

## 3. Deploy Docs Completeness

| Doc | Sections | Status |
|-----|----------|--------|
| DEPLOY.md | Prerequisites, VPS, PostgreSQL, App, Env, SSL, Deploy, Rollback, Security, RBAC §13b | Complete |
| OPS_RUNBOOKS.md | Backup, Restore, Courier, Monitoring | Complete |
| GIT_PUSH_READY.md | Build, secrets, DB, routes | Complete |

---

## 4. Robots / Sitemap / Schema

| Item | Status | Evidence |
|------|--------|----------|
| /robots.txt | ✅ | app/robots.ts (canonical; duplicate route removed) |
| /sitemap.xml | ✅ | app/sitemap.ts |
| Human sitemap | ✅ | /site-map |
| JSON-LD schema | ✅ | OrganizationSchema, ProductSchema, BlogPostingSchema |

---

## 5. Admin Protection

| Check | Status | Evidence |
|-------|--------|----------|
| Middleware redirect | ✅ | middleware.ts — /admin/* → /admin/login if not auth |
| API guards | ✅ | requireAdminAuth in all admin APIs |
| RBAC | ✅ | hasPermission, Role, Permission |
| Audit log | ✅ | lib/audit.ts; order status, settings, courier, fraud |

---

## 6. Recommendations

1. **Post-deploy:** Change default admin password (DEPLOY §15).
2. **Secrets:** Rotate NEXTAUTH_SECRET, MASTER_SECRET periodically.
3. **Backup:** Ensure cron runs (OPS_RUNBOOKS).
4. **SSL:** Use Full (Strict) on Cloudflare.
