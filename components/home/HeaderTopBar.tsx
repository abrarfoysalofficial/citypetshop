"use client";

import Link from "next/link";
import { Phone, Heart, User } from "lucide-react";

export default function HeaderTopBar() {
  return (
    <div className="border-b border-slate-200 bg-slate-50">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2 text-sm sm:px-6 lg:px-8">
        <p className="text-slate-600">Welcome to City Plus Pet Shop</p>
        <div className="flex items-center gap-4">
          <a href="tel:+8801643390045" className="flex items-center gap-1.5 font-medium text-slate-800 hover:text-primary">
            <Phone className="h-4 w-4" />
            <span className="hidden sm:inline">Hotline:</span> 01643-390045
          </a>
          <Link href="/account" className="flex items-center gap-1.5 text-slate-700 hover:text-primary" title="Wishlist">
            <Heart className="h-4 w-4" />
            <span className="hidden sm:inline">Wishlist</span>
          </Link>
          <Link href="/login" className="flex items-center gap-1.5 text-slate-700 hover:text-primary">
            <User className="h-4 w-4" />
            Login / Register
          </Link>
        </div>
      </div>
    </div>
  );
}
