# Requirements compliance checklist

| Requirement | Status | Evidence / paths | Notes |
|-------------|--------|------------------|--------|
| **1) Fix local dev: postcss/lib/postcss.js + webpack cache** | Done | `package.json` (`postcss: 8.4.31`, `overrides.postcss`), `postcss.config.js`, `tailwind.config.ts`, `docs/DEPLOY_VERCEL.md` (cache-clear steps), `npm run dev:clean` | Single PostCSS 8.4.31 via overrides; clear `.next` if cache errors persist. |
| **2) Fix Vercel install/build: next-sanity + Next 14** | Done | `package.json` (next 14.2.18, next-sanity 9.12.3, sanity 4.22.0), `.npmrc` (legacy-peer-deps), `docs/VERCEL_DEPLOY_FIX.md` | Pinned deps; no Next 15/16; lockfile committed. |
| **3) Production env system** | Done | `src/config/runtime.ts`, `.env.local.example`, `docs/PROD_ENV_SETUP.md` | DATA_SOURCE, AUTH_MODE, SITE_URL; fallbacks; prod defaults. |
| **4) Sanity: Studio route vs admin (no conflict)** | Done | `app/studio/[[...tool]]/page.tsx`, `app/admin/studio/[[...tool]]/page.tsx`, `sanity.config.ts`, `sanity/sanity.config.ts`, `docs/VERCEL_DEPLOY_FIX.md` | `/studio` and `/admin/studio` both serve Studio; admin panel at `/admin/*` unchanged. |
| **5) Supabase: auth, orders, realtime, demo fallback** | Done | `lib/supabase/client.ts` (stub when env missing), `app/login/LoginForm.tsx`, `app/track-order/page.tsx`, API routes under `app/api/` | Stub client for local; Supabase when env set; realtime on track-order. |
| **6) Admin: bulk courier, track by ID/phone, realtime timeline** | Done | `app/admin/orders/`, `app/api/admin/courier-booking/`, `app/track-order/page.tsx`, `app/admin/orders/[id]/OrderNotesBlock.tsx` | Bulk select + courier booking; track by Order ID or phone (OTP); timeline with admin/courier notes. |
| **7) Production: no demo credentials on login** | Done | `app/admin/login/page.tsx`, `app/login/LoginForm.tsx` | Demo hint only when `NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS=true` and AUTH_MODE=demo. |
| **8) QA: lint, typecheck, build** | Verify locally | Run: `npm install`, `npm run lint`, `npm run typecheck`, `npm run build` | Use Node 18 or 20; if build OOMs locally, deploy on Vercel. |
| **Docs: PROD_ENV_SETUP.md** | Done | `docs/PROD_ENV_SETUP.md` | All env vars and prod checklist. |
| **Docs: DEPLOY_VERCEL.md** | Done | `docs/DEPLOY_VERCEL.md` | Vercel steps + cache-clear note. |
| **Docs: QA_TEST_SCRIPT.md** | Done | `docs/QA_TEST_SCRIPT.md` | ~30 min click-through (routes, checkout, courier, track, realtime, admin). |

---

## Commit plan (suggested)

1. **Commit A – Sanity admin studio schemas**  
   - `sanity.config.ts`: use `schemaTypes` from `sanity/schemas` so `/admin/studio` shows products/categories; remove custom structure so it matches `/studio`.

2. **Commit B – Docs and dev script**  
   - `docs/PROD_ENV_SETUP.md` (new)  
   - `docs/DEPLOY_VERCEL.md` (new)  
   - `docs/VERCEL_DEPLOY_FIX.md` (Studio routes note)  
   - `docs/REQUIREMENTS_CHECKLIST.md` (new)  
   - `package.json`: add `dev:clean` script.

No features, routes, or admin behavior were removed; only config and documentation were added or updated.
