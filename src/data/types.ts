/**
 * Data layer types: Product, BlogPost, Category, Brand, Offer, ComboOffer, HomeSection.
 */

/** Optional variation (size/color) – admin-managed; swatch support. */
export interface ProductVariation {
  id: string;
  name: string; // e.g. "1kg", "Red"
  attribute?: string; // e.g. "size", "color"
  price?: number;
  comparePrice?: number;
  image?: string; // gallery sync when selected
  inStock?: boolean;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  categorySlug: string;
  brand?: string;
  price: number;
  comparePrice?: number;
  rating?: number;
  inStock: boolean;
  shortDesc: string;
  longDesc?: string;
  images: string[];
  /** Optional single image (used as fallback if images[0] not set) */
  image?: string;
  tags?: string[];
  specs?: Record<string, string>;
  seo?: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
  /** Optional variations (size/color swatches); default selection from defaultVariationId or first. */
  variations?: ProductVariation[];
  defaultVariationId?: string;
  /** Optional product video URL – admin-controlled. */
  videoUrl?: string;
  /** Stock quantity for low-stock alert (when set and < threshold). */
  stockQuantity?: number;
}

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  coverImage: string;
  thumbnailImage: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  content: string;
  faq?: { q: string; a: string }[];
}

export interface Category {
  slug: string;
  name: string;
  image?: string;
  subcategories?: string[];
}

export interface Brand {
  id: string;
  name: string;
  logo?: string;
  slug?: string;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  startDate: string;
  endDate: string;
  active: boolean;
  image?: string;
  minPurchase?: number;
}

export interface ComboOffer {
  id: string;
  slug: string;
  title: string;
  description: string;
  image: string;
  price: number;
  comparePrice?: number;
  productIds?: string[];
  href: string;
  cta?: string;
}

export interface HeroSlide {
  id: string;
  title: string;
  subheadline?: string;
  image: string;
  href: string;
  cta?: string;
}

export interface FeaturedCategory {
  slug: string;
  name: string;
  image: string;
  href: string;
}

export interface FlashSaleBanner {
  image: string;
  title: string;
  subheadline?: string;
  endTime: string; // ISO date
  href: string;
  cta?: string;
}

export interface HomeSection {
  heroSlides: HeroSlide[];
  featuredCategories: FeaturedCategory[];
  featuredBrands: Brand[];
  flashSale: FlashSaleBanner | null;
  sideBanners?: { id: string; title: string; subtitle: string; image: string; href: string; cta: string }[];
}

// Admin / User account demo types
export interface DemoOrderItem {
  productId: string;
  name: string;
  qty: number;
  price: number;
}

export interface DemoOrder {
  id: string;
  customerId?: string;
  customerName?: string;
  email?: string;
  total: number;
  status: string;
  createdAt: string;
  items?: DemoOrderItem[];
  shippingAddress?: string;
  paymentMethod?: string;
}

export interface DemoCustomer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  ordersCount: number;
  lastOrderAt?: string;
}

export interface DemoReportSummary {
  sales: string;
  profit: string;
  orders: string;
  returnRate: string;
  loss: string;
}

export interface DemoReportSeries {
  name: string;
  sales: number;
  visits?: number;
}

export interface DemoDashboard {
  summary: DemoReportSummary;
  salesData: DemoReportSeries[];
  activity: { id: number; text: string; time: string }[];
}

export interface DemoVoucher {
  id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  minPurchase?: number;
  startDate: string;
  endDate: string;
  active: boolean;
  usageCount?: number;
}

export interface DemoAuditLog {
  id: string;
  action: string;
  userId?: string;
  entity?: string;
  details?: string;
  createdAt: string;
}

export interface DemoUserProfile {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  address?: string;
}

export interface DemoInvoice {
  id: string;
  orderId: string;
  number: string;
  date: string;
  total: number;
  downloadUrl?: string;
}

export interface DemoReturn {
  id: string;
  orderId: string;
  status: string;
  reason?: string;
  requestedAt: string;
  updatedAt?: string;
}
