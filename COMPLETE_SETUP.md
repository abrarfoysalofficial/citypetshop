# Complete setup – Supabase auth + orders (minimal checklist)

Do **each step once, in order**. When all boxes are checked, auth and orders are done.

---

## Step 1: Project runs locally (no Supabase yet)

- [ ] In project folder run: `npm install`
- [ ] Copy `.env.local.example` to `.env.local`
- [ ] In `.env.local` set at least:
  ```env
  NEXT_PUBLIC_SITE_URL=http://localhost:3000
  NEXT_PUBLIC_PRODUCTS_SOURCE=local
  NEXT_PUBLIC_AUTH_SOURCE=demo
  ```
- [ ] Run `npm run build` → must succeed
- [ ] Run `npm run dev` → open http://localhost:3000 → site loads

---

## Step 2: Supabase project

- [ ] Go to [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**
- [ ] Set name (e.g. city_plus_pet_shop), password, region → **Create**
- [ ] Open **Project Settings** (gear) → **API**
- [ ] Copy **Project URL** (e.g. `https://xxxxx.supabase.co`)
- [ ] Copy **anon public** key (long string under "Project API keys")

---

## Step 3: Run migrations in Supabase

- [ ] In Supabase dashboard open **SQL Editor**
- [ ] Run each migration **in order** (New query → paste file contents → Run):
  1. `supabase/migrations/001_initial_schema.sql`
  2. `002_order_status_voucher_redemptions_delivery.sql`
  3. `003_homepage_blocks.sql`
  4. `004_auth_providers.sql`
  5. `005_order_notes_status_events_reviews.sql`
  6. `006_policy_urls_otp_tracking.sql`
  7. `007_courier_bookings_dashboard_layout.sql`
  8. `008_track_otp_verification.sql`
  9. `009_orders_rls_checkout.sql`
  10. `010_orders_metadata_variant.sql`
- [ ] Each run should say success (no red error). If one fails, fix that file and run again.

---

## Step 4: Create one user and make them admin

- [ ] In Supabase open **Authentication** → **Users**
- [ ] Click **Add user** → **Create new user**
- [ ] Enter email (e.g. `admin@citypetshopbd.com`) and a password → **Create user**
- [ ] Click that user in the list
- [ ] Copy the **User UID** (looks like `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)
- [ ] Open **SQL Editor** → New query
- [ ] Paste this and **replace the UUID** with the one you copied (keep the single quotes):

```sql
INSERT INTO team_members (user_id, email, role, full_name, is_active)
VALUES ('PASTE_YOUR_USER_UID_BETWEEN_THESE_QUOTES', 'admin@citypetshopbd.com', 'admin', 'Admin', true)
ON CONFLICT (user_id) DO UPDATE SET role = 'admin', is_active = true;
```

Example: if your User UID is `f47ac10b-58cc-4372-a567-0e02b2c3d479`, the first line of VALUES must be:
`VALUES ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'admin@citypetshopbd.com', ...`

- [ ] Click **Run** → should say success

---

## Step 5: Point the app at Supabase

- [ ] Open your project’s `.env.local`
- [ ] Set these three (use your real Project URL and anon key from Step 2):

```env
NEXT_PUBLIC_AUTH_SOURCE=supabase
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...your-anon-key
```

- [ ] Save the file
- [ ] Restart dev server: stop with Ctrl+C, then run `npm run dev` again

---

## Step 6: Auth redirect for localhost

- [ ] In Supabase open **Authentication** → **URL Configuration**
- [ ] **Site URL:** set to `http://localhost:3000`
- [ ] **Redirect URLs:** add `http://localhost:3000/auth/callback` (one per line) → **Save**

---

## Step 7: Verify

- [ ] Open http://localhost:3000/admin/status  
  → Supabase should show **Configured**, Orders **supabase**, and **Supabase orders persistence: Ready**
- [ ] Open http://localhost:3000/login  
  → Log in with the **same email and password** you used in Step 4 (e.g. admin@citypetshopbd.com)
- [ ] After login you should be on /account or similar (no error)
- [ ] Add a product to cart → Checkout → fill form → place order  
  → Success message
- [ ] Open http://localhost:3000/admin (log in as that user if needed) → **Orders**  
  → The order you just placed should appear in the list

---

## If something fails

| Problem | Fix |
|--------|-----|
| "Invalid UUID" in SQL | You left the text `PASTE_YOUR_USER_UID_BETWEEN_THESE_QUOTES` in the query. Use the real User UID from Authentication → Users (click user → copy UID). |
| Admin status says "Not configured" | Check `.env.local`: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` must be set and have no typos. Restart `npm run dev`. |
| Login does nothing or error | Add `http://localhost:3000/auth/callback` to Redirect URLs in Supabase → Authentication → URL Configuration. |
| Orders list empty in admin | Make sure you ran the SQL in Step 4 with the **same** user’s UUID that you use to log in. That user must be in `team_members` with `role = 'admin'`. |
| Build fails | Run `npm run build` in the project folder. No env vars are required for build. If it still fails, see STEP_BY_STEP_GUIDE.md → Troubleshooting. |

---

When all steps are done, you have:

- Login with Supabase (your admin user)
- Orders saved in Supabase when you checkout
- Admin → Orders showing those orders

---

## Vercel: env var names the app uses

In Vercel **Settings → Environment Variables**, the app expects these **exact** names (so auth and orders work in production):

| Name | Required | Notes |
|------|----------|--------|
| `NEXT_PUBLIC_SITE_URL` | Yes | e.g. `https://citypetshopbd.com` (no trailing slash) |
| `NEXT_PUBLIC_SUPABASE_URL` | For Supabase | Project URL from Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | For Supabase | Anon key (must have **NEXT_PUBLIC_** prefix) |
| `NEXT_PUBLIC_AUTH_SOURCE` | No | `supabase` or `auto` for real auth/orders |
| `NEXT_PUBLIC_PRODUCTS_SOURCE` | No | `local`, `sanity`, or `auto` |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | For Sanity | e.g. `fezfk3zj` |
| `NEXT_PUBLIC_SANITY_DATASET` | No | `production` |
| `SANITY_REVALIDATE_SECRET` | For webhook | Server-only; set a strong secret and use it in Sanity webhook URL |

If you have `SUPABASE_ANON_KEY` without the `NEXT_PUBLIC_` prefix, add **`NEXT_PUBLIC_SUPABASE_ANON_KEY`** with the same value (the browser needs the public prefix). You can keep or remove the non-prefixed one.

For full details (Sanity, Vercel, RLS), see **STEP_BY_STEP_GUIDE.md**.
