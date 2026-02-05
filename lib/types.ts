export interface CategoryItem {
  slug: string;
  name: string;
  subcategories?: string[];
}

export interface Product {
  id: string;
  name: string;
  price: number; // in BDT
  description: string;
  categorySlug: string;
  image: string;
  inStock?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
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
  updatedAt?: string;
}

export interface Voucher {
  id: string;
  code: string;
  discountType: "percent" | "fixed";
  value: number;
  minSpend: number;
  maxUses: number;
  usedCount: number;
  validFrom: string;
  validTo: string;
  active: boolean;
  updatedAt?: string;
}
