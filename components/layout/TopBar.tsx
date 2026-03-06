"use client";

import Link from "next/link";
import { Phone, Truck, Heart, User, ChevronDown } from "lucide-react";

export default function TopBar() {
  return (
    <div className="hidden border-b border-white/10 bg-[var(--header-bg)] md:block">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-3 py-2 text-sm sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <p className="text-white/80">Welcome to City Plus Pet Shop</p>
          <a
            href="tel:+8801643390045"
            className="flex items-center gap-1.5 font-medium text-white/90 transition-colors hover:text-[var(--teal-from)]"
            aria-label="Hotline 01643-390045"
          >
            <Phone className="h-4 w-4 shrink-0" />
            <span>Hotline: 01643-390045</span>
          </a>
          <span className="hidden items-center gap-1.5 text-white/70 lg:flex">
            <Truck className="h-4 w-4 shrink-0" />
            Free delivery on orders over ৳2000
          </span>
        </div>
        <div className="flex items-center gap-6">
          <Link
            href="/account"
            className="flex items-center gap-1.5 text-white/90 transition-colors hover:text-[var(--teal-from)]"
            aria-label="Wishlist"
          >
            <Heart className="h-4 w-4 shrink-0" />
            <span>Wishlist</span>
          </Link>
          <Link
            href="/account"
            className="flex items-center gap-1.5 text-white/90 transition-colors hover:text-[var(--teal-from)]"
            aria-label="My Account"
          >
            <User className="h-4 w-4 shrink-0" />
            <span>Account</span>
            <ChevronDown className="h-3.5 w-3.5 opacity-70" />
          </Link>
          <Link
            href="/login"
            className="text-white/90 transition-colors hover:text-[var(--teal-from)]"
          >
            Login / Register
          </Link>
        </div>
      </div>
    </div>
  );
}
