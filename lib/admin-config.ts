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
  Store,
  Settings,
  HeartPulse,
} from "lucide-react";

export type NavItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: { name: string; href: string }[];
};

/** Primary nav: unified structure. Banners merged into one. Orphans removed. */
export const adminSidebarConfig: NavItem[] = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Banners", href: "/admin/banners", icon: Image },
  { name: "Category", href: "/admin/categories", icon: FolderTree },
  {
    name: "Products",
    href: "/admin/products",
    icon: Package,
    children: [
      { name: "Product List", href: "/admin/products" },
      { name: "Inventory", href: "/admin/inventory" },
      { name: "Product Upload", href: "/admin/products/upload" },
      { name: "Attributes", href: "/admin/attributes" },
      { name: "Inventory Logs", href: "/admin/inventory-logs" },
      { name: "Add Product RAMS", href: "/admin/products/rams" },
      { name: "Add Product WEIGHT", href: "/admin/products/weights" },
      { name: "Add Product SIZE", href: "/admin/products/sizes" },
    ],
  },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Brands", href: "/admin/brands", icon: Store },
  { name: "System Health", href: "/admin/system-health", icon: HeartPulse },
  {
    name: "Settings & More",
    href: "/admin/settings",
    icon: Settings,
    children: [
      { name: "Store Settings", href: "/admin/settings" },
      { name: "Tracking & Pixels", href: "/admin/settings/tracking" },
      { name: "Security", href: "/admin/settings/security" },
      { name: "Homepage Builder", href: "/admin/settings/homepage" },
      { name: "Integrations", href: "/admin/settings/integrations" },
      { name: "Checkout Settings", href: "/admin/checkout-settings" },
      { name: "Payments", href: "/admin/payments" },
      { name: "Analytics", href: "/admin/analytics" },
      { name: "Order Report", href: "/admin/reports/orders" },
      { name: "Expense", href: "/admin/reports/expense" },
      { name: "Live Visitors", href: "/admin/analytics/live" },
      { name: "Blog", href: "/admin/blog" },
      { name: "Site Pages", href: "/admin/pages" },
      { name: "Legal Pages", href: "/admin/legal-pages" },
      { name: "Blog Categories", href: "/admin/blog-categories" },
      { name: "Customers", href: "/admin/customers" },
      { name: "Vouchers", href: "/admin/vouchers" },
      { name: "Abandoned Checkout", href: "/admin/draft-orders" },
      { name: "Order Activities", href: "/admin/orders/activities" },
      { name: "Repeat Customer", href: "/admin/customers/repeat" },
      { name: "Customer Risk", href: "/admin/customers/risk" },
      { name: "Product Catalogs", href: "/admin/collections" },
      { name: "Product Filters", href: "/admin/product-filters" },
      { name: "Units", href: "/admin/products/units" },
      { name: "Shipping", href: "/admin/shipping" },
      { name: "Fraud & Security", href: "/admin/fraud" },
      { name: "Courier", href: "/admin/courier" },
      { name: "Notifications", href: "/admin/notifications" },
      { name: "Team", href: "/admin/team" },
      { name: "Audit Logs", href: "/admin/audit-logs" },
      { name: "Roles & Permissions", href: "/admin/roles-permissions" },
    ],
  },
];

export const StoreIcon = Store;
