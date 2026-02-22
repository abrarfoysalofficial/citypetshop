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
  Shield,
  Users,
  FileText,
  Activity,
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
      { name: "Order Report", href: "/admin/reports/orders" },
      { name: "Expense", href: "/admin/reports/expense" },
      { name: "Live Visitors", href: "/admin/analytics/live" },
      { name: "Blog", href: "/admin/blog" },
      { name: "Site Pages", href: "/admin/pages" },
      { name: "Blog Categories", href: "/admin/blog-categories" },
      { name: "Customers", href: "/admin/customers" },
      { name: "Vouchers", href: "/admin/vouchers" },
      { name: "Landing Pages", href: "/admin/landing-pages" },
      { name: "Abandoned Checkout", href: "/admin/draft-orders" },
      { name: "Order Activities", href: "/admin/orders/activities" },
      { name: "Repeat Customer", href: "/admin/customers/repeat" },
      { name: "Customer Risk", href: "/admin/customers/risk" },
      { name: "Message Inbox", href: "/admin/messages" },
      { name: "Ad Management", href: "/admin/ad-management" },
      { name: "Global AI", href: "/admin/global-ai" },
      { name: "Product Catalogs", href: "/admin/collections" },
      { name: "Product Filters", href: "/admin/product-filters" },
      { name: "Units", href: "/admin/products/units" },
      { name: "Shipping", href: "/admin/shipping" },
      { name: "Fraud & Security", href: "/admin/fraud" },
      { name: "Courier", href: "/admin/courier" },
      { name: "Team", href: "/admin/team" },
    ],
  },
];

export const StoreIcon = Store;
