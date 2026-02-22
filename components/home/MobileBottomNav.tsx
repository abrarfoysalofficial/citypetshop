"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, ShoppingCart, User } from "lucide-react";
import { useCart } from "@/context/CartContext";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/shop", label: "Categories", icon: LayoutGrid },
  { href: "/cart", label: "Cart", icon: ShoppingCart },
  { href: "/account", label: "Account", icon: User },
];

function isActive(href: string, pathname: string | null) {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { totalItems } = useCart();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      aria-label="Mobile navigation"
    >
      <div className="flex items-stretch justify-around">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(href, pathname);
          const isCart = href === "/cart";
          return (
            <Link
              key={href}
              href={href}
              className={`flex min-h-[56px] min-w-[44px] flex-1 flex-col items-center justify-center gap-0.5 px-2 py-2 transition-colors ${
                active ? "text-primary" : "text-slate-500"
              }`}
              aria-label={label}
              aria-current={active ? "page" : undefined}
            >
              <span className="relative flex items-center justify-center">
                <Icon className="h-6 w-6" strokeWidth={active ? 2.5 : 2} />
                {isCart && totalItems > 0 && (
                  <span className="absolute -right-2 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {totalItems > 99 ? "99+" : totalItems}
                  </span>
                )}
              </span>
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
