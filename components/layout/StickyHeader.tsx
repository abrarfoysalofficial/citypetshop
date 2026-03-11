"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, ShoppingCart } from "lucide-react";
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

export default function StickyHeader() {
  const pathname = usePathname();
  const { totalItems, toggleCart } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <div className="border-b border-white/10 bg-[var(--header-bg)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-3 py-3 md:px-6 lg:px-8">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-lg p-2 text-white/90 hover:bg-white/10 md:hidden"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Image
            src="/ui/blog-cover.svg"
            alt="City Plus Pet Shop"
            width={44}
            height={44}
            className="h-9 w-9 shrink-0 object-contain md:h-10 md:w-10"
          />
          <span className="text-base font-bold text-white md:text-lg">City Plus</span>
        </Link>

        <nav className="hidden gap-1 lg:flex" aria-label="Main navigation">
          {MAIN_NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`rounded px-3 py-2 text-sm font-semibold transition-colors ${
                isActive(href, pathname) ? "text-[var(--teal-from)]" : "text-white/90 hover:text-white"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <button
          onClick={toggleCart}
          className="relative flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-lg p-2 text-white/90 hover:bg-white/10"
          aria-label={totalItems > 0 ? `Cart, ${totalItems} items` : "Cart"}
        >
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
              {totalItems > 99 ? "99+" : totalItems}
            </span>
          )}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/10 bg-[var(--header-bg)] md:hidden">
          <nav className="flex flex-col gap-1 px-4 py-4" aria-label="Mobile navigation">
            {MAIN_NAV.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`rounded-lg px-3 py-3 text-sm font-semibold ${
                  isActive(href, pathname) ? "bg-white/20 text-[var(--teal-from)]" : "text-white/90"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
