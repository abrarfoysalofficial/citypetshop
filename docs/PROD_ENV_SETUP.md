# Production environment setup

All environment variables for City Plus Pet Shop. Set these in **Vercel → Settings → Environment Variables** (and in `.env.local` for local with real backends).

---

## Required for production


| Variable                    | Required | Example / Notes                                                                                                 |
| --------------------------- | -------- | --------------------------------------------------------------------------------------------------------------- |
| **NEXT_PUBLIC_SITE_URL**    | Yes      | `https://citypluspetshop.com` or your custom domain. Used for sitemap, canonical, OG, callbacks.                |
| **NEXT_PUBLIC_DATA_SOURCE** | Yes      | `sanity` (prod: Sanity for products/categories/home) or `supabase` (DB for orders) or `local` (demo data only). |
| **NEXT_PUBLIC_AUTH_MODE**   | Yes      | `supabase` (prod) or `demo` (localhost/demo only). Production should use `supabase`.                            |


---

## Supabase (required when using Supabase for auth/orders)


| Variable                          | Required                                   | Notes                                |
| --------------------------------- | ------------------------------------------ | ------------------------------------ |
| **NEXT_PUBLIC_SUPABASE_URL**      | When AUTH_MODE or DATA_SOURCE use Supabase | Project URL from Supabase dashboard. |
| **NEXT_PUBLIC_SUPABASE_ANON_KEY** | When using Supabase                        | Anon/public key from Supabase.       |


Used for: Auth (login/register, Google/Facebook/Phone OTP), Orders, Checkout, Admin (orders, customers, settings), Realtime (order notes, tracking timeline).

---

## Sanity (required when NEXT_PUBLIC_DATA_SOURCE=sanity)


| Variable                           | Required       | Notes                                              |
| ---------------------------------- | -------------- | -------------------------------------------------- |
| **NEXT_PUBLIC_SANITY_PROJECT_ID**  | Yes for Sanity | From sanity.io project.                            |
| **NEXT_PUBLIC_SANITY_DATASET**     | Yes            | Usually `production`.                              |
| **NEXT_PUBLIC_SANITY_API_VERSION** | No             | Default `2024-01-01`.                              |
| **SANITY_API_READ_TOKEN**          | No             | For draft/preview (server-only).                   |
| **SANITY_REVALIDATE_SECRET**       | Recommended    | Webhook secret for `/api/revalidate` (on publish). |


---

## Auth providers (when NEXT_PUBLIC_AUTH_MODE=supabase)


| Variable                      | Required | Notes                             |
| ----------------------------- | -------- | --------------------------------- |
| **NEXT_PUBLIC_AUTH_GOOGLE**   | No       | `true` to show Google sign-in.    |
| **NEXT_PUBLIC_AUTH_FACEBOOK** | No       | `true` to show Facebook sign-in.  |
| **NEXT_PUBLIC_AUTH_PHONE**    | No       | `true` to show Phone OTP sign-in. |


Enable the same providers in Supabase Auth settings.

---

## Demo / local only


| Variable                              | Required | Notes                                                                                                 |
| ------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------- |
| **NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS** | No       | Set to `true` only in staging/demo to show demo login hint. **Leave unset or `false` in production.** |


---

## Optional


| Variable                                                                         | Notes                                 |
| -------------------------------------------------------------------------------- | ------------------------------------- |
| **NEXT_PUBLIC_GTM_ID** / **NEXT_PUBLIC_ENABLE_GTM**                              | Google Tag Manager.                   |
| **NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN** / **NEXT_PUBLIC_ENABLE_CF_ANALYTICS** | Cloudflare Web Analytics.             |
| **NEXT_PUBLIC_SOCIAL_FACEBOOK**, **INSTAGRAM**, **YOUTUBE**                      | Footer/header social links.           |
| **RESEND_API_KEY**                                                               | Email (invoices, order confirmation). |
| **FACEBOOK_CAPI_TOKEN** / **NEXT_PUBLIC_FB_PIXEL_ID**                            | Meta CAPI (can also be set in Admin). |


---

## Safe fallbacks

- If an env var is missing at **build time**, the app uses placeholders where needed (e.g. Sanity `projectId`/`dataset`) so the build does not crash.
- At **runtime**, missing Supabase/Sanity vars result in stub/empty data or “not configured” behavior; no crash. Logs can warn when running in production with missing required vars.

---

## Production checklist

- `NEXT_PUBLIC_DATA_SOURCE` = `sanity` (or `supabase` if you use Supabase for products too).
- `NEXT_PUBLIC_AUTH_MODE` = `supabase`.
- `NEXT_PUBLIC_SITE_URL` = your production URL.
- `NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS` unset or `false`.
- Supabase and Sanity vars set as per tables above.

