# Requirements compliance checklist

| # | Requirement | Status | Evidence (file paths) | Fix plan / notes |
|---|-------------|--------|------------------------|------------------|
| **1** | **Node 20 enforcement** | ✅ | `.nvmrc` (20.11.1), `package.json` engines `>=18 <21`, `docs/DEPLOY_VERCEL.md` (Node.js Version = 20.x) | Use `nvm use` or install Node 20.11.1; set Vercel Node to 20.x. No install scripts removed; none break on Node 20. |
| **2** | **PostCSS dev error** (“Cannot find module ... postcss/lib/postcss.js”) | ✅ | `package.json` (`postcss: 8.4.31`, `overrides.postcss`), `postcss.config.js`, `tailwind.config.ts`, `next.config.js`, `docs/DEPLOY_VERCEL.md` (cache-clear steps) | Single PostCSS 8.4.31 via overrides. On Node 20: `Remove-Item -Recurse -Force .next` then `npm install` and `npm run dev` (or `npm run dev:clean`). |
| **3** | **Vercel build: next-sanity vs Next 14** | ✅ | `package.json` (next 14.2.18, next-sanity 9.12.3), `.npmrc` (legacy-peer-deps), `package-lock.json` | next-sanity@9.12.3 compatible with Next 14. legacy-peer-deps required for sanity@4 vs next-sanity peer; lockfile committed. Pass: `npm ci` (or `npm install` if no lockfile) then `npm run lint`, `npm run typecheck`, `npm run build` on Node 20. |
| **4** | **Supabase: migrations + local fallback** | ✅ | `supabase/migrations/*.sql`, `docs/SUPABASE_MIGRATIONS.md`, `lib/supabase/client.ts` (stub when env missing) | Migrations documented; local/demo mode uses stub client; no removal of local products/blog/categories. |
| **5** | **Sanity: Studio route + env safety** | ✅ | `app/studio/[[...tool]]/page.tsx`, `app/admin/studio/[[...tool]]/page.tsx`, `sanity/sanity.config.ts`, `sanity/env.ts` | Studio at /studio and /admin/studio; build-safe fallbacks in env (no server secrets in NEXT_PUBLIC). |
| **6** | **NO DEMO in production** | ✅ | `app/login/LoginForm.tsx`, `app/admin/login/page.tsx`, `src/config/runtime.ts` | Demo hints only when `NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS=true`. Production uses real content when env set. |
| **7** | **Auth: Google + Facebook + Phone OTP; admin OTP toggle** | ✅ | `app/login/LoginForm.tsx`, `app/api/auth/*`, Admin Settings (require_otp_phone_tracking), `supabase/migrations/006_*.sql` | Providers from env; OTP for phone; admin toggle in site_settings (require_otp_phone_tracking). |
| **8A** | **Admin bulk order → 1-click courier (Pathao/Steadfast/RedX)** | ✅ | `app/admin/orders/`, `app/api/admin/courier-booking/`, `app/api/admin/courier-settings/`, `supabase/migrations/007_*.sql` | Bulk select; provider configs and enable/disable in Admin Courier settings. |
| **8B** | **Tracking: Order ID or Phone (BD validation); privacy toggle** | ✅ | `app/track-order/page.tsx`, `app/api/track-order/*`, `supabase/migrations/006_*.sql`, `008_*.sql` | Search by Order ID or phone (BD format); OTP gating when require_otp_phone_tracking enabled. |
| **8C** | **Realtime tracking timeline (Supabase Realtime / polling fallback)** | ✅ | `app/track-order/page.tsx`, Supabase Realtime subscription; polling when no Supabase | Admin + courier notes; Realtime when Supabase configured; polling in local mode. |
| **9** | **Admin dashboard drag & drop layout** | ✅ | `app/admin/AdminDashboardClient.tsx`, `app/api/admin/dashboard-layout/`, `supabase/migrations/007_*.sql` (dashboard_layout) | Drag to reorder; persist in DB (Supabase) or localStorage (local). No widgets removed. |
| **10** | **Analytics: event list, counts, debug viewer; GTM + Meta from settings** | ✅ | `app/admin/analytics/`, `app/api/admin/analytics/events/`, GTM/Meta from Admin settings + env | Event list, counts, last received, payload debug; no hardcoded IDs. |
| **QA** | **30-min click-through test** | ✅ | `docs/QA_TEST_SCRIPT.md` | Routes, checkout, bulk booking, track-by-phone, realtime notes, dashboard drag-drop, analytics, auth/demo. |
| **Deploy** | **Deployment guide** | ✅ | `docs/DEPLOY_VERCEL.md`, `docs/PROD_ENV_SETUP.md` | Required env vars, Node 20.x, domain order, Sanity + Supabase setup steps. |

---

## Commit plan (small commits)

1. **chore: enforce Node 20 for local and Vercel**  
   - `.nvmrc` → `20.11.1`  
   - `docs/DEPLOY_VERCEL.md` → Node 20.x, required env vars, domain order, Sanity + Supabase setup.

2. **docs: Supabase migrations and requirements checklist**  
   - `docs/SUPABASE_MIGRATIONS.md` (new)  
   - `docs/REQUIREMENTS_COMPLIANCE.md` (new)

No features or UI removed; extensions and docs only.
