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
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900">My Account</h1>
        <AccountNav />
      </div>
      <nav className="mt-4 flex flex-wrap gap-4 border-b border-slate-200 pb-4">
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="font-medium text-primary hover:underline"
          >
            {label}
          </Link>
        ))}
      </nav>
      <div className="mt-8">{children}</div>
    </div>
  );
}
