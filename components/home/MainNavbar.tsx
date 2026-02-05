"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, Gift, ShoppingCart, Heart, Package } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useState, useEffect } from "react";

const MAIN_NAV = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/combo-offers", label: "Combo Offer" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
];

function isActive(href: string, pathname: string | null) {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function MainNavbar() {
  const pathname = usePathname();
  const { totalItems, toggleCart } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <div className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Image src="/brand/logo.png" alt="City Plus Pet Shop" width={44} height={44} className="h-10 w-10 object-contain" />
          <span className="text-lg font-bold text-slate-900">City Plus Pet Shop</span>
        </Link>

        <nav className="hidden flex-1 justify-center gap-1 lg:flex" aria-label="Main navigation">
          {MAIN_NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`rounded px-3 py-2 text-sm font-semibold transition-colors ${
                isActive(href, pathname) ? "text-primary" : "text-slate-700 hover:text-primary"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/track-order"
            className="hidden items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 sm:flex"
          >
            <Package className="h-4 w-4" />
            Track Order
          </Link>
          <Link
            href="/offers"
            className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-white hover:bg-orange-600"
          >
            <Gift className="h-4 w-4" />
            Special Offer
          </Link>
          <Link href="/account" className="rounded-lg p-2 text-slate-600 hover:bg-slate-100" aria-label="Wishlist">
            <Heart className="h-5 w-5" />
          </Link>
          <button
            onClick={toggleCart}
            className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            aria-label="Cart"
          >
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-lg p-2 text-slate-600 lg:hidden"
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white lg:hidden">
          <nav className="flex flex-col gap-1 px-4 py-4">
            {MAIN_NAV.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`rounded-lg px-3 py-2.5 text-sm font-semibold ${
                  isActive(href, pathname) ? "bg-primary/10 text-primary" : "text-slate-700"
                }`}
              >
                {label}
              </Link>
            ))}
            <Link href="/track-order" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600">
              Track Order
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}
