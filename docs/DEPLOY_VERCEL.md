# Deploy to Vercel

Steps to deploy City Plus Pet Shop to Vercel and keep builds passing.

---

## 1. Prerequisites

- Git repo (GitHub/GitLab/Bitbucket) with the project.
- Vercel account.
- **Node 20** locally (use `.nvmrc`: run `nvm use` or set Node to **20.11.1**). Project requires `node >=18 <21`; Node 24 is unsupported.

---

## 2. Import project on Vercel

1. Go to [vercel.com/new](https://vercel.com/new).
2. Import your Git repository.
3. Framework: **Next.js** (auto-detected).
4. **Do not deploy yet** — set **Node.js Version** and Environment Variables first (see below and [PROD_ENV_SETUP.md](./PROD_ENV_SETUP.md)).

---

## 3. Vercel project settings

| Setting | Value | Notes |
|--------|--------|--------|
| **Node.js Version** | **20.x** | **Required.** In Vercel: **Settings → General → Node.js Version** → choose **20.x**. Ensures build uses Node 20 (matches `.nvmrc` 20.11.1 and `package.json` engines). |
| **Build Command** | `npm run build` | Default. |
| **Output Directory** | (default) | — |
| **Install Command** | `npm install` or `npm ci` | Use `npm ci` if `package-lock.json` is committed (recommended for reproducibility). Default; `.npmrc` has `legacy-peer-deps=true` for next-sanity/sanity peer deps. |

---

## 4. Environment variables

In **Settings → Environment Variables**, add at least:

- **NEXT_PUBLIC_SITE_URL** = your production URL (e.g. `https://citypluspetshop.com`).
- **NEXT_PUBLIC_DATA_SOURCE** = `sanity` (or `supabase` / `local` as needed).
- **NEXT_PUBLIC_AUTH_MODE** = `supabase` for production auth.
- **NEXT_PUBLIC_SUPABASE_URL** and **NEXT_PUBLIC_SUPABASE_ANON_KEY** if using Supabase.
- **NEXT_PUBLIC_SANITY_PROJECT_ID** and **NEXT_PUBLIC_SANITY_DATASET** if using Sanity.

Full list: [PROD_ENV_SETUP.md](./PROD_ENV_SETUP.md).

**Required for production (minimum):**

| Variable | Production value |
|----------|------------------|
| `NEXT_PUBLIC_SITE_URL` | Your production URL (e.g. `https://citypluspetshop.com`) |
| `NEXT_PUBLIC_DATA_SOURCE` | `sanity` or `supabase` |
| `NEXT_PUBLIC_AUTH_MODE` | `supabase` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sanity project ID |
| `NEXT_PUBLIC_SANITY_DATASET` | e.g. `production` |

Do **not** set `NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS=true` in production.

---

## 5. Domain connect order (recommended)

1. Deploy once with Vercel default URL (e.g. `*.vercel.app`) and confirm build + env work.
2. Add custom domain in Vercel: **Settings → Domains** → Add (e.g. `citypluspetshop.com`).
3. In your DNS provider: add the CNAME/A records Vercel shows.
4. Set **NEXT_PUBLIC_SITE_URL** to your final production URL (e.g. `https://citypluspetshop.com`) and redeploy so sitemap, canonical, and OAuth callbacks use the correct origin.

---

## 6. Sanity setup (for content / blog)

1. Create a project at [sanity.io](https://sanity.io) and note **Project ID** and **Dataset** (e.g. `production`).
2. In Vercel env: set `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`; optionally `NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01`.
3. (Optional) Create an API token with read access; set `SANITY_API_READ_TOKEN` in Vercel (server-only; not `NEXT_PUBLIC_`).
4. (Optional) For on-publish revalidation: set `SANITY_REVALIDATE_SECRET` and configure Sanity webhook to call `https://your-site.com/api/revalidate` with that secret.
5. Embedded Studio is at **/studio** and **/admin/studio**; no server secrets in `NEXT_PUBLIC_*`.

---

## 7. Supabase setup (for auth, orders, tracking, realtime)

1. Create a project at [supabase.com](https://supabase.com); get **Project URL** and **anon public** key.
2. In Vercel env: set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Run migrations: from repo run `supabase link` then `supabase db push`, or apply SQL in **Supabase → SQL Editor** from `supabase/migrations/` (see [SUPABASE_MIGRATIONS.md](./SUPABASE_MIGRATIONS.md)).
4. In Supabase Auth: enable providers (Google, Facebook, Phone) as needed; set redirect URLs to `https://your-site.com/auth/callback`.
5. Site uses Supabase for: auth, orders, checkout, admin, order notes, tracking timeline (Realtime when configured); local/demo mode works without Supabase.

---

## 8. Deploy

1. Click **Deploy** (or push to the connected branch).
2. If a previous deploy used an old commit or cache: **Deployments** → … on latest → **Redeploy** → enable **Redeploy without using the build cache**.

---

## 9. After deploy

- **Storefront:** `https://your-app.vercel.app`
- **Admin:** `https://your-app.vercel.app/admin`
- **Sanity Studio:** `https://your-app.vercel.app/studio` or `https://your-app.vercel.app/admin/studio`

For dependency/build troubleshooting, see [VERCEL_DEPLOY_FIX.md](./VERCEL_DEPLOY_FIX.md).

---

## If local dev shows PostCSS or webpack cache errors

1. Delete the `.next` folder (e.g. `Remove-Item -Recurse -Force .next` in PowerShell, or run `npm run dev:clean` which clears it and starts dev).
2. Use Node 20: `node -v` (e.g. 20.11.1; not Node 24). Run `nvm use` if using .nvmrc.
3. Reinstall: `npm install` then `npm run dev`.
