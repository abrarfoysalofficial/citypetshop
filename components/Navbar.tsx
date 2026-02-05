"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Search,
  Gift,
  ShoppingCart,
  User,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useCategories } from "@/context/CategoriesContext";
import { useState, useRef, useEffect } from "react";

const MAIN_NAV = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/combo-offers", label: "Combo Offer" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact Us" },
] as const;

function isActive(href: string, pathname: string | null): boolean {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function Navbar() {
  const pathname = usePathname();
  const { totalItems, toggleCart } = useCart();
  const { navCategories } = useCategories();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/shop?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-50 w-full bg-slate-900 shadow-lg">
      {/* Top Bar */}
      <div className="mx-auto flex h-14 max-w-content items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        {/* Mobile Menu */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex shrink-0 items-center justify-center rounded-lg p-2 text-white hover:bg-white/10 lg:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Logo */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2"
        >
          <Image
            src="/brand/logo.png"
            alt="City Plus Pet Shop"
            width={40}
            height={40}
            className="h-9 w-9 object-contain sm:h-10 sm:w-10"
          />
          <span className="text-base font-bold text-white sm:text-lg">City Plus Pet Shop</span>
        </Link>

        {/* Search Bar - Center (Desktop) */}
        <form
          onSubmit={handleSearch}
          className="hidden flex-1 max-w-xl mx-4 lg:flex rounded-lg overflow-hidden border border-gray-200 bg-white shadow-sm"
        >
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search product, brand, and more..."
            className="flex-1 min-w-0 px-4 py-2.5 text-gray-900 placeholder-gray-500 outline-none text-sm"
          />
          <button
            type="submit"
            className="flex shrink-0 items-center gap-2 bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
          >
            <Search className="h-5 w-5" />
            Search
          </button>
        </form>

        {/* Right Icons */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          {(process.env.NEXT_PUBLIC_AUTH_MODE ?? "demo") === "demo" && (
            <span className="hidden rounded-full bg-amber-500 px-2 py-0.5 text-xs font-medium text-white sm:inline-block" title="Demo mode – localhost only">
              Demo
            </span>
          )}
          <Link
            href="/offers"
            className="flex flex-col items-center rounded-lg p-2 text-white hover:bg-white/10 sm:flex-row sm:gap-1.5"
            title="Offers"
          >
            <Gift className="h-5 w-5 sm:h-6 sm:w-6" />
            <span className="hidden text-xs font-medium sm:inline">Offers</span>
          </Link>
          <button
            onClick={toggleCart}
            className="relative flex flex-col items-center rounded-lg p-2 text-white hover:bg-white/10 sm:flex-row sm:gap-1.5"
            aria-label="Open cart"
          >
            <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
            {totalItems > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
            <span className="hidden text-xs font-medium sm:inline">Cart</span>
          </button>
          <Link
            href="/account"
            className="flex flex-col items-center rounded-lg p-2 text-white hover:bg-white/10 sm:flex-row sm:gap-1.5"
            title="My Account"
          >
            <User className="h-5 w-5 sm:h-6 sm:w-6" />
            <span className="hidden text-xs font-medium sm:inline">Account</span>
          </Link>
        </div>
      </div>

      {/* Mobile Search (below logo on small screens) */}
      <form
        onSubmit={handleSearch}
        className="flex lg:hidden mx-4 mb-3 rounded-lg overflow-hidden border border-gray-200 bg-white"
      >
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search product, brand, and more..."
          className="flex-1 min-w-0 px-3 py-2 text-gray-900 placeholder-gray-500 outline-none text-sm"
        />
        <button
          type="submit"
          className="flex shrink-0 items-center gap-1 bg-accent px-3 py-2 text-white"
        >
          <Search className="h-5 w-5" />
        </button>
      </form>

      {/* Main Nav - Desktop: HOME | SHOP | COMBO OFFER | BLOG | ABOUT US | CONTACT US */}
      <nav className="hidden border-t border-white/10 bg-white lg:block" aria-label="Main navigation">
        <div className="mx-auto flex max-w-content items-center justify-center gap-1 px-4 py-3 sm:gap-2 sm:px-6 lg:px-8">
          {MAIN_NAV.map(({ href, label }) => {
            const active = isActive(href, pathname) || (href === "/shop" && pathname?.startsWith("/category"));
            return (
              <Link
                key={href}
                href={href}
                prefetch
                className={`rounded px-3 py-2 text-xs font-semibold uppercase tracking-wide transition-colors sm:text-sm ${
                  active
                    ? "border-b-2 border-accent text-accent"
                    : "text-slate-700 hover:text-accent"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="absolute left-0 right-0 top-full z-50 max-h-[calc(100vh-8rem)] overflow-y-auto overscroll-contain border-t border-white/10 bg-slate-900 lg:hidden">
          <div className="mx-auto max-w-content space-y-1 px-4 py-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/60">Menu</p>
            {MAIN_NAV.map(({ href, label }) => {
              const active = isActive(href, pathname) || (href === "/shop" && pathname?.startsWith("/category"));
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={`block rounded-lg px-3 py-2.5 text-sm font-semibold uppercase tracking-wide ${
                    active ? "bg-accent/20 text-accent" : "text-white hover:bg-white/10"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
            <div className="my-4 border-t border-white/10 pt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/60">Categories</p>
              {navCategories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-white hover:bg-white/10"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
