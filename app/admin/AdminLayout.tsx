"use client";

import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  Menu,
  X,
  Store,
  Bell,
  Search,
  LogOut,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  ShoppingCart,
  Package,
  FileText,
  Users,
  Activity,
  Settings,
  Image,
  FolderTree,
  HeartPulse,
} from "lucide-react";
import { adminSidebarConfig, StoreIcon } from "@/lib/admin-config";

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  ShoppingCart,
  Package,
  FileText,
  Users,
  Activity,
  Settings,
  Image,
  FolderTree,
  Store,
  HeartPulse,
};

const DEFAULT_ICON: LucideIcon = LayoutDashboard;

function getIconComponent(iconName: string | undefined): LucideIcon {
  if (typeof iconName !== "string" || !iconName.trim()) return DEFAULT_ICON;
  return iconMap[iconName] ?? DEFAULT_ICON;
}

type MenuItem = { name: string; href: string; icon?: string; children?: { name: string; href: string }[] };

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(true);
  const [menuItems, setMenuItems] = useState<MenuItem[] | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(["Products", "Settings & More"]));

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    setIsMobile(mq.matches);
    const fn = () => setIsMobile(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);

  useEffect(() => {
    fetch("/api/admin/menu")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.menu) && d.menu.length > 0) {
          setMenuItems(d.menu);
        }
      })
      .catch(() => setMenuItems(null));
  }, []);

  const navItems: MenuItem[] = menuItems ?? adminSidebarConfig.map((c) => ({
    name: c.name,
    href: c.href,
    icon: (c.icon as { name?: string })?.name ?? "LayoutDashboard",
    children: c.children,
  }));

  if (pathname === "/admin/login") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
        {children}
      </div>
    );
  }

  const toggleExpand = (name: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex">
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ x: isMobile && !sidebarOpen ? "-100%" : 0 }}
        transition={{ type: "tween", duration: 0.2 }}
        className="fixed inset-y-0 left-0 z-50 w-64 shrink-0 bg-white/95 backdrop-blur-xl border-r border-slate-200 shadow-xl lg:relative lg:translate-x-0 overflow-y-auto"
      >
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-200">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 text-white">
              <StoreIcon className="h-5 w-5" />
            </div>
            <span className="font-bold text-slate-900">Admin Panel</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-500 hover:text-slate-900">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 px-3 py-4">
          {navItems.map((item) => {
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expandedItems.has(item.name);
            const isActive = pathname === item.href || (hasChildren && item.children?.some((c) => pathname === c.href));
            const Icon = getIconComponent(item.icon);

            if (hasChildren) {
              return (
                <div key={item.name}>
                  <button
                    onClick={() => toggleExpand(item.name)}
                    className={`group flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                      isActive ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-slate-400 group-hover:text-slate-600" />
                      {item.name}
                    </div>
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden pl-6"
                      >
                        {item.children!.map((child) => {
                          const childActive = pathname === child.href;
                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={() => setSidebarOpen(false)}
                              className={`block rounded-lg px-3 py-2 text-sm ${
                                childActive ? "bg-blue-100 text-blue-700 font-medium" : "text-slate-600 hover:bg-slate-50"
                              }`}
                            >
                              {child.name}
                            </Link>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md" : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 p-4">
          <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 text-white font-semibold">
              A
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">Admin</p>
              <p className="text-xs text-slate-500 truncate">admin@store.com</p>
            </div>
          </div>
          <Link
            href="/admin/logout"
            className="mt-3 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Link>
        </div>
      </motion.aside>

      <div className="flex-1 min-w-0 lg:pl-0">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-200 bg-white/95 backdrop-blur-xl px-6 shadow-sm">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-500 hover:text-slate-900">
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="search"
                placeholder="Search products, orders..."
                className="w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
              </span>
            </button>
            <Link href="/" className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
              View Store
            </Link>
          </div>
        </header>

        <main className="p-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
