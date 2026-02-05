"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Settings,
  Package,
  Upload,
  ShoppingCart,
  Truck,
  CreditCard,
  Gift,
  Users,
  BarChart3,
  FileText,
  Menu,
  X,
  Tag,
  Plug,
  Sliders,
  LogOut,
  LayoutList,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const AUTH_MODE = (process.env.NEXT_PUBLIC_AUTH_MODE as "demo" | "supabase") ?? "demo";

const sidebarLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/studio", label: "Content (Sanity CMS)", icon: LayoutList },
  { href: "/admin/settings", label: "Site Settings", icon: Settings },
  { href: "/admin/theme", label: "Theme", icon: Settings },
  { href: "/admin/advanced-settings", label: "Advanced Settings", icon: Sliders },
  { href: "/admin/tools", label: "Tools & Plugins", icon: Plug },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/products/new", label: "New Product", icon: Package },
  { href: "/admin/products/bulk", label: "Bulk Add (CSV)", icon: Upload },
  { href: "/admin/categories", label: "Categories", icon: Package },
  { href: "/admin/attributes", label: "Attributes", icon: Tag },
  { href: "/admin/product-tags", label: "Product Tags", icon: Tag },
  { href: "/admin/brands", label: "Brands", icon: Package },
  { href: "/admin/inventory", label: "Inventory", icon: Package },
  { href: "/admin/combo-offers", label: "Combo Offers", icon: Gift },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/reviews", label: "Review Moderation", icon: FileText },
  { href: "/admin/offers", label: "Offers", icon: Tag },
  { href: "/admin/vouchers", label: "Vouchers", icon: Gift },
  { href: "/admin/blog", label: "Blog", icon: FileText },
  { href: "/admin/pages", label: "CMS Pages", icon: FileText },
  { href: "/admin/menus", label: "Menus", icon: FileText },
  { href: "/admin/checkout-settings", label: "Checkout Settings", icon: Settings },
  { href: "/admin/payments", label: "Payment Gateways", icon: CreditCard },
  { href: "/admin/emails", label: "Email Notifications", icon: FileText },
  { href: "/admin/invoices", label: "PDF Invoices", icon: FileText },
  { href: "/admin/courier", label: "Courier", icon: Truck },
  { href: "/admin/tracking", label: "Tracking", icon: BarChart3 },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/users/new", label: "Add User", icon: Users },
  { href: "/admin/roles-permissions", label: "Roles & Permissions", icon: Users },
  { href: "/admin/audit-logs", label: "Audit Logs", icon: FileText },
  { href: "/admin/team", label: "Team", icon: Users },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Top bar */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm lg:px-6">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <Image src="/brand/logo.png" alt="City Plus Pet Shop" width={36} height={36} className="h-9 w-9 object-contain" />
          City Plus Pet Shop
        </Link>
        <div className="flex items-center gap-2">
          {AUTH_MODE === "demo" && (
            <span className="rounded-full bg-amber-500 px-2.5 py-1 text-xs font-medium text-white">
              Demo Mode
            </span>
          )}
          <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-white">
            Admin
          </span>
          <Link
            href="/admin/logout"
            className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
          >
            <LogOut className="h-4 w-4" /> Logout
          </Link>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-30 w-64 transform border-r border-slate-200 bg-white pt-14 transition-transform lg:static lg:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <nav className="flex flex-col gap-1 p-4">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              const isActive =
                pathname === link.href ||
                (link.href !== "/admin" && pathname.startsWith(link.href + "/"));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Main content */}
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
