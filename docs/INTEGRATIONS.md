# Integrations & Verification

## Environment Variables

Add to `.env.local` (see `.env.local.example`):

```
NEXT_PUBLIC_SITE_URL=https://citypluspetshop.com
NEXT_PUBLIC_GTM_ID=GTM-XXXX
NEXT_PUBLIC_ENABLE_GTM=true
NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN=your-token-uuid
NEXT_PUBLIC_ENABLE_CF_ANALYTICS=true
NEXT_PUBLIC_SOCIAL_FACEBOOK=https://facebook.com/...
NEXT_PUBLIC_SOCIAL_INSTAGRAM=https://instagram.com/...
NEXT_PUBLIC_SOCIAL_YOUTUBE=https://youtube.com/...
```

## Manual Verification Checklist

### DevTools (F12)

1. **Network tab**: Filter by "gtm" or "cloudflareinsights" – scripts load only when enabled
2. **Console**: No errors; `window.dataLayer` exists when GTM enabled
3. **Application > Manifest**: PWA icons if configured

### Page Source (View Source)

1. **Viewport**: `<meta name="viewport" content="width=device-width, initial-scale=1" />`
2. **Mobile tags**: `mobile-web-app-capable`, `apple-mobile-web-app-capable`, `apple-mobile-web-app-title`
3. **UTF-8**: Next.js serves `Content-Type: text/html; charset=utf-8` by default
4. **Social links**: Footer `<a href="https://...">` for Facebook, Instagram, YouTube when set

### Apple Touch Icon

Add these files to `public/`:
- `apple-touch-icon.png` (180×180)
- `icon-192.png` (192×192, optional)
- `icon-512.png` (512×512, optional)

### Route Exclusions

Analytics scripts are NOT injected on:
- `/admin/*`
- `/studio`

### GTM Events (Optional)

Use `pushDataLayer` from `@/lib/analytics`:
- ViewContent, Search, AddToCart, InitiateCheckout, Purchase
