# Feature Matrix — Admin vs Storefront

**Generated:** March 1, 2026

---

## Matrix (abbreviated columns: SF=Storefront, Ad=Admin, API, DB, Seed, Docs, Status)

| Feature | SF | Ad | API | DB | Seed | Docs | Status |
|---------|----|----|-----|----|------|------|--------|
| Auth/RBAC | yes | yes | yes | yes | yes | yes | complete |
| Catalog (categories) | yes | yes | yes | yes | yes | — | complete |
| Catalog (brands) | partial | yes | yes | yes | — | — | complete |
| Catalog (products) | yes | yes | yes | yes | yes | — | complete |
| Catalog (variants) | yes | yes | yes | yes | — | — | complete |
| Search | partial | — | partial | yes | — | — | incomplete |
| Cart | yes | — | — | — | — | — | complete |
| Checkout | yes | yes | yes | yes | — | — | complete |
| Payments (COD/wallet) | yes | yes | yes | yes | yes | — | complete |
| Courier | — | yes | yes | yes | yes | yes | complete |
| Orders | yes | yes | yes | yes | — | — | complete |
| Track order + OTP | yes | — | yes | yes | — | — | complete |
| Fraud policy | — | yes | yes | yes | yes | — | complete |
| Audit log | — | yes | yes | yes | — | — | complete |
| Blog | yes | yes | yes | yes | yes | — | complete |
| Legal pages | yes | — | — | — | — | — | complete |
| SEO (sitemap/robots/schema) | yes | — | yes | — | — | — | complete |
| Analytics | yes | yes | yes | yes | — | — | complete |
| Notifications | — | — | partial | yes | — | — | incomplete |
| Admin settings | — | yes | yes | yes | yes | yes | complete |
| Multi-tenant | — | — | yes | yes | yes | — | complete |
| Draft orders | — | yes | yes | yes | — | — | complete |
| Vouchers | yes | yes | yes | yes | — | — | complete |
| Reviews | yes | yes | yes | yes | — | — | complete |
| Reminders | — | — | — | yes | — | — | missing |
| Conversations | — | partial | yes | yes | — | — | incomplete |
| Inventory logs | — | — | — | yes | — | — | missing |
| Landing pages | yes | yes | yes | yes | — | — | complete |
| Collections | — | yes | yes | yes | — | — | complete |
| Flash sale | — | — | yes | yes | — | — | incomplete |
| Live visitors | — | yes | yes | yes | — | — | complete |

---

## Evidence Paths

- Storefront: app/page.tsx, app/shop, app/product, app/checkout, app/blog, components/home/*
- Admin: app/admin/*, lib/admin-config.ts
- API: app/api/*
- DB: prisma/schema.prisma
- Docs: docs/DEPLOY.md, docs/MUST_REPLACE_SECRETS.md, docs/PROJECT_ROADMAP.md
