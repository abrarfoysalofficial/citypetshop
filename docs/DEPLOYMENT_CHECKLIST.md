# Deployment Checklist – Vercel + External Domain (City Plus Pet Shop)

## Pre-deploy

- `npm run lint` (or configure ESLint and re-run).
- `npm run typecheck` passes.
- `npm run build` succeeds.
- Env secrets set in Vercel (see below); no hardcoded keys in repo.
- Supabase: run migrations (`007_courier_bookings_dashboard_layout.sql`, `008_track_otp_verification.sql`) in project SQL editor or CLI.

## Vercel project

- Create/link Vercel project (Next.js, App Router).
- Root directory: project root (where `package.json` and `app/` live).
- Build command: `npm run build` (default).
- Output: Next.js default (no override unless needed).
- Node version: 18.x or 20.x (in `package.json` engines or Vercel setting).

## Environment variables (Vercel)

Set in Project → Settings → Environment Variables. Use **Production** (and Preview if desired).


| Variable                            | Required          | Notes                                                                            |
| ----------------------------------- | ----------------- | -------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_DATA_SOURCE`           | Yes               | `supabase` for production.                                                       |
| `NEXT_PUBLIC_AUTH_MODE`             | Yes               | `supabase` for production.                                                       |
| `NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS` | No                | Omit or `false` in production.                                                   |
| `NEXT_PUBLIC_SUPABASE_URL`          | Yes (if Supabase) | Supabase project URL.                                                            |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`     | Yes (if Supabase) | Supabase anon key.                                                               |
| `NEXT_PUBLIC_SITE_URL`              | Recommended       | Full site URL (e.g. [https://citypluspetshop.com](https://citypluspetshop.com)). |
| `FACEBOOK_CAPI_TOKEN`               | Optional          | Server-only; Meta CAPI.                                                          |
| `TRACK_OTP_COOKIE_SECRET`           | Optional          | If using signed cookie for OTP; otherwise token in DB.                           |
| Courier / Resend / Sanity           | As needed         | Per feature docs.                                                                |


Do **not** commit `.env` or `.env.local`; use Vercel (and optional `.env.example` only).

## External domain (DNS)

- In Vercel: Project → Settings → Domains → Add domain (e.g. `citypluspetshop.com` and `www.citypluspetshop.com`).
- At DNS provider (e.g. Namecheap, Cloudflare, GoDaddy):
  - **A record**: `@` or `www` → Vercel’s target (e.g. `76.76.21.21`); or
  - **CNAME**: `www` → `cname.vercel-dns.com` (per Vercel instructions).
- Vercel may show “CNAME” or “A” instructions for your domain; follow those.
- Wait for DNS propagation (up to 48 h; often &lt; 1 h).
- In Vercel, confirm domain is “Valid” and SSL issued.

## Post-deploy

- Open production URL → homepage, shop, one product, cart, checkout (no console errors).
- Admin login (Supabase auth); Orders, Courier, Analytics, Dashboard drag-and-drop.
- Track-order: by Order ID and by phone (OTP flow if enabled).
- Run [QA Test Script](./QA_TEST_SCRIPT.md) against production URL.

## Rollback

- Vercel: Deployments → select previous deployment → “Promote to Production”.
- If DB migrations were run, plan backward migration or keep DB compatible with previous deploy.

## References

- [Vercel – Add a domain](https://vercel.com/docs/concepts/projects/domains)
- [Next.js – Environment variables](https://nextjs.org/docs/basic-features/environment-variables)
- Project: `docs/MISSING_ITEMS_CHECKLIST.md`, `docs/QA_TEST_SCRIPT.md`

