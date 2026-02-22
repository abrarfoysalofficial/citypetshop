import Link from "next/link";
import type { Metadata } from "next";
import { AccountNav } from "./AccountNav";

export const metadata: Metadata = {
  title: "My Account | City Plus Pet Shop",
  description: "Manage your profile, orders, and returns.",
};

const links = [
  { href: "/account", label: "Dashboard" },
  { href: "/account/orders", label: "Orders" },
  { href: "/account/invoices", label: "Invoices" },
  { href: "/account/returns", label: "Returns & Refunds" },
];

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-6xl px-3 py-5 sm:px-4 sm:py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">My Account</h1>
        <AccountNav />
      </div>
      <nav className="mt-3 flex gap-2 overflow-x-auto pb-4 sm:mt-4 sm:flex-wrap sm:gap-4" aria-label="Account sections">
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="shrink-0 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-primary hover:text-primary sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:text-base"
          >
            {label}
          </Link>
        ))}
      </nav>
      <div className="mt-6 sm:mt-8">{children}</div>
    </div>
  );
}
