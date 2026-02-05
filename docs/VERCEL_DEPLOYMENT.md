# Deploy City Plus Pet Shop to Vercel (100% Working)

Follow these steps to go live on Vercel and keep the site fully working.

---

## 1. Prerequisites

- **Git**: Project in a Git repo (GitHub, GitLab, or Bitbucket).
- **Vercel account**: [vercel.com](https://vercel.com) → Sign up or log in.
- **Node memory**: Build uses ~4GB RAM. Vercel provides enough by default; if you hit OOM locally, use `NEXT_PUBLIC_SITE_URL` and deploy from Vercel instead.

---

## 2. Push Your Code to Git

If the project is not in a repo yet:

```bash
cd "f:\client website\City plus pet shop"
git init
git add .
git commit -m "Initial commit - City Plus Pet Shop"
```

Create a repo on GitHub (or GitLab/Bitbucket), then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

---

## 3. Import Project on Vercel

1. Go to [vercel.com/new](https://vercel.com/new).
2. **Import** your Git repository (GitHub/GitLab/Bitbucket).
3. Vercel will detect **Next.js** and set:
   - **Build Command:** `next build` (or leave default).
   - **Output Directory:** (leave default).
   - **Install Command:** `npm install` (default).
4. Do **not** click Deploy yet — add Environment Variables first.

---

## 4. Environment Variables (Required for Full Site)

In the Vercel project: **Settings → Environment Variables**. Add these for **Production** (and optionally Preview):

| Variable | Required | Example / Notes |
|----------|----------|------------------|
| `NEXT_PUBLIC_SITE_URL` | **Yes** | `https://your-app.vercel.app` or your custom domain (e.g. `https://citypluspetshop.com`) |
| `NEXT_PUBLIC_DATA_SOURCE` | **Yes** | `local` (demo data, no DB) or `supabase` (real products/orders) |
| `NEXT_PUBLIC_AUTH_MODE` | **Yes** | `demo` (demo login) or `supabase` (real auth) |
| `NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS` | No | `false` in production (set `true` only for staging if you want to show demo login hint) |

### If using Supabase (real data + auth)

| Variable | Required | Where to get it |
|----------|----------|------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes (when DATA_SOURCE=supabase) | Supabase Dashboard → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes (when DATA_SOURCE=supabase) | Same page → anon public key |

### If using Sanity (CMS for products)

| Variable | Required | Where to get it |
|----------|----------|------------------|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Yes (when DATA_SOURCE=sanity) | Sanity dashboard → Project ID |
| `NEXT_PUBLIC_SANITY_DATASET` | No | Usually `production` |

### Optional (recommended for production)

| Variable | Purpose |
|----------|--------|
| `NEXT_PUBLIC_GTM_ID` | Google Tag Manager (e.g. `GTM-XXXX`) |
| `NEXT_PUBLIC_ENABLE_GTM` | `true` to load GTM |
| `RESEND_API_KEY` | Email (invoices, order confirmation) via Resend |
| `NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN` | Cloudflare Web Analytics |
| `NEXT_PUBLIC_SOCIAL_FACEBOOK` | Footer social link |
| `NEXT_PUBLIC_SOCIAL_INSTAGRAM` | Footer social link |
| `NEXT_PUBLIC_SOCIAL_YOUTUBE` | Footer social link |

**Important:** After adding or changing env vars, trigger a **new deployment** (Redeploy from Deployments tab).

---

## 5. Deploy

1. Save all Environment Variables.
2. Click **Deploy** (or push a new commit to trigger a deploy).
3. Wait for the build. If it fails with **out of memory**, Vercel’s build environment is usually sufficient; if not, in **Settings → General** you can try increasing Node version or contact Vercel support.
4. When the build succeeds, your site is live at `https://your-project.vercel.app`.

---

## 6. After First Deploy – Checklist for “100% Working”

- **Homepage:** Hero, categories, brands, products, reviews load.
- **Shop:** Products list, filters, search work.
- **Product page:** Detail, gallery, add to cart, buy now.
- **Cart & Checkout:** Cart slide-over, checkout form, voucher (if Supabase), order placement.
- **Auth:** Login/Register (demo or Supabase). Set **Redirect URL** in Supabase Auth to `https://your-domain.com/auth/callback`.
- **Account:** Orders, profile (when logged in).
- **Blog:** Blog list and post pages (from local or CMS).
- **Contact:** Contact form and map/info.
- **Admin:** `/admin` – only for logged-in admin; when using Supabase, create an admin user in Supabase Auth and link to your `team_members` table.

### Supabase Auth redirect (when AUTH_MODE=supabase)

In **Supabase Dashboard → Authentication → URL Configuration** add:

- **Site URL:** `https://your-domain.com` (or your Vercel URL).
- **Redirect URLs:** `https://your-domain.com/auth/callback`, `https://your-project.vercel.app/auth/callback`.

### Custom domain

1. Vercel project → **Settings → Domains**.
2. Add your domain (e.g. `citypluspetshop.com`).
3. Update DNS as Vercel instructs (A/CNAME).
4. Set `NEXT_PUBLIC_SITE_URL` to `https://citypluspetshop.com` and redeploy.

---

## 7. Build / Runtime Notes

- **Build command:** `npm run build` (Next.js default). No need to set `NODE_OPTIONS` on Vercel unless you hit OOM (then you can add `NODE_OPTIONS=--max-old-space-size=4096` in Vercel env).
- **Images:** Local images live in `/public` (brand, brands, categories, products, ui). Supabase Storage image host is added automatically when `NEXT_PUBLIC_SUPABASE_URL` is set.
- **Serverless:** API routes and server components run on Vercel’s serverless; keep cold starts in mind for rarely used APIs.

---

## 8. Quick Reference: “Local only” vs “Full production”

| Goal | DATA_SOURCE | AUTH_MODE | What you need |
|------|--------------|-----------|----------------|
| Demo site (no DB) | `local` | `demo` | Only `NEXT_PUBLIC_SITE_URL` (+ optional GTM/social) |
| Full site (DB + auth) | `supabase` | `supabase` | Supabase URL + anon key, redirect URLs, and (optional) Resend, GTM, etc. |

Once the above is set, your site is ready to run at 100% on Vercel.

---

## What You Can Ask For Next (Post-Launch)

After the site is live, you can request:

- **SEO:** Meta tags per page, Open Graph, Twitter cards, sitemap/robots tuning, JSON-LD for more entity types.
- **Performance:** Core Web Vitals (LCP, CLS, INP), image optimization audit, code-splitting, caching headers.
- **Features:** New pages (e.g. FAQ, size guide), filters (price, brand), wishlist persistence, “Notify when back in stock”, multi-language (e.g. Bangla/English).
- **Integrations:** Payment (SSLCommerz/Bkash/Nagad), SMS (order updates), WhatsApp, live chat.
- **Admin:** Bulk product import/export, order status workflows, reports, dashboard widgets.
- **Content:** More category/brand descriptions, structured content for blog, legal pages (Terms, Refund, Privacy) from your copy.
- **Testing & QA:** Test scripts for checkout, auth, and critical flows; accessibility (a11y) checks.
- **Security & reliability:** Env var review, rate limiting, error boundaries, monitoring.

Ask in natural language (e.g. “Add Bkash payment” or “Improve Lighthouse score”) and the implementation can be scoped step by step.
