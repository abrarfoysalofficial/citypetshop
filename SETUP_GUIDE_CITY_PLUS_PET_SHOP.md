# Setup Guide – City Plus Pet Shop (3-Source Architecture)

This guide explains how to run the app with **Sanity** (CMS), **Supabase** (DB/Auth/Storage), and **Local demo** data, and how to configure them for production.

---

## 1. Overview: Sanity vs Supabase vs Local

| Responsibility | Primary | Fallback | Notes |
|----------------|---------|----------|--------|
| **Products, categories, home, combo offers, blog content** | Sanity CMS | Local demo data | Set `NEXT_PUBLIC_PRODUCTS_SOURCE=sanity` or `auto` with Sanity configured. |
| **Auth (login, OTP, sign up)** | Supabase Auth | Demo (cookie-based) | Set `NEXT_PUBLIC_AUTH_SOURCE=supabase` or `auto` with Supabase configured. |
| **Orders, admin data, analytics** | Supabase DB | Local/demo (read-only) | Same as auth: when Supabase is configured, orders use it. |
| **Admin panel** | Always works | — | Shows “Not configured” when a service is missing; never crashes. |

- **Combined mode**: Use Sanity for content, Supabase for auth/orders, and local only as fallback when a service is unavailable.
- **Build**: Never fails due to missing env vars; missing Sanity/Supabase is handled at runtime with fallbacks.

---

## 2. Sanity Setup (Products, Categories, Home, Blog)

### 2.1 Create project and dataset

1. Go to [sanity.io/manage](https://www.sanity.io/manage).
2. Create a project (or use an existing one). Note the **Project ID**.
3. Create or use a dataset (e.g. `production`).

### 2.2 Env vars

In `.env.local` (and in Vercel):

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
NEXT_PUBLIC_SANITY_DATASET=production
```

Optional:

- `NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01`
- `SANITY_API_READ_TOKEN` – for draft/preview (server-only).
- `SANITY_REVALIDATE_SECRET` – for webhook revalidation (see below).

### 2.3 Studio route and config path

- Studio is **client-only** (no server-side Sanity UI) to avoid styled-components/ESM build issues.
- Routes: `/studio` and `/admin/studio`.
- Config is loaded from `sanity/sanity.config.ts` (alias `@/sanity/sanity.config`). Do not move the config to the repo root.

### 2.4 CORS (if Studio is on a different origin)

In [sanity.io/manage](https://www.sanity.io/manage) → Project → API → CORS origins, add:

- `http://localhost:3000` (dev)
- Your production URL (e.g. `https://your-site.vercel.app`).

### 2.5 Webhook (optional, for on-demand revalidation)

1. In Sanity project settings, create a webhook that calls:  
   `https://your-domain.com/api/revalidate?secret=YOUR_SANITY_REVALIDATE_SECRET`
2. Set `SANITY_REVALIDATE_SECRET` in env to the same value.

---

## 3. Supabase Setup (Auth, Orders, Storage)

### 3.1 Create project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard).
2. New project → choose org, region, password for DB.

### 3.2 URL and keys

Project Settings → API:

- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3.3 Auth providers

Authentication → Providers:

- Enable Email (and optionally Google, Facebook, Phone OTP).
- For OAuth: add redirect URL `https://your-domain.com/auth/callback` (and `http://localhost:3000/auth/callback` for dev).

### 3.4 Tables (schema notes)

The app expects (or will use) tables such as:

- **Orders** – e.g. `id`, `customer_id`, `email`, `total`, `status`, `created_at`, `items` (JSON or relation), `shipping_address`, `payment_method`.
- **Profiles / users** – often via Supabase Auth `auth.users` and a `public.profiles` table if needed.
- **Site settings** – for checkout delivery, vouchers, etc. (see existing `/api/checkout/settings` and voucher API).

Use Supabase migrations for schema; the exact schema depends on your existing docs (e.g. `supabase/migrations/`).

### 3.5 RLS (Row Level Security)

- Enable RLS on all public tables.
- Policies: users see only their own orders; admin role (or service role) can see all orders.
- Anon key is used by the Next.js app; restrict access via RLS.

### 3.6 Storage (optional)

If you use Supabase Storage for uploads, create buckets and set policies so that authenticated users (or admin) can upload as required.

---

## 4. Vercel Env Vars (Production / Preview / Dev)

In Vercel → Project → Settings → Environment Variables, set:

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SITE_URL` | Yes (prod) | e.g. `https://your-domain.com` |
| `NEXT_PUBLIC_PRODUCTS_SOURCE` | No | `sanity` \| `local` \| `auto` (default `auto`) |
| `NEXT_PUBLIC_AUTH_SOURCE` | No | `supabase` \| `demo` \| `auto` (default `auto`) |
| `NEXT_PUBLIC_ENABLE_FALLBACKS` | No | `true` \| `false` (default `true`) |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | If using Sanity | Sanity project ID |
| `NEXT_PUBLIC_SANITY_DATASET` | No | e.g. `production` |
| `NEXT_PUBLIC_SUPABASE_URL` | If using Supabase | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | If using Supabase | Supabase anon key |

**Backward compatibility:**

- If `NEXT_PUBLIC_DATA_SOURCE` is set, it maps to products source (`sanity` / `local`; `supabase` → `local` for products).
- If `NEXT_PUBLIC_AUTH_MODE` is set, it maps to auth source (`supabase` / `demo`).

Apply to **Production**, **Preview**, and **Development** as needed.

---

## 5. Local `.env.local` Setup

1. Copy `.env.local.example` to `.env.local`.
2. At minimum:

```env
# Products: sanity | local | auto
NEXT_PUBLIC_PRODUCTS_SOURCE=local

# Auth: supabase | demo | auto
NEXT_PUBLIC_AUTH_SOURCE=demo

# Fallbacks when source is "auto" (try Sanity/Supabase first, then local/demo)
NEXT_PUBLIC_ENABLE_FALLBACKS=true

# Required in production
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

3. For Sanity (optional locally):

```env
NEXT_PUBLIC_PRODUCTS_SOURCE=auto
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
NEXT_PUBLIC_SANITY_DATASET=production
```

4. For Supabase (optional locally):

```env
NEXT_PUBLIC_AUTH_SOURCE=auto
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## 6. Troubleshooting

### Build fails: styled-components / ESM / CJS (Sanity Studio)

- **Cause**: Sanity Studio (or `@sanity/ui`) is imported on the server during build.
- **Fix**: Studio is loaded only on the client. Ensure:
  - `/studio/[[...tool]]/page.tsx` and `/admin/studio/[[...tool]]/page.tsx` use `next/dynamic` with `ssr: false` to load the Studio component.
  - Sanity config is imported from `@/sanity/sanity.config` (from `sanity/sanity.config.ts`), not from the repo root.

### Build fails: missing env vars

- **Cause**: Code may throw when env is missing.
- **Fix**: The app is designed so that **build does not require** Sanity or Supabase env. Use the safe getters in `src/config/env.ts` (e.g. `isSanityConfigured()`, `isSupabaseConfigured()`) and never throw at module load. If a specific route still fails, guard that route with the same checks.

### Runtime: “Not configured” or wrong source

- Check **Admin → Data & Status** (`/admin/status`): it shows Sanity configured?, Supabase configured?, and resolved sources (products, auth, orders).
- Verify env vars are set in the environment that actually runs the app (e.g. Vercel env for deployed app).
- With `auto` + fallbacks, if Sanity (or Supabase) is not configured, the app falls back to local/demo.

### Node version

- Use Node 18+ (recommended 20.x). Set in Vercel or `.nvmrc`: `20`.

---

## 7. Validation Checklist

After setup, verify:

| Step | What to do |
|------|------------|
| 1 | Open `/admin/status` and confirm Sanity / Supabase / resolved sources match your env. |
| 2 | Open `/studio` or `/admin/studio` – Studio loads without build errors; edit content if Sanity is configured. |
| 3 | Homepage loads; products come from Sanity (if configured) or local. |
| 4 | Login: with Supabase configured, use real auth; with demo, use demo credentials (see .env.example). |
| 5 | Admin dashboard loads even when Sanity/Supabase are not configured (no crash). |
| 6 | Run `npm run build` – must pass without requiring any env vars. |

---

## Next steps for you (human)

1. **Set env in Vercel**  
   Add the variables from section 4 for Production (and Preview if needed).

2. **Optional: create order API**  
   For Supabase-backed order creation, add `app/api/checkout/order/route.ts` that inserts into your `orders` table and returns `{ orderId }`. Until then, checkout may still “succeed” locally with a stub/demo order id.

3. **Open dashboards**  
   - Sanity: [sanity.io/manage](https://www.sanity.io/manage)  
   - Supabase: [supabase.com/dashboard](https://supabase.com/dashboard)  
   - Admin status: `https://your-domain.com/admin/status`

4. **Local test**  
   - `npm run build`  
   - `npm run start` (or `npm run dev`)  
   - Visit `http://localhost:3000/admin/status` and confirm resolved sources.
