"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, Gift, ShoppingCart, Heart, Package } from "lucide-react";
import { useCart } from "@/store/CartContext";
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
    <div className="sticky top-0 z-50 border-b border-slate-200 bg-bg-card shadow-sm">
      {/* Desktop: [Logo left] [Nav center] [Actions right] | Mobile: [Hamburger] [Logo center] [Cart] */}
      <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-3 py-3 md:grid-cols-[auto_1fr_auto] md:px-6 lg:px-8">
        {/* Left: Hamburger (mobile) | Logo (desktop) */}
        <div className="flex items-center justify-start">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <Link
            href="/"
            className="hidden items-center gap-2 md:flex"
          >
            <Image src="/brand/logo.png" alt="City Plus Pet Shop" width={44} height={44} className="h-10 w-10 shrink-0 object-contain" />
            <span className="text-lg font-bold text-slate-900">City Plus</span>
          </Link>
        </div>

        {/* Center: Logo (mobile) | Nav (desktop) */}
        <div className="flex justify-center">
          <Link href="/" className="flex items-center gap-2 md:hidden">
            <Image src="/brand/logo.png" alt="City Plus Pet Shop" width={44} height={44} className="h-9 w-9 shrink-0 object-contain" />
            <span className="text-base font-bold text-slate-900">City Plus</span>
          </Link>
          <nav className="hidden gap-1 lg:flex" aria-label="Main navigation">
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
        </div>

        {/* Right: Track Order, Offers, Wishlist, Cart */}
        <div className="flex items-center justify-end gap-2">
          <Link
            href="/track-order"
            className="hidden items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 md:flex"
            aria-label="Track Order"
          >
            <Package className="h-4 w-4" />
            Track Order
          </Link>
          <Link
            href="/offers"
            className="hidden items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-white hover:bg-accent-300 md:flex"
            aria-label="Special Offer"
          >
            <Gift className="h-4 w-4" />
            Special Offer
          </Link>
          <Link href="/account" className="hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:block" aria-label="Wishlist">
            <Heart className="h-5 w-5" />
          </Link>
          <button
            onClick={toggleCart}
            className="relative flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            aria-label={`Cart${totalItems > 0 ? `, ${totalItems} items` : ""}`}
          >
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="border-t border-slate-200 bg-bg-card md:hidden">
          <nav className="flex flex-col gap-1 px-4 py-4" aria-label="Mobile navigation">
            {MAIN_NAV.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`rounded-lg px-3 py-3 text-sm font-semibold ${
                  isActive(href, pathname) ? "bg-primary/10 text-primary" : "text-slate-700"
                }`}
              >
                {label}
              </Link>
            ))}
            <Link href="/track-order" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-3 text-sm font-medium text-slate-600">
              Track Order
            </Link>
            <Link href="/offers" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-3 text-sm font-medium text-slate-600">
              Special Offer
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}
