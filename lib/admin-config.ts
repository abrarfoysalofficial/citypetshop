/**
 * Centralized admin sidebar config with nested menus.
 * Ecommerce-style admin panel. Reference structure + all A–Z legacy routes.
 */
import {
  LayoutDashboard,
  Image,
  FolderTree,
  Package,
  ShoppingCart,
  ImageIcon,
  PanelLeft,
  LayoutGrid,
  Store,
  Settings,
} from "lucide-react";

export type NavItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: { name: string; href: string }[];
};

/** Primary nav: reference structure (Dashboard, Banners, Category, Products, Orders) */
export const adminSidebarConfig: NavItem[] = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Home Banner Slides", href: "/admin/home-banner-slides", icon: Image },
  { name: "Category", href: "/admin/categories", icon: FolderTree },
  {
    name: "Products",
    href: "/admin/products",
    icon: Package,
    children: [
      { name: "Product List", href: "/admin/products" },
      { name: "Product Upload", href: "/admin/products/upload" },
      { name: "Add Product RAMS", href: "/admin/products/rams" },
      { name: "Add Product WEIGHT", href: "/admin/products/weights" },
      { name: "Add Product SIZE", href: "/admin/products/sizes" },
    ],
  },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Home Banners", href: "/admin/home-banners", icon: ImageIcon },
  { name: "Home Side Banners", href: "/admin/home-side-banners", icon: PanelLeft },
  { name: "Home Bottom Banners", href: "/admin/home-bottom-banners", icon: LayoutGrid },
  {
    name: "Settings & More",
    href: "/admin/settings",
    icon: Settings,
    children: [
      { name: "Store Settings", href: "/admin/settings" },
      { name: "Checkout Settings", href: "/admin/checkout-settings" },
      { name: "Payments", href: "/admin/payments" },
      { name: "Analytics", href: "/admin/analytics" },
      { name: "Blog", href: "/admin/blog" },
      { name: "Customers", href: "/admin/customers" },
      { name: "Vouchers", href: "/admin/vouchers" },
      { name: "Courier", href: "/admin/courier" },
      { name: "Team", href: "/admin/team" },
      { name: "Studio (CMS)", href: "/admin/studio" },
    ],
  },
];

export const StoreIcon = Store;
