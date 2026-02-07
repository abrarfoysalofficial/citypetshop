# Step-by-step guide – City Plus Pet Shop

**Just want to finish Supabase auth + orders?** → Use **COMPLETE_SETUP.md** (short checklist, do in order).

Use this guide for the full picture: run locally, deploy to Vercel, optional Sanity. Do the steps in order.

---

## 1. Three-source architecture (overview)

| Source   | Role                          | When used                    | Fallback      |
|----------|-------------------------------|------------------------------|---------------|
| **Sanity**   | Products, categories, home, blog | When `NEXT_PUBLIC_PRODUCTS_SOURCE=sanity` or `auto` and Sanity env set | Local demo data |
| **Supabase** | Auth, orders persistence      | When `NEXT_PUBLIC_AUTH_SOURCE=supabase` or `auto` and Supabase env set | Demo auth / local orders |
| **Local**    | Demo data, offline preview    | When sources not configured or fallbacks enabled | — |

- **Products:** Sanity if configured, else Local.  
- **Auth:** Supabase if configured, else Demo (cookie).  
- **Orders:** Supabase if configured (POST `/api/checkout/order` returns 200), else local fallback (API returns 501).  
- Build **never** fails due to missing env; runtime shows “Not configured” and uses fallbacks.

---

## 2. Node version

Use **Node 20.19+** (LTS). The repo includes `.nvmrc` with `20.19.0`.

- With nvm: `nvm use` (or `nvm install` then `nvm use`).  
- On Vercel: **Settings → General → Node.js Version** → **20.x**.

---

## 3. Local setup

### 3.1 Install Node (if needed)

1. Install from [nodejs.org](https://nodejs.org) (LTS 20.x).  
2. Restart the terminal, then run:  
   `node -v` and `npm -v` (expect version numbers).

### 3.2 Clone / open project

```powershell
cd "F:\client website\City plus pet shop"
```

(Use your actual path.)

### 3.3 Install dependencies

```powershell
npm install
```

### 3.4 Environment file

1. Copy `.env.local.example` to `.env.local`.  
2. Set at least:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_PRODUCTS_SOURCE=local
NEXT_PUBLIC_AUTH_SOURCE=demo
NEXT_PUBLIC_ENABLE_FALLBACKS=true
NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS=true
```

Legacy vars `NEXT_PUBLIC_DATA_SOURCE` and `NEXT_PUBLIC_AUTH_MODE` are still supported.

### 3.5 Run dev server

```powershell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Admin (demo): `/admin` (e.g. admin@cityplus.local / Admin@12345). Studio: `/studio` (needs Sanity env to be useful).

### 3.6 Build (must pass without env)

```powershell
npm run build
```

Must finish with “Compiled successfully”. No env vars are required for build.

---

## 4. Production / Vercel env

Use **.env.production.example** as reference. In Vercel: **Settings → Environment Variables**.

| Variable | Required | Example / notes |
|----------|----------|------------------|
| `NEXT_PUBLIC_SITE_URL` | Yes (prod) | `https://your-domain.com` |
| `NEXT_PUBLIC_PRODUCTS_SOURCE` | No | `local` \| `sanity` \| `auto` |
| `NEXT_PUBLIC_AUTH_SOURCE` | No | `demo` \| `supabase` \| `auto` |
| `NEXT_PUBLIC_ENABLE_FALLBACKS` | No | `true` (default) |
| `NEXT_PUBLIC_SUPABASE_URL` | For Supabase | Project URL from Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | For Supabase | anon key (not service role) |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | For Sanity | Sanity project ID |
| `NEXT_PUBLIC_SANITY_DATASET` | No | `production` |
| `SANITY_REVALIDATE_SECRET` | For webhook | Server-only; protect `/api/revalidate` |

Never put secrets in `NEXT_PUBLIC_*`.

---

## 5. Supabase (auth + orders)

### 5.1 Create project

1. [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**.  
2. Name, database password, region → Create.  
3. **Project Settings → API**: copy **Project URL** and **anon public** key.

### 5.2 Auth (redirect URLs)

**Authentication → URL Configuration:**

- Site URL: your app URL (e.g. `https://your-app.vercel.app`).  
- Redirect URLs: add `https://your-app.vercel.app/auth/callback`, `http://localhost:3000/auth/callback`.

### 5.3 Migrations and RLS

Run migrations in order in **SQL Editor** (or use Supabase CLI).

**Option A – SQL Editor (no CLI auth):**  
In Supabase dashboard → **SQL Editor**, run each file in order: `001_initial_schema.sql` through `010_orders_metadata_variant.sql`.

**Option B – Supabase CLI:**  
From project root, log in first, then link and push:

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

If you see **"Access token not provided"**, run `npx supabase login` (opens browser to authenticate) or set the `SUPABASE_ACCESS_TOKEN` environment variable with a token from [Supabase Account → Access Tokens](https://supabase.com/dashboard/account/tokens).

**001** creates `orders`, `order_items`, `team_members`, etc. **009** adds RLS: users see own orders; admins (in `team_members` with `role = 'admin'`) see all.

### 5.4 Admin user (see all orders)

1. In Supabase go to **Authentication** → **Users**. Create a user (e.g. Sign up with email) or use an existing one.  
2. Click that user and copy their **User UID** (a UUID like `a1b2c3d4-e5f6-7890-abcd-ef1234567890`). **Do not** leave the literal text `USER_UUID` in the query.  
3. In **SQL Editor**, run the query below with **your actual UUID** in place of `YOUR_ACTUAL_UUID_HERE`:

```sql
INSERT INTO team_members (user_id, email, role, full_name, is_active)
VALUES ('YOUR_ACTUAL_UUID_HERE', 'admin@citypetshopbd.com', 'admin', 'Admin', true)
ON CONFLICT (user_id) DO UPDATE SET role = 'admin', is_active = true;
```

Example: if the User UID is `f47ac10b-58cc-4372-a567-0e02b2c3d479`, use `'f47ac10b-58cc-4372-a567-0e02b2c3d479'` (with quotes) as the first value.

### 5.5 Env for Supabase

In `.env.local` and Vercel:

```env
NEXT_PUBLIC_AUTH_SOURCE=supabase
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## 6. Sanity (products / content)

### 6.1 Project and dataset

1. [sanity.io/manage](https://www.sanity.io/manage) → create project; note **Project ID**.  
2. Create or use dataset (e.g. `production`).

### 6.2 Env

```env
NEXT_PUBLIC_PRODUCTS_SOURCE=sanity
# or auto
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
NEXT_PUBLIC_SANITY_DATASET=production
```

### 6.3 CORS

In Sanity project → **API → CORS**: add `http://localhost:3000` and your production URL.

### 6.4 Studio routes

- `/studio` and `/admin/studio` load Sanity Studio **client-only** (`next/dynamic` with `ssr: false`).  
- Config path: `sanity/sanity.config.ts` (alias `@/sanity/sanity.config`). Do not import Studio on the server during build.

### 6.5 Webhook revalidate (optional)

1. Sanity project → **API → Webhooks** → add URL:  
   `https://your-domain.com/api/revalidate?secret=YOUR_SECRET`  
2. Set `SANITY_REVALIDATE_SECRET` in Vercel (server-only).  
3. **Protection:** In production, if `SANITY_REVALIDATE_SECRET` is not set, `/api/revalidate` returns 401. When set, the `secret` query param must match.

---

## 7. Troubleshooting

- **Build fails (styled-components / Sanity Studio)**  
  Studio must not be imported on the server. Ensure `/studio` and `/admin/studio` use `next/dynamic` with `ssr: false` and config from `@/sanity/sanity.config`.

- **Missing env / “Not configured”**  
  Add the required vars to `.env.local` or Vercel. Build does not require any env; only runtime behaviour changes.

- **RLS errors (Supabase)**  
  Run migrations 001 and 009 (and 010). Ensure admin user is in `team_members` with `role = 'admin'`. Users see only rows where `user_id = auth.uid()`; admins see all via `is_team_admin()`.

- **Checkout order fails (501)**  
  API returns 501 when Supabase is not configured. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `NEXT_PUBLIC_AUTH_SOURCE=supabase` (or `auto`) for real order persistence. App still completes checkout with local fallback when 501/503.

- **Node version**  
  Use Node **20.17+** (project uses **20.19** in `.nvmrc`). If you see `npm WARN EBADENGINE` or odd CLI behaviour, upgrade: with nvm run `nvm install 20.19 && nvm use 20.19`, or install the latest Node 20 LTS from [nodejs.org](https://nodejs.org). On Vercel set Node to **20.x**.

- **"Access token not provided" (Supabase CLI)**  
  Run `npx supabase login` and complete the browser login, then run `npx supabase db push` again. Or set `SUPABASE_ACCESS_TOKEN` (from [Supabase → Account → Access Tokens](https://supabase.com/dashboard/account/tokens)) in your environment.

---

## 8. Verification checklist

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open **Admin → Data & Status** (`/admin/status`) | Raw sources, configured flags, resolved sources; “Supabase orders persistence: Ready” when Supabase configured and orders = supabase. |
| 2 | Run `npm run build` | Success; no env required. |
| 3 | Run `npm run dev`, open `/studio` | Studio loads (client-only); no server build error. |
| 4 | Login (demo or Supabase) | Redirect and session as configured. |
| 5 | Checkout: place order | With Supabase: 200 and order in DB; without: 501 and local success. |
| 6 | Admin → Orders (Supabase + admin user) | Orders list shows stored orders. |

---

## 9. Deploy checklist

- [ ] Node 20.x in Vercel project settings  
- [ ] Env vars set in Vercel (see §4 and `.env.production.example`)  
- [ ] `NEXT_PUBLIC_SITE_URL` = production URL  
- [ ] Supabase migrations run (001 through 010); admin in `team_members`  
- [ ] Sanity CORS includes production URL  
- [ ] If using webhook: `SANITY_REVALIDATE_SECRET` set and passed in revalidate URL  
- [ ] `npm run build` passes locally  
- [ ] Deploy and open `/admin/status` to confirm resolved sources

---

## 10. Commands summary

```powershell
npm install
npm run build
npm run dev
```

Supabase (optional, from project root):

```bash
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```
