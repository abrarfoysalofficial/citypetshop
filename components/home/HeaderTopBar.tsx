"use client";

import Link from "next/link";
import { Phone, Heart, User } from "lucide-react";

export default function HeaderTopBar() {
  return (
    <div className="hidden border-b border-white/10 bg-[var(--header-bg)] md:block">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2 text-sm sm:px-6 lg:px-8">
        <p className="text-white/80">Welcome to City Plus Pet Shop</p>
        <div className="flex items-center gap-6">
          <a href="tel:+8801643390045" className="flex items-center gap-1.5 font-medium text-white/90 transition-colors hover:text-[var(--teal-from)]" aria-label="Hotline 01643-390045">
            <Phone className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">Hotline:</span> 01643-390045
          </a>
          <Link href="/account" className="flex items-center gap-1.5 text-white/90 transition-colors hover:text-[var(--teal-from)]" title="Wishlist" aria-label="Wishlist">
            <Heart className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">Wishlist</span>
          </Link>
          <Link href="/login" className="flex items-center gap-1.5 text-white/90 transition-colors hover:text-[var(--teal-from)]" aria-label="Login or Register">
            <User className="h-4 w-4 shrink-0" />
            Login / Register
          </Link>
        </div>
      </div>
    </div>
  );
}
