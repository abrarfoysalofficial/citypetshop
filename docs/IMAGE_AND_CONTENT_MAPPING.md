# Image & Content Mapping – City Plus Pet Shop

## 1) Image → usage mapping

### Brand (`/public/brand/`)
| File | Usage |
|------|--------|
| `logo.png` | Main logo (navbar, admin sidebar) – priority load |
| `logo-white.jpg` | Footer / dark backgrounds |
| `logo-dark.png` | About page |
| `logonobg.png`, `logowhitebg.jpg`, `logo-aboutus.png` | Legacy; prefer logo.png / logo-white.jpg / logo-dark.png |

### Brands (`/public/brands/`)
Used in **Featured Brands** (Home) and shop brand filter. Only brands in `FEATURED_BRAND_SLUGS` are shown in the slider.

| File | Usage |
|------|--------|
| `bellotta.png` | Bellotta brand |
| `friskies.png` | Friskies brand |
| `jungle.png` | Jungle brand |
| `lara.png` | Lara brand |
| `nature-bridge.png`, `naturebridge.png` | Nature Bridge brand |
| `petme.png` | petme brand |
| `truly.png` | TRULY brand |

**Allowed in UI (when assets added):** royal-canin, reflex, drools, smartheart, bonacibo, bioline, felicia, himalaya, skyec, zoi-cat, petmetro. Add corresponding PNGs under `/public/brands/` to show logos.

### Categories (`/public/categories/`)
| Path | Usage |
|------|--------|
| `{slug}.png` | e.g. `cat-food.png`, `dog-food.png`, `care-health.png` – used in Popular Categories and category meta/OG. |
| `category-1.svg` | Fallback when `{slug}.png` is missing |

**Expected filenames (add as needed):** cat-food.png, cat-litter.png, cat-accessories.png, care-health.png, dog-food.png, dog-health-accessories.png, bird-food-accessories.png, rabbit-food-accessories.png, cat-toys.png, cat-equipment.png.

### Products (`/public/products/`)
| File | Usage |
|------|--------|
| `placeholder.webp` | Demo/seed product image and fallback when a product has no uploaded image (cards, detail gallery, checkout). |

### UI (`/public/ui/`)
| File | Usage |
|------|--------|
| `product-4x3.svg` | Generic UI placeholder (non-product imagery) |
| `hero-16x9.svg` | Hero / banner placeholder |
| `blog-cover.svg` | Blog listing/detail placeholder |
| `sslcommerz.png` | Checkout payment badge |
| `customer-service.webp` | Contact page |
| `reviews/*.png` | Home review section |

---

## 2) Content auto-generated (missing fields only)

- **`lib/category-meta.ts`**  
  Short SEO descriptions (1–2 lines) for categories, used in category page meta and OG when no CMS value exists.  
  Categories: cat-food, cat-litter, cat-accessories, care-health, dog-food, dog-health-accessories, bird-food-accessories, rabbit-food-accessories, cat-toys, cat-equipment.

- **`lib/brands-master.ts`**  
  `BRAND_SEO_DESCRIPTIONS`: optional SEO descriptions (max 160 chars) for brand slugs. Used when CMS has no description.  
  No existing product, category, or blog content was overwritten.

---

## 3) Confirmation – no existing data removed or overwritten

- **Products:** No products deleted or edited. Only fallback image path and JSON-LD image URLs were standardized.
- **Categories:** `MASTER_CATEGORIES` unchanged. Optional short descriptions added in `lib/category-meta.ts` for meta/OG only.
- **Blogs:** No blog data changed.
- **Admin:** No admin data removed. Logo paths updated to `/brand/logo.png` etc.
- **Brands:** All `MASTER_BRANDS` entries kept. Home “Featured Brands” section filters by `FEATURED_BRAND_SLUGS`; brands without assets still appear with name-only when in that list.

---

## 4) Implementation notes (visual/behavior)

- **Brand section (Home):** Lazy-loaded; alt text `"{Brand Name} pet food brand in Bangladesh"`.
- **Category sidebar / Popular Categories:** Use `/categories/{slug}.png` with fallback `category-1.svg`; alt `"{Category name} for pets"`.
- **Product cards:** Primary image from `product.images` or `product.image`; fallback `/products/placeholder.webp`; `next/image` via SafeImage with responsive `sizes`.
- **Product detail:** Gallery from `product.images`; zoom modal; JSON-LD `image` array uses absolute URLs (including fallback).
- **Category pages:** `generateMetadata` sets title, description, and OG image from `getCategoryShortDescription` and `getCategoryImagePath`.
- **Product JSON-LD:** `image` array normalized to full URLs (relative paths prefixed with `NEXT_PUBLIC_SITE_URL`).

---

## 5) Validation

- All images referenced from `/public` with consistent paths.
- `next/image` used everywhere (via SafeImage where applicable).
- Meaningful alt on all updated images; product gallery alts differentiated (e.g. “{name} image 1”).
- Run `npm run build` and confirm no broken image paths or console errors.
