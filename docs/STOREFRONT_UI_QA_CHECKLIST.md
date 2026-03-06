# Storefront UI/UX Refactor — Manual QA Checklist

**Date:** March 2026  
**Scope:** Storefront only (no admin, no API/DB changes)

---

## A) Top Utility Bar + Sticky Header

- [ ] **TopBar (desktop):** Helpline, delivery note, Account dropdown, Login/Register visible
- [ ] **Sticky Header:** Logo, search bar, Track, Offers, Wishlist, Cart visible
- [ ] **Shop by Category (desktop):** Hover opens flyout with categories from DB
- [ ] **Shop by Category (mobile):** Slide-over drawer with categories in mobile menu
- [ ] **Nav links:** From TenantSettings.navbarLinks (Admin → Menus)
- [ ] **Search:** Submits to `/shop?q=...&category=...`
- [ ] **Cart badge:** Shows item count

---

## B) Homepage (Admin-driven blocks)

- [ ] **Hero carousel:** Wide, clean; slides from HomeBannerSlide / TenantSettings
- [ ] **Category chips (mobile):** Horizontal scroll; categories from `/api/categories`
- [ ] **Trust badges:** 4 items (Fast Delivery, Authentic, Support, Payments)
- [ ] **Promo banners:** 3 tiles; links work
- [ ] **Shop by Category tiles:** Popular categories with images
- [ ] **Product blocks:** Order from homepageBlocks (Admin → Homepage Builder)
  - [ ] Featured products
  - [ ] Flash Sale
  - [ ] Clearance
  - [ ] Combo Offers
  - [ ] Reviews
- [ ] **WhyChooseUs, DiscountStrip:** Present at bottom

---

## C) Shop & Search

- [ ] **Desktop:** Left sidebar (categories, brand, price, sort, availability)
- [ ] **Mobile:** Filters button opens drawer; sticky sort bar (Default/Low/High)
- [ ] **Categories:** From DB via `/api/categories`
- [ ] **Search pagination:** `/shop?q=...&page=N` works
- [ ] **Product grid:** 2-col mobile, 3-col desktop

---

## D) Product Cards

- [ ] **Compact layout:** Image, name (2 lines), price, discount badge, stock badge
- [ ] **Add to Cart:** Opens cart slide-over (quick add)
- [ ] **Buy Now (shop page):** Clears cart, adds item, navigates to checkout
- [ ] **Wishlist heart:** Toggle works

---

## E) PDP + Cart + Checkout

- [ ] **PDP:** Clean hierarchy, variant selectors, delivery info, reviews
- [ ] **Cart page:** Summary, quantity controls, checkout CTA
- [ ] **Cart slide-over:** Same behavior
- [ ] **Checkout:** Two-column desktop (form left, summary right); stacked mobile
- [ ] **Validation/payment:** Unchanged; no logic break

---

## F) Theme & Footer

- [ ] **Primary:** Green (#15803d)
- [ ] **Accent:** Orange (#ea580c) for badges, Offers button
- [ ] **Footer:** From TenantSettings.footerLinks
- [ ] **Legal pages:** Terms, Privacy, Refund (CmsPage-driven)

---

## homepageBlocks → Rendered Sections

| Block type       | Rendered component   |
|------------------|----------------------|
| `featured`       | HomeProductGrid      |
| `featured_brands`| FeaturedBrandsSlider |
| `flash_sale`     | HomeProductGrid      |
| `clearance`      | HomeProductGrid      |
| `combo_offers`   | HomeComboBlock       |
| `reviews`        | HomeReviewSection    |

Order and enable/disable controlled by Admin → Settings → Homepage Builder.

---

## Build Verification

```bash
npm run build   # Must pass
```
