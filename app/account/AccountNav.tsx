"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";

export function AccountNav() {
  return (
    <div className="flex items-center gap-2">
      <Link
        href="/logout"
        className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
      >
        <LogOut className="h-4 w-4" /> Logout
      </Link>
    </div>
  );
}
