# Storefront Route Inventory

**Generated:** March 1, 2026

---

## Route List

| Route | File | Dynamic | Purpose | Linked From |
|-------|------|---------|---------|-------------|
| `/` | `app/page.tsx` | — | Home | MainNavbar, Footer, MobileBottomNav |
| `/shop` | `app/shop/page.tsx` | — | Shop listing | MainNavbar, Footer, MobileBottomNav |
| `/shop/[slug]` | `app/shop/[slug]/page.tsx` | slug | Category/shop | Footer (category links) |
| `/product/[id]` | `app/product/[id]/page.tsx` | id | Product detail | Shop grid, cart |
| `/category/[...slug]` | `app/category/[...slug]/page.tsx` | slug | Category page | Footer (dog-food, cat-food, etc.) |
| `/cart` | `app/cart/page.tsx` | — | Cart | MainNavbar, MobileBottomNav |
| `/checkout` | `app/checkout/page.tsx` | — | Checkout | Cart, order flow |
| `/order-complete` | `app/order-complete/page.tsx` | — | Order success | Checkout redirect |
| `/blog` | `app/blog/page.tsx` | — | Blog listing | MainNavbar |
| `/blog/[slug]` | `app/blog/[slug]/page.tsx` | slug | Blog post | Blog listing |
| `/about` | `app/about/page.tsx` | — | About | MainNavbar, Footer |
| `/contact` | `app/contact/page.tsx` | — | Contact | MainNavbar, Footer |
| `/terms` | `app/terms/page.tsx` | — | Terms & Conditions | Footer (STORE_POLICY) |
| `/privacy` | `app/privacy/page.tsx` | — | Privacy Policy | Footer |
| `/refund` | `app/refund/page.tsx` | — | Return/Refund | Footer |
| `/track-order` | `app/track-order/page.tsx` | — | Track order | Footer, MainNavbar |
| `/site-map` | `app/site-map/page.tsx` | — | Human sitemap | — |
| `/combo-offers` | `app/combo-offers/page.tsx` | — | Combo offers | MainNavbar |
| `/compare` | `app/compare/page.tsx` | — | Product compare | — |
| `/offers` | `app/offers/page.tsx` | — | Offers | — |
| `/login` | `app/login/page.tsx` | — | Customer login | — |
| `/logout` | `app/logout/page.tsx` | — | Logout | — |
| `/register` | `app/register/page.tsx` | — | Register | — |
| `/forgot-password` | `app/forgot-password/page.tsx` | — | Forgot password | — |
| `/account` | `app/account/page.tsx` | — | My account | MainNavbar, Footer, MobileBottomNav |
| `/account/orders` | `app/account/orders/page.tsx` | — | Order list | Account |
| `/account/orders/[id]` | `app/account/orders/[id]/page.tsx` | id | Order detail | Order list |
| `/account/invoices` | `app/account/invoices/page.tsx` | — | Invoices | Account |
| `/account/returns` | `app/account/returns/page.tsx` | — | Returns | Account |
| `/payment` | `app/payment/page.tsx` | — | Payment | — |
| `/payment/success` | `app/payment/success/page.tsx` | — | Payment success | SSLCommerz redirect |
| `/payment/failed` | `app/payment/failed/page.tsx` | — | Payment failed | SSLCommerz redirect |
| `/payment-failed` | `app/payment-failed/page.tsx` | — | Payment failed (alt) | — |
| `/landing/[slug]` | `app/landing/[slug]/page.tsx` | slug | Landing page | — |
| `/503` | `app/503/page.tsx` | — | Service unavailable | Middleware (prod demo) |
| `/entertainment` | `app/entertainment/page.tsx` | — | Entertainment (placeholder?) | — |

---

## Legacy Redirect Routes

| Route | File | Redirects To |
|-------|------|--------------|
| `/terms-conditions` | `app/terms-conditions/page.tsx` | `/terms` |
| `/privacy-policy` | `app/privacy-policy/page.tsx` | `/privacy` |
| `/refund-return-policy` | `app/refund-return-policy/page.tsx` | `/refund` |
| `/my-account` | `app/my-account/page.tsx` | `/account` |
| `/my-account/*` | `app/my-account/*/page.tsx` | `/account/*` |
| `/about-us` | `app/about-us/page.tsx` | `/about` |
| `/contact-us` | `app/contact-us/page.tsx` | `/contact` |

---

## Special Routes

| Route | File | Purpose |
|-------|------|---------|
| `/sitemap.xml` | `app/sitemap.ts` | Dynamic sitemap (Next.js metadata) |
| `/robots.txt` | `app/robots.ts` | Robots (Next.js metadata) |

---

## Orphan Routes (no UI link)

- `/site-map` — Not linked from footer/nav
- `/compare` — Compare feature; may be linked from product cards
- `/offers` — May overlap with combo-offers
- `/entertainment` — Placeholder?
- `/payment-failed` — Duplicate of `/payment/failed`?
- `/landing/[slug]` — Dynamic; linked from CMS/landing builder

---

## Broken Links (linked but missing)

- **Footer** links to `/category/cat-accessories` — verify category exists in seed
- **Footer** links to `/combo-offers` — route exists

---

## Evidence

- **MainNavbar:** `components/home/MainNavbar.tsx` — MAIN_NAV, Track Order, Offers
- **HomeFooter:** `components/home/HomeFooter.tsx` — STORE_POLICY, IMPORTANT_LINKS, POPULAR_CATEGORIES
- **MobileBottomNav:** `components/home/MobileBottomNav.tsx` — Home, Shop, Cart, Account
