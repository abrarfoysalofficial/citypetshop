"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";

const AUTH_MODE = (process.env.NEXT_PUBLIC_AUTH_MODE as "demo" | "supabase") ?? "demo";

export function AccountNav() {
  return (
    <div className="flex items-center gap-2">
      {AUTH_MODE === "demo" && (
        <span className="rounded-full bg-amber-500 px-2.5 py-1 text-xs font-medium text-white">
          Demo Mode
        </span>
      )}
      <Link
        href="/logout"
        className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
      >
        <LogOut className="h-4 w-4" /> Logout
      </Link>
    </div>
  );
}
