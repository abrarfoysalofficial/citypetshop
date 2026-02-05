# Vercel Deployment Guide – City Plus Pet Shop

## 1. Vercel Environment Variables

Set these in Vercel Project → Settings → Environment Variables:

### Required (Production)

| Key | Description | Example |
|-----|-------------|---------|
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL | `https://citypluspetshop.com` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | `eyJ...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role (server-only) | `eyJ...` |

### Auth (default: Supabase in production)

| Key | Description | Example |
|-----|-------------|---------|
| `NEXT_PUBLIC_AUTH_MODE` | `demo` or `supabase` | `supabase` (or omit for default) |
| `NEXT_PUBLIC_DATA_SOURCE` | `local`, `supabase`, `sanity` | `supabase` (or omit for default) |

### Analytics (optional)

| Key | Description |
|-----|-------------|
| `NEXT_PUBLIC_GTM_ID` | GTM container ID |
| `NEXT_PUBLIC_ENABLE_GTM` | `true` to load GTM |
| `NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN` | Cloudflare Web Analytics token |
| `NEXT_PUBLIC_ENABLE_CF_ANALYTICS` | `true` to load Cloudflare |

### Social Links

| Key | Description |
|-----|-------------|
| `NEXT_PUBLIC_SOCIAL_FACEBOOK` | Facebook page URL |
| `NEXT_PUBLIC_SOCIAL_INSTAGRAM` | Instagram URL |
| `NEXT_PUBLIC_SOCIAL_YOUTUBE` | YouTube channel URL |

### Sanity (if using)

| Key | Description |
|-----|-------------|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sanity project ID |
| `NEXT_PUBLIC_SANITY_DATASET` | Sanity dataset |
| `SANITY_API_READ_TOKEN` | Sanity read token (server) |

### Meta Pixel / CAPI (optional)

| Key | Description |
|-----|-------------|
| `NEXT_PUBLIC_FACEBOOK_PIXEL_ID` | Meta Pixel ID |
| `FACEBOOK_CAPI_TOKEN` | Conversion API token (server) |

---

## 2. Build Verification

```bash
npm ci
npm run lint
npm run typecheck
npm run build
```

All should complete without errors.

---

## 3. Domain Connect

### A Record (apex domain)

| Type | Name | Value |
|------|------|-------|
| A | @ | `76.76.21.21` |

### CNAME (www)

| Type | Name | Value |
|------|------|-------|
| CNAME | www | `cname.vercel-dns.com` |

### Optional: Cloudflare

1. Add site to Cloudflare; update nameservers.
2. Set SSL to Full (strict) if using custom domain.
3. Proxy enabled is fine for Vercel.

---

## 4. Post-Deploy Smoke Test

| Step | Check |
|------|-------|
| 1 | Homepage loads |
| 2 | `/shop` loads |
| 3 | `/product/[id]` loads |
| 4 | Add to cart works |
| 5 | Checkout flow completes |
| 6 | `/track-order` loads |
| 7 | `/login` shows Supabase auth (no demo hints in prod) |
| 8 | `/admin/login` accessible |
| 9 | GTM / Cloudflare scripts load (when enabled) |
| 10 | Social links in footer point to correct URLs |
